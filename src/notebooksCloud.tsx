import NotebooksCommand from "./components/notebooks";
import { sourcegraphCloud } from "./sourcegraph";

export default function SearchCloud() {
  const src = sourcegraphCloud();
  return NotebooksCommand(src);
}
