import { ActionPanel, List, Action, Icon, useNavigation, Detail, Toast, Image, Color } from "@raycast/api";
import { useState, useRef, useEffect } from "react";
import { DateTime } from "luxon";
import { nanoid } from "nanoid";

import { Sourcegraph, instanceName } from "../sourcegraph";
import { BatchChange, getBatchChanges, Changeset, getChangesets } from "../sourcegraph/gql";
import checkAuthEffect from "../hooks/checkAuthEffect";
import { copyShortcut, secondaryActionShortcut } from "./shortcuts";
import { ColorDefault } from "./colors";

export default function ViewBatchChanges(src: Sourcegraph) {
  const { state } = useBatchChanges(src);
  const srcName = instanceName(src);
  const nav = useNavigation();

  useEffect(checkAuthEffect(src, nav));

  return (
    <List isLoading={state.isLoading} searchBarPlaceholder={`Browse batch changes on ${srcName}`}>
      <List.Section title={"Batch changes"} subtitle={`${state.batchChanges.length} batch changes`}>
        {state.batchChanges.map((b) => (
          <BatchChange key={nanoid()} batchChange={b} src={src} />
        ))}
      </List.Section>
    </List>
  );
}

function BatchChange({ batchChange, src }: { batchChange: BatchChange; src: Sourcegraph }) {
  let updated: string | null = null;
  try {
    const d = DateTime.fromISO(batchChange.updatedAt);
    updated = d.toRelative();
  } catch (e) {
    console.warn(`notebook ${batchChange.id}: invalid date: ${e}`);
  }
  const author = batchChange.creator.displayName || batchChange.creator.username;

  const icon: Image.ImageLike = { source: Icon.Circle };
  switch (batchChange.state) {
    case "OPEN":
      icon.source = Icon.Circle;
      icon.tintColor = Color.Green;
      break;
    case "CLOSED":
      icon.source = Icon.Checkmark;
      icon.tintColor = Color.Red;
      break;
    case "DRAFT":
      icon.source = Icon.Document;
      break;
  }

  const { changesetsStats } = batchChange;
  const url = `${src.instance}${batchChange.url}`
  return (
    <List.Item
      icon={{
        source: Icon.List,
        tintColor: ColorDefault,
      }}
      title={`${batchChange.namespace.namespaceName} / ${batchChange.name}`}
      subtitle={updated ? `by ${author}, updated ${updated}` : author}
      accessoryTitle={
        changesetsStats.total
          ? `${changesetsStats.merged} / ${changesetsStats.closed + changesetsStats.merged + changesetsStats.open} / ${
              changesetsStats.total
            }`
          : undefined
      }
      accessoryIcon={icon}
      keywords={[batchChange.state]}
      actions={
        <ActionPanel>
          <Action.Push
            key={nanoid()}
            title="View Batch Change"
            icon={{ source: Icon.MagnifyingGlass }}
            target={<BatchChangePeek batchChange={batchChange} src={src} />}
          />
          <Action.OpenInBrowser key={nanoid()} url={url} shortcut={secondaryActionShortcut} />
          <Action.CopyToClipboard
            key={nanoid()}
            title="Copy Batch Change URL"
            content={url}
            shortcut={copyShortcut}
          />
        </ActionPanel>
      }
    />
  );
}

function BatchChangePeek({ batchChange, src }: { batchChange: BatchChange; src: Sourcegraph }) {
  const { state } = useChangesets(src, batchChange);
  const published = state.changesets.filter((c) => c.state !== "UNPUBLISHED");
  const unpublished = state.changesets.filter((c) => c.state === "UNPUBLISHED");
  return (
    <List isLoading={state.isLoading} searchBarPlaceholder={`Search changesets for ${batchChange.name}`}>
      <List.Section
        title={"Published changesets"}
        subtitle={
          published.length > 0
            ? [
                batchChange.changesetsStats.open > 0 ? `${batchChange.changesetsStats.open} open` : undefined,
                batchChange.changesetsStats.closed > 0 ? `${batchChange.changesetsStats.closed} closed` : undefined,
                batchChange.changesetsStats.merged ? `${batchChange.changesetsStats.merged} merged` : undefined,
              ]
                .filter((s) => !!s)
                .join(", ")
            : "0 changesets"
        }
      >
        {published.map((c) => (
          <ChangesetItem key={nanoid()} src={src} batchChange={batchChange} changeset={c} />
        ))}
      </List.Section>
      <List.Section title={"Unpublished changesets"} subtitle={`${unpublished.length} changesets`}>
        {unpublished.map((c) => (
          <ChangesetItem key={nanoid()} src={src} batchChange={batchChange} changeset={c} />
        ))}
      </List.Section>
    </List>
  );
}

