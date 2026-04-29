import { PlannerExperience } from "@/components/planner-experience";
import { generateTripOptions, getDefaultTripRequest } from "@/lib/trips";

export default function Home() {
  const initialRequest = getDefaultTripRequest();
  const initialResults = generateTripOptions(initialRequest);

  return (
    <PlannerExperience
      initialMeta={initialResults.meta}
      initialOptions={initialResults.options}
      initialRequest={initialRequest}
    />
  );
}
