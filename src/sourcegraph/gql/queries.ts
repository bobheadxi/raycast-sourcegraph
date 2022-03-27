import { gql } from "@apollo/client";

const SEARCH_NOTEBOOK_FIELDS = gql`
  fragment SearchNotebookFields on Notebook {
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
  ${SEARCH_NOTEBOOK_FIELDS}
  query GetNotebooks($query: String!, $orderBy: NotebooksOrderBy) {
    notebooks(query: $query, orderBy: $orderBy, descending: true) {
      nodes {
        ...SearchNotebookFields
      }
    }
  }
`;

const BATCH_CHANGE_FIELDS = gql`
  fragment BatchChangeFields on BatchChange {
    id
    url
    namespace {
      id
      namespaceName
    }
    name
    description
    creator {
      username
      displayName
    }
    state
    updatedAt
    changesetsStats {
      total
      merged
      open
      closed
      failed
    }
  }
`;

export const GET_BATCH_CHANGES = gql`
  ${BATCH_CHANGE_FIELDS}
  query GetBatchChanges {
    batchChanges(first: 100) {
      nodes {
        ...BatchChangeFields
      }
    }
  }
`;

export const changesetFieldsPossibleTypes = {
  Changeset: ["ExternalChangeset", "HiddenExternalChangeset"],
};

const CHANGESET_FIELDS = gql`
  fragment ChangesetFields on Changeset {
    __typename

    id
    state
    updatedAt

    ... on ExternalChangeset {
      repository {
        name
      }
      externalURL {
        url
        serviceKind
      }
      externalID
      title
      reviewState
      checkState
    }
  }
`;

export const GET_CHANGESETS = gql`
  ${CHANGESET_FIELDS}
  query GetChangesets($namespace: ID!, $name: String!) {
    batchChange(namespace: $namespace, name: $name) {
      changesets {
        nodes {
          ...ChangesetFields
        }
      }
    }
  }
`;