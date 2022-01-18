import { getPreferenceValues } from "@raycast/api";

export interface Sourcegraph {
  instance: string;
  token?: string;
}

interface Preferences {
  cloudToken?: string;
}

export default function sourcegraph(): Sourcegraph {
  const prefs: Preferences = getPreferenceValues();
  return {
    instance: "https://sourcegraph.com",
    token: prefs.cloudToken,
  };
}
