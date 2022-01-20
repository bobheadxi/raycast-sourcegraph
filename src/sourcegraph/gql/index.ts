import fetch from "node-fetch";

import { Sourcegraph } from "..";

export class AuthError extends Error {
  message: string;
  constructor(message: string) {
    super();
    this.message = message;
  }
}

async function doRequest<T>(abort: AbortSignal, src: Sourcegraph, query: string): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (src.token) {
    headers["Authorization"] = `token ${src.token}`;
  }
  return new Promise<T>((resolve, reject) => {
    fetch(`${src.instance}/.api/graphql`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ query }),
      signal: abort,
    })
      .then((r) => {
        if (r.status == 401 || r.status == 403) {
          return reject(new AuthError(`${r.status} ${r.statusText}`));
        } else if (r.status >= 400) {
          return r
            .text()
            .then((t) => {
              return reject(new Error(`${r.status} ${r.statusText}: ${t}`));
            })
            .catch((e) => {
              return reject(new Error(`${r.status} ${r.statusText}: ${e}`));
            });
        }

        return r.json();
      })
      .then((data) => {
        const resp = data as { data: T };
        if (resp) {
          resolve(resp.data as T);
        } else {
          reject(`No data in response: ${resp}`);
        }
      });
  });
}

export async function checkAuth(abort: AbortSignal, src: Sourcegraph) {
  const q = `query currentUser { currentUser { username, id } }`;
  return doRequest<{ currentUser: { username: string; id: string } }>(abort, src, q);
}

export interface SearchNotebook {
  id: string;
  title: string;
  viewerHasStarred: boolean;
  public: boolean;
  stars?: { totalCount: number };
  creator: {
    username: string;
    displayName?: string;
  };
  updatedAt: string;
}

export async function findNotebooks(abort: AbortSignal, src: Sourcegraph, query?: string) {
  let args = `${query ? `query:"${query}",orderBy:NOTEBOOK_STAR_COUNT,descending:true` : ""}`;
  if (!query && src.token) {
    const {
      currentUser: { id },
    } = await checkAuth(abort, src);
    args = `starredByUserID:"${id}"`;
  }
  const q = `{
    notebooks(${args}) {
      nodes {
        id
        title
        viewerHasStarred
        public
        stars { totalCount }
        creator {
          username
          displayName
        }
        updatedAt
      }
    }
  }`;
  return doRequest<{ notebooks?: { nodes?: SearchNotebook[] } }>(abort, src, q);
}
