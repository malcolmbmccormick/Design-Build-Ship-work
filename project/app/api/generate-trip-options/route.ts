import { NextResponse } from "next/server";
import { generateTripOptions, validateGenerateTripRequest } from "@/lib/trips";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = validateGenerateTripRequest(body);

    await sleep(350);

    return NextResponse.json(generateTripOptions(input));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to generate trip options.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
