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
  copyTextToClipboard,
  ActionPanelItem,
} from "@raycast/api";
import { useState, useRef, Fragment } from "react";

import sourcegraph from "./sourcegraph";
import { performSearch, SearchResult, Suggestion } from "./stream-search";

export default function Command() {
  const { state, search } = useSearch();

  return (
    <List isLoading={state.isLoading} onSearchTextChange={search} searchBarPlaceholder={"Search..."} throttle>
      {/* show suggestions IFF no results */}
      {!state.isLoading && state.results.length === 0 ? (
        <List.Section title="Suggestions" subtitle={state.summary || "No results found"}>
          {state.suggestions.slice(0, 3).map((suggestion) => (
            <SuggestionItem key={randomId()} suggestion={suggestion} />
          ))}

          {
            /* add a link to query syntax reference alongside other suggestions */
            state.suggestions.length > 0 ? (
              <List.Item
                title="View search query syntax reference"
                icon={{ source: Icon.Globe }}
                actions={
                  <ActionPanel>
                    <OpenInBrowserAction url="https://docs.sourcegraph.com/code_search/reference/queries"></OpenInBrowserAction>
                  </ActionPanel>
                }
              />
            ) : (
              <Fragment />
            )
          }
        </List.Section>
      ) : (
        <Fragment />
      )}

      {/* results */}
      <List.Section title="Results" subtitle={state.summary || ""}>
        {state.results.map((searchResult) => (
          <SearchResultItem key={randomId()} searchResult={searchResult} searchText={state.searchText} />
        ))}
      </List.Section>
    </List>
  );
}

function resultActions(searchResult: SearchResult, extraActions?: JSX.Element[]) {
  const actions: JSX.Element[] = [<OpenInBrowserAction key={randomId()} title="Open Result" url={searchResult.url} />];
  if (extraActions) {
    actions.push(...extraActions);
  }
  actions.push(
    // Can't seem to override the shortcut on this thing if it's the second action, so
    // add it as the third action instead.
    <CopyToClipboardAction
      key={randomId()}
      title="Copy Link to Result"
      content={searchResult.url}
      shortcut={{ modifiers: ["cmd"], key: "c" }}
    />
  );
  return (
    <ActionPanel.Section key={randomId()} title="Result Actions">
      {...actions}
    </ActionPanel.Section>
  );
}

function SearchResultItem({ searchResult, searchText }: { searchResult: SearchResult; searchText: string }) {
  const src = sourcegraph();
  const { match } = searchResult;
  let title = "";
  let subtitle = "";
  let context = match.repository;

  const icon: ImageLike = { source: Icon.Dot, tintColor: Color.Blue };
  switch (match.type) {
    case "repo":
      if (match.fork) {
        icon.source = Icon.Circle;
      }
      if (match.archived) {
        icon.source = Icon.XmarkCircle;
      }
      // TODO color results of all matches based on repo privacy
      if (match.private) {
        icon.tintColor = Color.Yellow;
      }
      title = match.repository;
      subtitle = match.description || "Repository match";
      context = match.repoStars ? `${match.repoStars} stars` : "";
      break;
    case "commit":
      icon.source = Icon.Message;
      title = match.label;
      // just get the date
      subtitle = match.detail.split(" ").slice(1).join(" ");
      break;
    case "path":
      icon.source = Icon.TextDocument;
      title = match.path;
      break;
    case "content":
      icon.source = Icon.Text;
      title = match.lineMatches.map((l) => l.line.trim()).join(" ... ");
      subtitle = match.path;
      break;
    case "symbol":
      icon.source = Icon.Link;
      title = match.symbols.map((s) => s.name).join(", ");
      subtitle = match.path;
      break;
  }

  const queryURL = `${src.instance}?q=${encodeURIComponent(searchText)}`;
  return (
    <List.Item
      title={title}
      subtitle={subtitle}
      accessoryTitle={context}
      icon={icon}
      actions={
        <ActionPanel>
          {resultActions(searchResult, [
            <PushAction
              key={randomId()}
              title="Peek Result Details"
              target={<PeekSearchResult searchResult={searchResult} />}
              icon={{ source: Icon.MagnifyingGlass }}
              shortcut={{ modifiers: ["cmd"], key: "enter" }}
            />,
          ])}
          <ActionPanel.Section key={randomId()} title="Query Actions">
            <OpenInBrowserAction
              title="Open Query"
              url={queryURL}
              shortcut={{ modifiers: ["cmd", "shift"], key: "enter" }}
            />
            <CopyToClipboardAction
              title="Copy Link to Query"
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
  const src = sourcegraph();
  const { match } = searchResult;

  let body = "";
  switch (match.type) {
    case "repo":
      body = `# ${match.repository}

> ${match.type} match on repository with ${match.repoStars ? `with ${match.repoStars} stars` : ""}

${match.description}`;
      break;

    case "content":
      body = `# ${match.repository}

> ${match.type} match in \`${match.path}\` ${match.repoStars ? `in repository with ${match.repoStars} stars` : ""}

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

> ${match.type} match in \`${match.path}\` ${match.repoStars ? `in repository with ${match.repoStars} stars` : ""}

${match.symbols
  .map((s) => `- [\`${s.containerName ? `${s.containerName} > ` : ""}${s.name}\`](${src.instance}${s.url})`)
  .join("\n")}`;
      break;

    case "path":
      body = `# ${match.repository}
      
> ${match.type} match

\`${match.path}\`
`;
      break;

    case "commit":
      body = `# ${match.repository}
      
> ${match.type} match in ${match.detail} ${match.repoStars ? `in repository with ${match.repoStars} stars` : ""}

${match.label}

${match.content}
`;
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

function SuggestionItem({ suggestion }: { suggestion: Suggestion }) {
  return (
    <List.Item
      title={suggestion.title}
      subtitle={suggestion.description}
      icon={{ source: suggestion.query ? Icon.Clipboard : Icon.ExclamationMark }}
      actions={
        suggestion.query ? (
          <ActionPanel>
            <ActionPanelItem
              title="Copy Suggestion"
              onAction={async () => {
                await copyTextToClipboard(` ${suggestion.query}`);
                showToast(ToastStyle.Success, "Suggestion copied - paste it to continue searching!");
              }}
            />
          </ActionPanel>
        ) : (
          <ActionPanel>
            <PushAction
              key={randomId()}
              title="View Suggestion"
              target={
                <Detail
                  markdown={`${suggestion.title}${suggestion.description ? `\n\n${suggestion.description}` : ""}`}
                  navigationTitle="Suggestion"
                />
              }
              icon={{ source: Icon.MagnifyingGlass }}
            />
          </ActionPanel>
        )
      }
    />
  );
}

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
        onSuggestions: (suggestions, pushToTop) => {
          setState((oldState) => ({
            ...oldState,
            suggestions: pushToTop
              ? suggestions.concat(oldState.suggestions)
              : oldState.suggestions.concat(suggestions),
          }));
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
