# Changelog

## Unreleased

- all: configuration for "Sourcegraph Instance" commands has been moved from the top-level "Search Code" command into the Sourcegraph extension preferences, and has been renamed "Sourcegraph Self-Hosted" for clarity. As a result of this, existing preferences might be reset and need reconfiguring. ([#2](https://github.com/bobheadxi/raycast-sourcegraph/pull/2))
- notebooks: "Find Search Notebooks" is a new command that allows you to query, peek, open, and create [Sourcegraph Search Notebooks](https://sourcegraph.com/notebooks?tab=explore)! ([#2](https://github.com/bobheadxi/raycast-sourcegraph/pull/2))
- search: For `content` and `symbol` matches, if there is more than 1 result in the match, the default command when pressing Enter is now an updated peek view that allows you to jump to specific results. ([#4](https://github.com/bobheadxi/raycast-sourcegraph/pull/4))
- search: the shortcut to open a command is now `Cmd`-`Shift`-`O`. ([#3](https://github.com/bobheadxi/raycast-sourcegraph/pull/3))

## [Jan 20th, 2022](https://github.com/raycast/extensions/pull/708)

- Initial release on the [Raycast store](https://www.raycast.com/bobheadxi/sourcegraph)
