/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Public code on Sourcegraph.com: Access token - Configures 'Sourcegraph.com' commands - available under 'Profile' -> 'Access token' on Sourcegraph.com */
  "cloudToken"?: string,
  /** Sourcegraph: URL - Required to use 'Sourcegraph' commands - Sourcegraph URL you want to connect to. */
  "customInstance"?: string,
  /** Sourcegraph: Access token - Required to use 'Sourcegraph' commands - available under 'Profile' -> 'Access token' in Sourcegraph. */
  "customInstanceToken"?: string,
  /** Sourcegraph: Proxy - Optional proxy to use when using a custom Sourcegraph connection - presently, only Unix domain sockets are supported. */
  "customInstanceProxy"?: string,
  /** Additional features - Toggle the search pattern dropdown in the search command. */
  "featureSearchPatternDropdown": boolean,
  /** undefined - Telemetry is only reported to the connected Sourcegraph instance or workspace, but can be disabled with this toggle. */
  "featureDisableTelemetry": boolean
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `searchDotCom` command */
  export type SearchDotCom = ExtensionPreferences & {
  /** Default search context - Default search context to set on all queries */
  "cloudDefaultContext"?: string
}
  /** Preferences accessible in the `searchInstance` command */
  export type SearchInstance = ExtensionPreferences & {
  /** Default context - Default search context to set on all queries */
  "customInstanceDefaultContext"?: string
}
  /** Preferences accessible in the `searchHistoryDotCom` command */
  export type SearchHistoryDotCom = ExtensionPreferences & {}
  /** Preferences accessible in the `searchHistoryInstance` command */
  export type SearchHistoryInstance = ExtensionPreferences & {}
  /** Preferences accessible in the `findNotebooksInstance` command */
  export type FindNotebooksInstance = ExtensionPreferences & {}
  /** Preferences accessible in the `manageBatchChangesInstance` command */
  export type ManageBatchChangesInstance = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `searchDotCom` command */
  export type SearchDotCom = {}
  /** Arguments passed to the `searchInstance` command */
  export type SearchInstance = {}
  /** Arguments passed to the `searchHistoryDotCom` command */
  export type SearchHistoryDotCom = {}
  /** Arguments passed to the `searchHistoryInstance` command */
  export type SearchHistoryInstance = {}
  /** Arguments passed to the `findNotebooksInstance` command */
  export type FindNotebooksInstance = {}
  /** Arguments passed to the `manageBatchChangesInstance` command */
  export type ManageBatchChangesInstance = {}
}

