import { useParams } from "react-router-dom";
import CareerExplorer from "@/pages/CareerExplorer";

// Wrapper that forces the CareerExplorer to remount whenever :title changes
// so its useEffect re-runs and fetches the new career deep-dive.
export default function CareerExplorerRoute() {
  const { title } = useParams();
  return <CareerExplorer key={title} />;
}
