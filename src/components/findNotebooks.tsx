import {
  ActionPanel,
  List,
  OpenInBrowserAction,
  showToast,
  ToastStyle,
  Color,
  Icon,
  useNavigation,
  randomId,
} from "@raycast/api";
import { useState, useRef, useEffect } from "react";
import { DateTime } from "luxon";

import { Sourcegraph, instanceName } from "../sourcegraph";
import { findNotebooks, SearchNotebook } from "../sourcegraph/gql";
import checkAuthEffect from "../hooks/checkAuthEffect";

export default function FindNotebooksCommand(src: Sourcegraph) {
  const { state, find } = useNotebooks(src);
  const srcName = instanceName(src);
  const nav = useNavigation();

  useEffect(checkAuthEffect(src, nav));

  return (
    <List
      isLoading={state.isLoading}
      onSearchTextChange={find}
      searchBarPlaceholder={`Find search notebooks on ${srcName}`}
      throttle
    >
      <List.Section title={state.searchText ? "Results" : "Starred"} subtitle={`${state.notebooks.length} results`}>
        {state.notebooks.map((n) => (
          <NotebookResultItem key={randomId()} notebook={n} src={src} />
        ))}
      </List.Section>
    </List>
  );
}

function NotebookResultItem({ notebook, src }: { notebook: SearchNotebook; src: Sourcegraph }) {
  let updated: string | null = null;
  try {
    const d = DateTime.fromISO(notebook.updatedAt);
    updated = d.toRelative();
  } catch (e) {
    console.warn(`notebook ${notebook.id}: invalid date: ${e}`);
  }
  const stars = notebook.stars?.totalCount || 0;
  const author = notebook.creator.displayName || notebook.creator.username;
  return (
    <List.Item
      title={notebook.title}
      subtitle={updated ? `${author}, updated ${updated}` : author}
      accessoryTitle={stars ? `${stars}` : ""}
      accessoryIcon={
        notebook.stars?.totalCount
          ? {
              source: Icon.Star,
            }
          : undefined
      }
      icon={{
        source: notebook.viewerHasStarred ? Icon.Star : Icon.Dot,
        tintColor: notebook.public ? Color.Blue : Color.Yellow,
      }}
      actions={
        <ActionPanel>
          <OpenInBrowserAction key={randomId()} url={`${src.instance}/notebooks/${notebook.id}`} />
        </ActionPanel>
      }
    />
  );
}

interface NotebooksState {
  searchText: string;
  notebooks: SearchNotebook[];
  isLoading: boolean;
}

function useNotebooks(src: Sourcegraph) {
  const [state, setState] = useState<NotebooksState>({
    searchText: "",
    notebooks: [],
    isLoading: false,
  });
  const cancelRef = useRef<AbortController | null>(null);

  useEffect(() => {
    find(); // initial load
  }, []);

  async function find(searchText?: string) {
    cancelRef.current?.abort();
    cancelRef.current = new AbortController();

    try {
      setState((oldState) => ({
        ...oldState,
        searchText: searchText || "",
        notebooks: [],
        isLoading: true,
      }));

      const resp = await findNotebooks(cancelRef.current.signal, src, searchText);
      setState((oldState) => ({
        ...oldState,
        notebooks: resp?.notebooks?.nodes || [],
        isLoading: false,
      }));
    } catch (error) {
      showToast(ToastStyle.Failure, "Find notebooks failed", String(error));

      setState((oldState) => ({
        ...oldState,
        isLoading: false,
      }));
    }
  }

  return { state, find };
}
