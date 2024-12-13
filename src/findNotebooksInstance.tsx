import FindNotebooksCommand from "./components/FindNotebooksCommand";
import InstanceCommand from "./components/InstanceCommand";

export default async function FindNotebooksInstance() {
  return <InstanceCommand Command={FindNotebooksCommand} />;
}
