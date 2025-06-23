import { sourcegraphDotCom } from "../sourcegraph";
import { executeFileRead } from "./shared/search";

type Input = {
  /**
   * Repository name (e.g., "github.com/facebook/react" or "facebook/react")
   */
  repository: string;
  /**
   * File path within the repository (e.g., "packages/react/src/React.js")
   */
  path: string;
  /**
   * Git revision (branch, tag, or commit SHA). Defaults to "HEAD" (latest).
   */
  revision?: string;
};

/**
 * Read the complete contents of a specific file from public repositories on Sourcegraph.com.
 * This tool retrieves the full text content of any file in open source repositories.
 * Use when you need to examine the complete source code of a specific file in public projects.
 */
export default async function main(params: Input) {
  const { repository, path, revision } = params;
  try {
    // Create Sourcegraph client for public code search
    const src = await sourcegraphDotCom();

    // Read the file contents
    const result = await executeFileRead(src, repository, path, revision);

    if (!result) {
      return {
        success: false,
        error: "File not found or could not be read",
        repository,
        path,
        revision,
      };
    }

    return {
      success: true,
      content: result.content,
      url: result.url,
      repository: result.repository,
      path: result.path,
      revision: result.revision,
      instance: src.instance,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      repository,
      path,
      revision,
    };
  }
}
