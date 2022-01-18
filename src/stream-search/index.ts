import EventSource from "@bobheadxi/node-eventsource-http2";
import { AbortSignal } from "node-fetch";

import { getMatchUrl, SearchEvent, SearchMatch } from "./stream";
import { Sourcegraph } from "../sourcegraph";

export interface SearchResult {
  url: string;
  match: SearchMatch;
}

export interface Suggestion {
  title: string;
  description: string;
  query: string;
}

export interface Alert {
  title: string;
  description?: string;
}

export interface Progress {
  matchCount: number;
  duration: string;
}

export interface SearchHandlers {
  onResults: (results: SearchResult[]) => void;
  onSuggestions: (suggestions: Suggestion[], top: boolean) => void;
  onAlert: (alert: Alert) => void;
  onProgress: (progress: Progress) => void;
}

export async function performSearch(
  query: string,
  src: Sourcegraph,
  signal: AbortSignal,
  handlers: SearchHandlers
): Promise<void> {
  if (query.length === 0) {
    return;
  }

  const parameters = [
    ["q", query],
    ["v", "V2"],
    ["t", "literal"],
    // ["dl", "0"],
    // ['dk', (decorationKinds || ['html']).join('|')],
    // ['dc', (decorationContextLines || '1').toString()],
    ["display", "50"],
  ];
  const parameterEncoded = parameters.map(([k, v]) => k + "=" + encodeURIComponent(v)).join("&");
  const requestURL = `${src.instance}/search/stream?${parameterEncoded}`;
  const stream = src.token
    ? new EventSource(requestURL, { headers: { Authorization: `token ${src.token}` } })
    : new EventSource(requestURL);

  return new Promise((resolve, reject) => {
    // signal cancelling
    signal.addEventListener("abort", () => {
      stream.close();
      resolve();
    });

    // errors from stream
    stream.addEventListener("error", (error) => {
      reject(`${JSON.stringify(error)}`);
    });

    // matches from the Sourcegraph API
    stream.addEventListener("matches", (message) => {
      const event: SearchEvent = {
        type: "matches",
        data: message.data ? JSON.parse(message.data) : {},
      };

      handlers.onResults(
        event.data.map((match): SearchResult => {
          const url = `${src.instance}${getMatchUrl(match)}`;
          return { url, match };
        })
      );
    });

    // filters from the Sourcegraph API
    stream.addEventListener("filters", (message) => {
      const event: SearchEvent = {
        type: "filters",
        data: message.data ? JSON.parse(message.data) : {},
      };
      handlers.onSuggestions(
        event.data
          // rough heuristic to get rid of some less-than-stellar suggestions
          .filter((s) => s.kind != "repo" && s.count > 1)
          .map((f) => {
            return {
              title: `Filter for '${f.label}'`,
              description: `${f.count} matches`,
              query: f.value,
            };
          }),
        false
      );
    });

    // alerts from the Sourcegraph API
    stream.addEventListener("alert", (message) => {
      const event: SearchEvent = {
        type: "alert",
        data: message.data ? JSON.parse(message.data) : {},
      };

      handlers.onAlert({
        title: event.data.title,
        description: event.data.description || "",
      });
      if (event.data.proposedQueries) {
        handlers.onSuggestions(
          event.data.proposedQueries.map((p) => {
            return {
              title: p.description || p.query,
              description: event.data.title,
              query: p.query,
            };
          }),
          true
        );
      }
    });

    // progress from the Sourcegraph API
    stream.addEventListener("progress", (message) => {
      const event: SearchEvent = {
        type: "progress",
        data: message.data ? JSON.parse(message.data) : {},
      };
      handlers.onProgress({
        matchCount: event.data.matchCount,
        duration: `${event.data.durationMs}ms`,
      });
    });

    // done indicator
    stream.addEventListener("done", () => {
      resolve();
    });
  });
}
