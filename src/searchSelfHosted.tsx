import SearchCommand from "./components/SearchCommand";
import SelfHostedCommand from "./components/SelfHostedCommand";

export default function SearchSelfHosted() {
  return <SelfHostedCommand command={(src) => SearchCommand(src)} />;
}
