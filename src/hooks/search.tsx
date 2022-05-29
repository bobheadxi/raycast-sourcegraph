import { useNavigation } from "@raycast/api";
import { useState, useRef } from "react";

import { Sourcegraph } from "../sourcegraph";
import { PatternType, performSearch, SearchResult, Suggestion } from "../sourcegraph/stream-search";

import ExpandableErrorToast from "../components/ExpandableErrorToast";

export interface SearchState {
  /**
   * Set of all results received, up to the provided maximum
   */
  results: SearchResult[];
  /**
   * Suggestions that should be rendered for the user if no results are found
   */
  suggestions: Suggestion[];
  /**
   * Summary text of search progress
   */
  summary: string;
  /**
   * Additional details of search progress
   */
  summaryDetail?: string;
  /**
   * Whether a search is currently being executed
   */
  isLoading: boolean;
  /**
   * The previously executed search
   */
  previousSearch?: string;
}

/**
 * useSearch enables search capabilities.
 *
 * @param src Sourcegraph configuration
 * @param maxResults Configures the maximum number of results to send to state
 */
export function useSearch(src: Sourcegraph, maxResults: number) {
  const [state, setState] = useState<SearchState>({
    results: [],
    suggestions: [],
    summary: "",
    isLoading: false,
  });
  const cancelRef = useRef<AbortController | null>(null);
  const { push } = useNavigation();

  async function search(searchText: string, pattern: PatternType) {
    // Do not repeat searches that are essentially the same
    if ((state.previousSearch || "").trim() === searchText.trim()) {
      return;
    }

    // Reset state for new search
    setState({
      results: [],
      suggestions: [],
      summary: "",
      summaryDetail: undefined,
      isLoading: true,
      previousSearch: searchText,
    });

    try {
      // Cancel previous search
      cancelRef.current?.abort();
      cancelRef.current = new AbortController();

      // Do the search
      await performSearch(cancelRef.current.signal, src, searchText, pattern, {
        onResults: (results) => {
          setState((oldState) => {
            if (oldState.results.length > maxResults) {
              return {
                ...oldState,
                summaryDetail: `${maxResults} results shown`,
              };
            }
            return {
              ...oldState,
              results: oldState.results.concat(results),
            };
          });
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
          ExpandableErrorToast(push, "Alert", alert.title, alert.description || "").show();
        },
        onProgress: (progress) => {
          setState((oldState) => ({
            ...oldState,
            summary: `Found ${progress.matchCount}${progress.skipped ? "+" : ""} results in ${progress.duration}`,
          }));
        },
      });
      setState((oldState) => ({
        ...oldState,
        isLoading: false,
      }));
    } catch (error) {
      ExpandableErrorToast(push, "Unexpected error", "Search failed", String(error)).show();

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
