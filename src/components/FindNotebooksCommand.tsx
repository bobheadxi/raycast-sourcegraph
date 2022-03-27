import { ActionPanel, List, Action, Icon, Detail, useNavigation } from "@raycast/api";
import { useState, Fragment, useMemo } from "react";
import { DateTime } from "luxon";
import { nanoid } from "nanoid";
import { useQuery } from "@apollo/client";

import { Sourcegraph, instanceName } from "../sourcegraph";
import { copyShortcut } from "./shortcuts";
import { ColorDefault, ColorEmphasis, ColorPrivate } from "./colors";
import ExpandableErrorToast from "./ExpandableErrorToast";
import { GET_NOTEBOOKS } from "../sourcegraph/gql/queries";
import {
  GetNotebooksVariables,
  GetNotebooks,
  SearchNotebookFields as SearchNotebook,
  NotebooksOrderBy,
} from "../sourcegraph/gql/schema";

/**
 * FindNotebooksCommand is the shared search notebooks command.
 */
export default function FindNotebooksCommand({ src }: { src: Sourcegraph }) {
  const [searchText, setSearchText] = useState("");
  const { loading, error, data } = useQuery<GetNotebooks, GetNotebooksVariables>(GET_NOTEBOOKS, {
    variables: {
      query: searchText,
      orderBy: searchText ? NotebooksOrderBy.NOTEBOOK_STAR_COUNT : NotebooksOrderBy.NOTEBOOK_UPDATED_AT,
    },
  });
  const notebooks = useMemo(() => data?.notebooks.nodes, [data]);

  const { push } = useNavigation();
  if (error) {
    ExpandableErrorToast(push, "Unexpected error", "Find notebooks failed", error.message).show();
  }

  const srcName = instanceName(src);
  const length = notebooks?.length || 0;
  return (
    <List
      isLoading={loading}
      onSearchTextChange={setSearchText}
      searchText={searchText}
      searchBarPlaceholder={`Find search notebooks on ${srcName}`}
      selectedItemId={length > 0 ? "first-result" : undefined}
      throttle
    >
      {!loading && !searchText ? (
        <List.Section title={"Suggestions"}>
          <List.Item
            title="Create a search notebook"
            icon={{ source: Icon.Plus }}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser title="Create in Browser" url={`${src.instance}/notebooks/new`} />
              </ActionPanel>
            }
          />
        </List.Section>
      ) : (
        <Fragment />
      )}

      {notebooks && (
        <List.Section title={searchText ? "Notebooks" : "Recent notebooks"}>
          {notebooks.map((n, i) => (
            <NotebookResultItem id={i === 0 ? "first-result" : undefined} key={nanoid()} notebook={n} src={src} />
          ))}
        </List.Section>
      )}
    </List>
  );
}

function NotebookResultItem({
  id,
  notebook,
  src,
}: {
  id: string | undefined;
  notebook: SearchNotebook;
  src: Sourcegraph;
}) {
  let updated: string | null = null;
  try {
    const d = DateTime.fromISO(notebook.updatedAt);
    updated = d.toRelative();
  } catch (e) {
    console.warn(`notebook ${notebook.id}: invalid date: ${e}`);
  }
  const stars = notebook.stars?.totalCount || 0;
  const author = notebook.creator?.displayName || notebook.creator?.username || "";
  const url = `${src.instance}/notebooks/${notebook.id}`;
  const accessories: List.Item.Accessory[] = [];
  if (stars) {
    accessories.push({
      text: `${stars}`,
      icon: {
        source: Icon.Star,
        tintColor: notebook.viewerHasStarred ? ColorEmphasis : undefined,
      },
    });
  }
  return (
    <List.Item
      id={id}
      title={notebook.title}
      subtitle={updated ? `by ${author}, updated ${updated}` : author}
      accessories={accessories}
      icon={{
        source: Icon.Document,
        tintColor: notebook.public ? ColorDefault : ColorPrivate,
      }}
      actions={
        <ActionPanel>
          <Action.Push
            key={nanoid()}
            title="Preview Notebook"
            icon={{ source: Icon.MagnifyingGlass }}
            target={<NotebookPreviewView notebook={notebook} src={src} />}
          />
          <Action.OpenInBrowser key={nanoid()} url={url} />
          <Action.CopyToClipboard key={nanoid()} title="Copy Notebook URL" content={url} shortcut={copyShortcut} />
        </ActionPanel>
      }
    />
  );
}

function NotebookPreviewView({ notebook, src }: { notebook: SearchNotebook; src: Sourcegraph }) {
  const author = notebook.creator?.displayName
    ? `${notebook.creator.displayName} (@${notebook.creator.username})`
    : `@${notebook.creator?.username}`;
  let blurb = `Created by ${author}`;
  try {
    blurb += ` ${DateTime.fromISO(notebook.createdAt).toRelative()}, last updated ${DateTime.fromISO(
      notebook.updatedAt
    ).toRelative()}`;
  } catch (e) {
    console.warn(`notebook ${notebook.id}: invalid date: ${e}`);
  }
  const preview = `**${notebook.title}** ${notebook.stars?.totalCount ? `- ${notebook.stars.totalCount} ★` : ""}

> ${blurb}

---

${
  notebook.blocks
    ? notebook.blocks
        .map((b): string => {
          switch (b.__typename) {
            case "MarkdownBlock":
              return `${b.markdownInput}`;
            case "QueryBlock":
              return `\`\`\`\n${b.queryInput}\n\`\`\``;
            case "FileBlock":
              return `\`\`\`\n${b.fileInput.repositoryName} > ${b.fileInput.filePath}\n\`\`\``;
            default:
              return `\`\`\`\n${JSON.stringify(b)}\`\`\``;
          }
        })
        .join("\n\n")
    : ""
}`;

  const notebookURL = `${src.instance}/notebooks/${notebook.id}`;
  return (
    <Detail
      markdown={preview}
      navigationTitle={"Preview Search Notebook"}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser url={notebookURL} />
          <Action.CopyToClipboard title="Copy Link to Notebook" content={notebookURL} />
        </ActionPanel>
      }
    />
  );
}
