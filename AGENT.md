This an extension for Raycast that adds integrations with Sourcegraph.
For more information about building a Raycast extension, refer to https://developers.raycast.com and related pages.

When making changes, `npm run fmt` will run formatting and linting checks and apply fixes where it can.

In this extension, most commands have two variants:

- a "dotcom" command, for Sourcegraph's public code search instance
- an "instance" command, for the configured Sourcegraph instance

All features should generally support each variant with only minimal differences.
