import { PlannerExperience } from "@/components/planner-experience";
import { isClerkConfigured } from "@/lib/auth-config";
import { generateTripOptions, getDefaultTripRequest } from "@/lib/trips";

export default function Home() {
  const initialRequest = getDefaultTripRequest();
  const initialResults = generateTripOptions(initialRequest);
  const authEnabled = isClerkConfigured();

  return (
    <PlannerExperience
      authEnabled={authEnabled}
      initialMeta={initialResults.meta}
      initialOptions={initialResults.options}
      initialRequest={initialRequest}
    />
  );
}
