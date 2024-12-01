/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Sourcegraph.com: Access token - Available under 'Profile' -> 'Access token' on Sourcegraph.com */
  "cloudToken"?: string,
  /** Sourcegraph Instance: Instance URL - Required to use use 'Sourcegraph Instance' commands - URL of the Sourcegraph instance you want to connect to */
  "customInstance"?: string,
  /** Sourcegraph Instance: Access token - Required to use 'Sourcegraph Instance' commands - available under 'Profile' -> 'Access token' on the Sourcegraph instance */
  "customInstanceToken"?: string,
  /** Sourcegraph Instance: Proxy - Optional proxy to use when connecting to a custom Sourcegraph instance - presently, only Unix domain sockets are supported. */
  "customInstanceProxy"?: string,
  /** Additional features - Toggle the search pattern dropdown in the search command. */
  "featureSearchPatternDropdown": boolean,
  /** undefined - Telemetry is only reported to the connected Sourcegraph instance, but can be disabled with this toggle. */
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

