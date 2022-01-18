import { getPreferenceValues } from "@raycast/api";

export interface Sourcegraph {
  instance: string;
  token?: string;
  defaultContext?: string;
}

interface Preferences {
  cloudToken?: string;
  cloudDefaultContext?: string;
}

export default function sourcegraphCloud(): Sourcegraph {
  const prefs: Preferences = getPreferenceValues();
  return {
    instance: "https://sourcegraph.com",
    token: prefs.cloudToken,
    defaultContext: prefs.cloudDefaultContext,
  };
}
