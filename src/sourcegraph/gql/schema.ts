/* tslint:disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetCurrentUser
// ====================================================

export interface GetCurrentUser_currentUser {
  username: string; // The user's username.
  id: string; // The unique ID for the user.
}

export interface GetCurrentUser {
  currentUser: GetCurrentUser_currentUser | null; // The current user.
}

/* tslint:disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetNotebooks
// ====================================================

export interface GetNotebooks_notebooks_nodes_stars {
  totalCount: number; // The total number of notebook stars in the connection.
}

export interface GetNotebooks_notebooks_nodes_creator {
  username: string; // The user's username.
  displayName: string | null; // The display name chosen by the user.
}

export interface GetNotebooks_notebooks_nodes_blocks_SymbolBlock {
  __typename: "SymbolBlock" | "ComputeBlock";
}

export interface GetNotebooks_notebooks_nodes_blocks_MarkdownBlock {
  __typename: "MarkdownBlock";
  markdownInput: string; // Markdown formatted input string.
}

export interface GetNotebooks_notebooks_nodes_blocks_QueryBlock {
  __typename: "QueryBlock";
  queryInput: string; // A Sourcegraph search query string.
}

export interface GetNotebooks_notebooks_nodes_blocks_FileBlock_fileInput {
  repositoryName: string; // Name of the repository, e.g. "github.com/sourcegraph/sourcegraph".
  filePath: string; // Path within the repository, e.g. "client/web/file.tsx".
}

export interface GetNotebooks_notebooks_nodes_blocks_FileBlock {
  __typename: "FileBlock";
  fileInput: GetNotebooks_notebooks_nodes_blocks_FileBlock_fileInput; // File block input.
}

export type GetNotebooks_notebooks_nodes_blocks =
  | GetNotebooks_notebooks_nodes_blocks_SymbolBlock
  | GetNotebooks_notebooks_nodes_blocks_MarkdownBlock
  | GetNotebooks_notebooks_nodes_blocks_QueryBlock
  | GetNotebooks_notebooks_nodes_blocks_FileBlock;

export interface GetNotebooks_notebooks_nodes {
  id: string; // The unique id of the notebook.
  title: string; // The title of the notebook.
  viewerHasStarred: boolean; // If current viewer has starred the notebook.
  public: boolean; // Public property controls the visibility of the notebook. A public notebook is available to any user on the instance. Private notebooks are only available to their creators.
  stars: GetNotebooks_notebooks_nodes_stars; // Notebook stars.
  creator: GetNotebooks_notebooks_nodes_creator | null; // User that created the notebook or null if the user was removed.
  blocks: GetNotebooks_notebooks_nodes_blocks[]; // Array of notebook blocks.
  createdAt: any; // Date and time the notebook was created.
  updatedAt: any; // Date and time the notebook was last updated.
}

export interface GetNotebooks_notebooks {
  nodes: GetNotebooks_notebooks_nodes[]; // A list of notebooks.
}

export interface GetNotebooks {
  notebooks: GetNotebooks_notebooks; // All available notebooks.
}

export interface GetNotebooksVariables {
  query: string;
  orderBy?: NotebooksOrderBy | null;
}

/* tslint:disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: SearchNotebook
// ====================================================

export interface SearchNotebook_stars {
  totalCount: number; // The total number of notebook stars in the connection.
}

export interface SearchNotebook_creator {
  username: string; // The user's username.
  displayName: string | null; // The display name chosen by the user.
}

export interface SearchNotebook_blocks_SymbolBlock {
  __typename: "SymbolBlock" | "ComputeBlock";
}

export interface SearchNotebook_blocks_MarkdownBlock {
  __typename: "MarkdownBlock";
  markdownInput: string; // Markdown formatted input string.
}

export interface SearchNotebook_blocks_QueryBlock {
  __typename: "QueryBlock";
  queryInput: string; // A Sourcegraph search query string.
}

export interface SearchNotebook_blocks_FileBlock_fileInput {
  repositoryName: string; // Name of the repository, e.g. "github.com/sourcegraph/sourcegraph".
  filePath: string; // Path within the repository, e.g. "client/web/file.tsx".
}

export interface SearchNotebook_blocks_FileBlock {
  __typename: "FileBlock";
  fileInput: SearchNotebook_blocks_FileBlock_fileInput; // File block input.
}

export type SearchNotebook_blocks =
  | SearchNotebook_blocks_SymbolBlock
  | SearchNotebook_blocks_MarkdownBlock
  | SearchNotebook_blocks_QueryBlock
  | SearchNotebook_blocks_FileBlock;

export interface SearchNotebook {
  id: string; // The unique id of the notebook.
  title: string; // The title of the notebook.
  viewerHasStarred: boolean; // If current viewer has starred the notebook.
  public: boolean; // Public property controls the visibility of the notebook. A public notebook is available to any user on the instance. Private notebooks are only available to their creators.
  stars: SearchNotebook_stars; // Notebook stars.
  creator: SearchNotebook_creator | null; // User that created the notebook or null if the user was removed.
  blocks: SearchNotebook_blocks[]; // Array of notebook blocks.
  createdAt: any; // Date and time the notebook was created.
  updatedAt: any; // Date and time the notebook was last updated.
}

/* tslint:disable */
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

// NotebooksOrderBy enumerates the ways notebooks can be ordered.
export enum NotebooksOrderBy {
  NOTEBOOK_CREATED_AT = "NOTEBOOK_CREATED_AT",
  NOTEBOOK_STAR_COUNT = "NOTEBOOK_STAR_COUNT",
  NOTEBOOK_UPDATED_AT = "NOTEBOOK_UPDATED_AT",
}

//==============================================================
// END Enums and Input Objects
//==============================================================
