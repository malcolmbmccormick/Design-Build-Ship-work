import { createClient } from "@supabase/supabase-js";
import type { FeedStatus, TrainPosition } from "../../../packages/shared/dist/index.js";
import { getWorkerEnv } from "./env";
import { fetchTrainPositions } from "./cta";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runPoll() {
  const env = getWorkerEnv();
  const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const pollStartedAt = new Date().toISOString();

  try {
    const { positions } = await fetchTrainPositions({
      apiBaseUrl: env.ctaApiBaseUrl,
      apiKey: env.ctaApiKey,
      routeIds: env.routeIds
    });

    if (positions.length) {
      const { error: upsertError } = await supabase.from("train_positions").upsert(
        positions.map((position) => ({
          ...position,
          updated_at: new Date().toISOString()
        })),
        { onConflict: "id" }
      );

      if (upsertError) {
        throw upsertError;
      }
    }

    const staleBefore = new Date(Date.now() - env.pollIntervalMs * 3).toISOString();
    const { error: deleteError } = await supabase
      .from("train_positions")
      .delete()
      .lt("last_seen_at", staleBefore);

    if (deleteError) {
      throw deleteError;
    }

    const status: FeedStatus = {
      feed_name: "cta_train_positions",
      last_polled_at: pollStartedAt,
      last_success_at: new Date().toISOString(),
      last_error: null,
      route_count: env.routeIds.length,
      train_count: positions.length,
      updated_at: new Date().toISOString()
    };

    const { error: statusError } = await supabase
      .from("feed_statuses")
      .upsert(status, { onConflict: "feed_name" });

    if (statusError) {
      throw statusError;
    }

    console.log(`[worker] synced ${positions.length} trains at ${new Date().toISOString()}`);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : JSON.stringify(error, null, 2);
    console.error("[worker] poll failed", error);

    await supabase.from("feed_statuses").upsert(
      {
        feed_name: "cta_train_positions",
        last_polled_at: pollStartedAt,
        last_error: message,
        route_count: env.routeIds.length,
        updated_at: new Date().toISOString()
      },
      { onConflict: "feed_name" }
    );

    throw error;
  }
}

async function main() {
  const runOnce = process.argv.includes("--once");

  if (runOnce) {
    await runPoll();
    return;
  }

  while (true) {
    try {
      await runPoll();
    } catch {
      // Keep the worker alive on transient feed or network failures.
    }

    await sleep(getWorkerEnv().pollIntervalMs);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
