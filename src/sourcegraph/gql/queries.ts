import { gql } from "@apollo/client";

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    currentUser {
      username
      id
    }
  }
`;

export const SEARCH_NOTEBOOK = gql`
  fragment SearchNotebook on Notebook {
    id
    title
    viewerHasStarred
    public
    stars {
      totalCount
    }
    creator {
      username
      displayName
    }
    blocks {
      __typename
      ... on MarkdownBlock {
        markdownInput
      }
      ... on QueryBlock {
        queryInput
      }
      ... on FileBlock {
        fileInput {
          repositoryName
          filePath
        }
      }
    }
    createdAt
    updatedAt
  }
`;

export const GET_NOTEBOOKS = gql`
  ${SEARCH_NOTEBOOK}
  query GetNotebooks($query: String!, $orderBy: NotebooksOrderBy) {
    notebooks(query: $query, orderBy: $orderBy, descending: true) {
      nodes {
        ...SearchNotebook
      }
    }
  }
`;
