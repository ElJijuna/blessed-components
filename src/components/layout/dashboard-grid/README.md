# DashboardGrid

`DashboardGrid` is a responsive auto-flow layout for dashboard widgets. It
chooses columns from breakpoints, supports column/row spans and minimum widget
heights, and reports total scrollable content height.

```ts
const dashboard = dashboardGrid({ parent: screen, data: { items: [{ id: 'health', columnSpan: 2 }] } })
blessed.box({ parent: dashboard.slot('health') })
```
