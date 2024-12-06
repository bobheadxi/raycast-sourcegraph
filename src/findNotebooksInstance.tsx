import FindNotebooksCommand from "./components/FindNotebooksCommand";
import InstanceCommand from "./components/InstanceCommand";

export default async function FindNotebooksSelfHosted() {
  return <InstanceCommand Command={FindNotebooksCommand} />;
}
