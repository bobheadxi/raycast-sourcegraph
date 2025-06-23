import { sourcegraphDotCom } from "../sourcegraph";
import { executeNLSSearch, formatSearchResults } from "./shared/search";

type Input = {
  /**
   * Natural language search query. Describe what you're looking for in plain English, e.g., "React hooks for state management" or "Python functions for file processing".
   */
  query: string;
  /**
   * Maximum number of results to return. Defaults to 20.
   */
  maxResults?: number;
};

/**
 * Search for code using natural language processing across public repositories on Sourcegraph.com.
 * This tool understands natural language queries and is optimized for AI-driven searches in open source code.
 * Use when you want to describe functionality or concepts rather than exact code matches.
 */
export default async function main(params: Input) {
  const { query, maxResults = 20 } = params;
  try {
    // Create Sourcegraph client for public code search
    const src = await sourcegraphDotCom();

    // Perform the NLS search
    const results = await executeNLSSearch(src, query, maxResults);

    // Format results for AI consumption
    const formattedResults = formatSearchResults(results, src);

    return {
      success: true,
      results: formattedResults,
      totalCount: results.length,
      query,
      instance: src.instance,
      searchType: "nls",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      query,
    };
  }
}
