import { List, Action, ActionPanel, Icon } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { DateTime } from "luxon";
import { nanoid } from "nanoid";
import { useState } from "react";
import { SearchHistory } from "../searchHistory";

import { LinkBuilder, Sourcegraph } from "../sourcegraph";
import { ColorDefault } from "./colors";
import { copyShortcut, secondaryActionShortcut, tertiaryActionShortcut } from "./shortcuts";

const link = new LinkBuilder("search-history");

function getQueryURL(src: Sourcegraph, query: string) {
  return link.new(src, "/search", new URLSearchParams({ q: query }));
}

export default function SearchHistoryCommand({ src }: { src: Sourcegraph }) {
  const state = usePromise(async (src: Sourcegraph) => SearchHistory.loadHistory(src), [src]);
  const [searchText, updateSearchText] = useState<string>();

  const newSearchAction = (
    <Action
      icon={Icon.Rocket}
      title="Launch New Code Search"
      onAction={async () =>
        SearchHistory.launchSearch(src, {
          query: searchText || "",
          timestamp: DateTime.now().toMillis(),
        })
      }
      shortcut={tertiaryActionShortcut}
    />
  );

  return (
    <List
      isLoading={state.isLoading}
      searchBarPlaceholder={"Search recent queries (or start a new search)..."}
      onSearchTextChange={updateSearchText}
      filtering={true}
      actions={<ActionPanel>{newSearchAction}</ActionPanel>}
    >
      {!state.data?.length ? (
        <List.EmptyView title="Press 'Enter' to start a new code search!" />
      ) : (
        state.data?.map((item) => (
          <List.Item
            key={nanoid()}
            icon={{
              source: Icon.MagnifyingGlass,
              tintColor: ColorDefault,
            }}
            title={item.query}
            accessories={[
              {
                date: DateTime.fromMillis(item.timestamp).toJSDate(),
              },
            ]}
            actions={
              <ActionPanel>
                <Action
                  icon={Icon.Rocket}
                  title="Launch Code Search"
                  onAction={async () => SearchHistory.launchSearch(src, item)}
                />
                <Action.OpenInBrowser
                  icon={Icon.Globe}
                  title="Open Query in Browser"
                  url={getQueryURL(src, item.query)}
                  shortcut={secondaryActionShortcut}
                />
                <Action.CopyToClipboard
                  icon={Icon.Clipboard}
                  title="Copy Query"
                  content={item.query}
                  shortcut={copyShortcut}
                />

                <Action
                  icon={Icon.Trash}
                  title="Remove Item"
                  style={Action.Style.Destructive}
                  onAction={async () => {
                    await SearchHistory.removeItem(src, item);
                    await state.revalidate();
                  }}
                />

                {newSearchAction}

                <Action
                  icon={Icon.Trash}
                  title="Clear Search History"
                  style={Action.Style.Destructive}
                  onAction={async () => {
                    await SearchHistory.clearHistory(src);
                    await state.revalidate();
                  }}
                />
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
}