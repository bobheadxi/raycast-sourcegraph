import FindNotebooksCommand from "./components/findNotebooks";
import { sourcegraphCloud } from "./sourcegraph";

export default function SearchCloud() {
  const src = sourcegraphCloud();
  return FindNotebooksCommand(src);
}
