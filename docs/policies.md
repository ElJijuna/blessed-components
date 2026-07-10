# Library Policies

## Stability

Public package subpaths, exported type names, renderer output contracts, and
adapter handle methods follow semantic versioning. Breaking changes require a
major release and migration notes.

## Deprecation

Deprecated APIs remain available for at least one minor release. Documentation
must name the replacement, explain the behavior change, and include a small
before/after snippet when migration is not mechanical.

## Accessibility and Fallbacks

Components must preserve readable text in no-color, ASCII, and dumb-terminal
profiles. Interactive adapters must document keyboard behavior and cleanup any
screen listeners, timers, or child elements they own.

## Performance

Renderers used for large tables, logs, and charts should stay deterministic and
bounded by visible rows or sampled width. `npm run benchmark` is the baseline
for spotting regressions before adding heavier application blocks.

## Packaging

Package exports and `tsup` entries are generated from source layout by
`npm run package:generate`. CI checks the generated files with
`npm run package:check`.
