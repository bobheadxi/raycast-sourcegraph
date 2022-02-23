import SelfHostedCommand from "./components/SelfHostedCommand";
import ViewBatchChanges from "./components/ViewBatchChangesCommand";

export default function ViewBatchChangesSelfHosted() {
  return <SelfHostedCommand command={(src) => ViewBatchChanges(src)} />;
}
