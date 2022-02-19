import FindNotebooksCommand from "./components/FindNotebooksCommand";
import { sourcegraphCloud } from "./sourcegraph";

export default function FindNotebooksCloud() {
  return FindNotebooksCommand(sourcegraphCloud());
}
