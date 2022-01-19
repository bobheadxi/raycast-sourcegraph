import { getPreferenceValues } from "@raycast/api";

export interface Sourcegraph {
  instance: string;
  token?: string;
  defaultContext?: string;
}

interface Preferences {
  cloudToken?: string;
  cloudDefaultContext?: string;

  customInstance?: string;
  customInstanceToken?: string;
  customInstanceDefaultContext?: string;
}

export function sourcegraphCloud(): Sourcegraph {
  const prefs: Preferences = getPreferenceValues();
  return {
    instance: "https://sourcegraph.com",
    token: prefs.cloudToken,
    defaultContext: prefs.cloudDefaultContext,
  };
}

export function customSourcegraph(): Sourcegraph | null {
  const prefs: Preferences = getPreferenceValues();
  if (prefs.customInstance) {
    return {
      instance: prefs.customInstance,
      token: prefs.customInstanceToken,
      defaultContext: prefs.customInstanceDefaultContext,
    };
  }
  return null;
}
