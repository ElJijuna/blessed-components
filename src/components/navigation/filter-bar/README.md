# FilterBar

`FilterBar` summarizes the current query, active filters, result count, and
clear/reset actions in a width-aware single line.

Use Left/Right or Shift+Tab/Tab to move between removable filters and actions.
Enter or Space activates the focused target; Delete and Backspace remove the
focused filter. Callers own filtering state and update it through `setData()`.
