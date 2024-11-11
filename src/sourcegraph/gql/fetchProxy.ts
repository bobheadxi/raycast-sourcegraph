import http, { Agent } from "http";
import path from "path";
import fetch, { RequestInit, RequestInfo } from "node-fetch";

// Returns a valid http.Agent, using a proxy when configured.
export function getProxiedAgent(proxy?: string) {
  if (proxy !== undefined) {
    if (proxy.startsWith("http://") || proxy.startsWith("https://")) {
      throw new Error(`The proxy provided (${proxy}) is not supported. Use a Unix socket proxy or unset this option.`);
    } else {
      let socketPath = proxy;
      if (socketPath.startsWith("unix://")) {
        socketPath = proxy.slice("unix://".length);
      }
      if (socketPath.startsWith("~/") && process.env.HOME !== undefined) {
        socketPath = path.join(process.env.HOME, socketPath.slice(2));
      }
      return new Agent({ socketPath } as unknown as http.AgentOptions);
    }
  }
  return http.globalAgent;
}

// Returns a fetch function that uses a proxy when configured.
export function getProxiedFetch(proxy?: string): typeof fetch {
  const agent = getProxiedAgent(proxy);
  return (info: URL | RequestInfo, init?: RequestInit) => {
    return fetch(info, { ...init, agent } as RequestInit);
  };
}
