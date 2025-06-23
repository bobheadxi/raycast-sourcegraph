import { sourcegraphInstance } from "../sourcegraph";
import { executeFileRead } from "./shared/search";

type Input = {
  /**
   * Repository name (e.g., "myorg/myrepo" or "github.com/user/repo")
   */
  repository: string;
  /**
   * File path within the repository (e.g., "src/components/Button.tsx")
   */
  path: string;
  /**
   * Git revision to read the file from. Supports:
   * - Branch names: "main", "develop", "feature-branch"
   * - Tags: "v1.0.0", "release-2023"
   * - Commit SHA: "1735d48" (short) or full SHA
   * - Relative refs: "HEAD~1" (one commit before HEAD)
   * - Multiple revisions: "v1.0.0:v2.0.0" (search across range)
   * - Temporal search: "at.time(2 years ago)" (find revision at specific time)
   * - Temporal with base: "at.time(2021-01-30, v5.0.0)" (time from specific revision)
   * - Special syntax: "HEAD" (latest on default branch)
   *
   * Defaults to "HEAD" if not specified.
   */
  revision?: string;
};

/**
 * Read the complete contents of a specific file from your private Sourcegraph instance.
 * This tool retrieves the full text content of any file in your repositories at any
 * point in git history, supporting branches, tags, and specific commits.
 *
 * WHEN TO USE:
 * - Examine the current state of a specific file
 * - Compare file contents across different versions
 * - Read configuration files, documentation, or source code
 * - Access files from specific releases or branches
 * - Investigate file contents at specific points in history
 *
 * EXAMPLES:
 * - Read current version: repository="myorg/api", path="config/database.yml"
 * - Read from tag: repository="myorg/api", path="README.md", revision="v1.0.0"
 * - Read from branch: repository="myorg/api", path="src/main.go", revision="feature-auth"
 * - Read old version: repository="myorg/api", path="package.json", revision="HEAD~5"
 */
export default async function main(params: Input) {
  const { repository, path, revision } = params;
  try {
    // Create Sourcegraph client for custom instance
    const src = sourcegraphInstance();

    if (!src) {
      return {
        success: false,
        error: "No custom Sourcegraph instance configured. Please configure your Sourcegraph instance in preferences.",
        repository,
        path,
      };
    }

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