function ChangesetItem({ src, batchChange, changeset }: { src: Sourcegraph; batchChange: BatchChange; changeset: Changeset }) {
  let updated: string | null = null;
  try {
    const d = DateTime.fromISO(changeset.updatedAt);
    updated = d.toRelative();
  } catch (e) {
    console.warn(`changeset ${changeset.id}: invalid date: ${e}`);
  }

  const icon: Image.ImageLike = { source: Icon.Circle };
  switch (changeset.state) {
    case "OPEN":
      icon.source = Icon.Circle;
      icon.tintColor = Color.Green;
      break;
    case "MERGED":
      icon.source = Icon.Checkmark;
      icon.tintColor = Color.Purple;
      break;
    case "CLOSED":
      icon.source = Icon.XmarkCircle;
      icon.tintColor = Color.Red;
      break;
    case "UNPUBLISHED":
      icon.source = Icon.Document;
      break;
  }

  const url = changeset.externalURL?.url || `${src.instance}${batchChange.url}`
  return (
    <List.Item
      title={`${changeset.repository.name}`}
      subtitle={changeset.externalID ? `#${changeset.externalID}` : undefined}
      accessoryTitle={updated || undefined}
      accessoryIcon={icon}
      keywords={[changeset.state]}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser url={url} />
          <Action.CopyToClipboard content={url} shortcut={copyShortcut} />
        </ActionPanel>
      }
    />
  );
}

interface BatchChangesState {
  searchText: string;
  batchChanges: BatchChange[];
  isLoading: boolean;
}

function useBatchChanges(src: Sourcegraph) {
  const [state, setState] = useState<BatchChangesState>({
    searchText: "",
    batchChanges: [],
    isLoading: true,
  });
  const cancelRef = useRef<AbortController | null>(null);
  const { push } = useNavigation();

  useEffect(() => {
    load(); // initial load
  }, []);

  async function load() {
    cancelRef.current?.abort();
    cancelRef.current = new AbortController();

    try {
      setState((oldState) => ({
        ...oldState,
        batchChanges: [],
        isLoading: true,
      }));

      const resp = await getBatchChanges(cancelRef.current.signal, src);
      setState((oldState) => ({
        ...oldState,
        batchChanges: resp?.batchChanges?.nodes || [],
        isLoading: false,
      }));
    } catch (error) {
      new Toast({
        style: Toast.Style.Failure,
        title: "Get batch changes failed",
        message: String(error),
        primaryAction: {
          title: "View details",
          onAction: () => {
            push(
              <Detail markdown={`**Get batch changes failed:** ${String(error)}`} navigationTitle="Unexpected error" />
            );
          },
        },
      }).show();

      setState((oldState) => ({
        ...oldState,
        isLoading: false,
      }));
    }
  }

  return { state, load };
}

interface ChangesetsState {
  searchText: string;
  changesets: Changeset[];
  isLoading: boolean;
}

function useChangesets(src: Sourcegraph, batchChange: BatchChange) {
  const [state, setState] = useState<ChangesetsState>({
    searchText: "",
    changesets: [],
    isLoading: true,
  });
  const cancelRef = useRef<AbortController | null>(null);
  const { push } = useNavigation();

  useEffect(() => {
    load(); // initial load
  }, []);

  async function load() {
    cancelRef.current?.abort();
    cancelRef.current = new AbortController();

    try {
      setState((oldState) => ({
        ...oldState,
        changesets: [],
        isLoading: true,
      }));

      const resp = await getChangesets(cancelRef.current.signal, src, batchChange.namespace.id, batchChange.name);
      setState((oldState) => ({
        ...oldState,
        changesets: resp?.batchChange?.changesets?.nodes || [],
        isLoading: false,
      }));
    } catch (error) {
      new Toast({
        style: Toast.Style.Failure,
        title: "Get changesets failed",
        message: String(error),
        primaryAction: {
          title: "View details",
          onAction: () => {
            push(
              <Detail markdown={`**Get changesets failed:** ${String(error)}`} navigationTitle="Unexpected error" />
            );
          },
        },
      }).show();

      setState((oldState) => ({
        ...oldState,
        isLoading: false,
      }));
    }
  }

  return { state, load };
}
