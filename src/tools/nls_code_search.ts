import { sourcegraphInstance } from "../sourcegraph";
import { executeNLSSearch, formatSearchResults } from "./shared/search";

type Input = {
  /**
   * Natural language search query. Describe what you're looking for in plain English, e.g., "functions that handle user authentication" or "React components for displaying lists".
   */
  query: string;
  /**
   * Maximum number of results to return. Defaults to 20.
   */
  maxResults?: number;
};

/**
 * Search for code using natural language processing in your private Sourcegraph instance.
 * This tool understands natural language queries and is optimized for AI-driven searches.
 * Use when you want to describe functionality or concepts rather than exact code matches.
 */
export default async function main(params: Input) {
  const { query, maxResults = 20 } = params;
  try {
    // Create Sourcegraph client for custom instance
    const src = sourcegraphInstance();

    if (!src) {
      return {
        success: false,
        error: "No custom Sourcegraph instance configured. Please configure your Sourcegraph instance in preferences.",
        query,
      };
    }

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
