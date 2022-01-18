import {
  ActionPanel,
  CopyToClipboardAction,
  List,
  OpenInBrowserAction,
  showToast,
  ToastStyle,
  randomId,
  PushAction,
  Detail,
  Color,
  Icon,
  ImageLike,
} from "@raycast/api";
import { useState, useRef } from "react";

import sourcegraph from "./sourcegraph";
import { performSearch, SearchResult, Suggestion } from "./stream-search";

export default function Command() {
  const { state, search } = useSearch();

  return (
    <List isLoading={state.isLoading} onSearchTextChange={search} searchBarPlaceholder={"Search..."} throttle>
      {/* <List.Section title="Suggestions">
        {state.suggestions.slice(0, 3).map((suggestion) => (
          <SuggestionItem key={randomId()} suggestion={suggestion} />
        ))}
      </List.Section> */}
      <List.Section title="Results" subtitle={state.summary || ""}>
        {state.results.map((searchResult) => (
          <SearchResultItem key={randomId()} searchResult={searchResult} searchText={state.searchText} />
        ))}
      </List.Section>
    </List>
  );
}

function resultActions(searchResult: SearchResult, extraActions?: JSX.Element[]) {
  let actions = [
    <OpenInBrowserAction key={randomId()} title="Open result in Sourcegraph" url={searchResult.url} />,
    // Can't seem to override the shortcut on this thing?
    // (<CopyToClipboardAction
    //   key={randomId()}
    //   title="Copy link to result"
    //   content={searchResult.url}
    //   shortcut={{ modifiers: ["opt"], key: "c" }}
    // />),
  ];
  if (extraActions) {
    actions = actions.concat(...extraActions);
  }
  return (
    <ActionPanel.Section key={randomId()} title="Result actions">
      {...actions}
    </ActionPanel.Section>
  );
}

function SearchResultItem({ searchResult, searchText }: { searchResult: SearchResult; searchText: string }) {
  const { match } = searchResult;
  let title = "";
  let subtitle = match.repository;
  const icon: ImageLike = { source: Icon.Dot, tintColor: Color.Blue };
  switch (match.type) {
    case "repo":
      title = match.repository;
      subtitle = match.description || "Repository match";
      icon.tintColor = match.private ? Color.Yellow : icon.tintColor;
      break;
    case "commit":
      icon.source = Icon.Message;
      title = match.content;
      break;
    case "content":
      icon.source = Icon.Text;
      title = match.lineMatches.map((l) => l.line.trim()).join(" ... ");
      break;
    case "path":
      icon.source = Icon.TextDocument;
      title = match.path;
      break;
    case "symbol":
      icon.source = Icon.Link;
      title = match.symbols.map((s) => s.name).join(", ");
      break;
  }

  const queryURL = `${sourcegraph().instance}?q=${encodeURIComponent(searchText)}`;
  return (
    <List.Item
      title={title}
      subtitle={subtitle}
      accessoryTitle={searchResult.match.type}
      icon={icon}
      actions={
        <ActionPanel>
          {resultActions(searchResult, [
            <PushAction
              key={randomId()}
              title="Peek result details"
              target={<PeekSearchResult searchResult={searchResult} />}
              icon={{ source: Icon.MagnifyingGlass }}
              shortcut={{ modifiers: ["cmd"], key: "enter" }}
            />,
          ])}
          <ActionPanel.Section key={randomId()} title="Query actions">
            <OpenInBrowserAction
              title="Open query in Sourcegraph"
              url={queryURL}
              shortcut={{ modifiers: ["cmd", "shift"], key: "enter" }}
            />
            <CopyToClipboardAction
              title="Copy link to query in Sourcegraph"
              content={queryURL}
              // shortcut={{ modifiers: ["cmd", "shift"], key: "l" }}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}

function PeekSearchResult({ searchResult }: { searchResult: SearchResult }) {
  const { match } = searchResult;

  let body = "";
  switch (match.type) {
    case "repo":
      body = `# ${match.repository}

${match.description}`;
      break;

    case "content":
      body = `# ${match.repository}

## \`${match.path}\`

${match.lineMatches
  .map(
    (l) => `\`\`\`
${l.line}
\`\`\``
  )
  .join("\n\n")}`;
      break;

    case "symbol":
      body = `# ${match.repository}

## \`${match.path}\`

${match.symbols
  .map((s) => `- [\`${s.containerName ? `${s.containerName}::` : "" + s.name}\`](${sourcegraph().instance}${s.url})`)
  .join("\n")}`;
      break;

    default:
      body = `
\`\`\`
${JSON.stringify(match, null, "  ")}
\`\`\`
`;
  }

  return (
    <Detail
      navigationTitle={`Peek ${match.type} result`}
      markdown={body}
      actions={<ActionPanel>{resultActions(searchResult)}</ActionPanel>}
    ></Detail>
  );
}

// function SuggestionItem({ suggestion } : { suggestion: Suggestion }) {
//   return (
//     <List.Item
//       title={suggestion.title}
//       subtitle={suggestion.description}
//       actions={(
//         <ActionPanel>
//         <ActionPanelItem
//           title="Copy suggestion"
//           onAction={async () => {
//             await copyTextToClipboard(` ${suggestion.query}`)
//             showToast(ToastStyle.Success, "Suggestion copied - paste it to continue searching!");
//           }} />
//       </ActionPanel>
//       )} />
//   )
// }

interface SearchState {
  searchText: string;
  results: SearchResult[];
  suggestions: Suggestion[];
  summary: string | null;
  isLoading: boolean;
}

function useSearch() {
  const [state, setState] = useState<SearchState>({
    searchText: "",
    results: [],
    suggestions: [],
    summary: "",
    isLoading: false,
  });
  const cancelRef = useRef<AbortController | null>(null);

  async function search(searchText: string) {
    cancelRef.current?.abort();
    cancelRef.current = new AbortController();
    try {
      setState((oldState) => ({
        ...oldState,
        searchText: searchText,
        results: [],
        suggestions: [],
        summary: null,
        isLoading: true,
      }));
      await performSearch(searchText, sourcegraph(), cancelRef.current.signal, {
        onResults: (results) => {
          setState((oldState) => ({
            ...oldState,
            results: oldState.results.concat(results),
          }));
        },
        onSuggestions: () => {
          // TODO suggestions are not great, re-evaluate whether or not to have them
          // setState((oldState) => ({
          //   ...oldState,
          //   suggestions: pushToTop
          //     ? suggestions.concat(oldState.suggestions)
          //     : oldState.suggestions.concat(suggestions),
          // }));
        },
        onAlert: (alert) => {
          showToast(ToastStyle.Failure, alert.title, alert.description);
        },
        onProgress: (progress) => {
          setState((oldState) => ({
            ...oldState,
            summary: `${progress.matchCount} results in ${progress.duration}`,
          }));
        },
      });
      setState((oldState) => ({
        ...oldState,
        isLoading: false,
      }));
    } catch (error) {
      showToast(ToastStyle.Failure, "Search failed", String(error));

      setState((oldState) => ({
        ...oldState,
        isLoading: false,
      }));
    }
  }

  return {
    state: state,
    search: search,
  };
}
