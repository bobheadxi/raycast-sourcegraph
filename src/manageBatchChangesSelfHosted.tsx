import SelfHostedCommand from "./components/SelfHostedCommand";
import ManageBatchChanges from "./components/ManageBatchChangesCommand";

export default function ManageBatchChangesSelfHosted() {
  return <SelfHostedCommand command={(src) => ManageBatchChanges(src)} />;
}