import SearchCommand from "./components/SearchCommand";
import { sourcegraphCloud } from "./sourcegraph";

export default function SearchCloud() {
  return SearchCommand(sourcegraphCloud());
}
