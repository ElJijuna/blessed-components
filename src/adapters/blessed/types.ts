import type blessed from 'blessed';

/**
 * Shared imperative contract implemented by Blessed component adapters.
 *
 * Adapters own one element but never own the parent screen. Imperative data
 * updates do not call `screen.render()`, which lets applications batch them
 * before flushing the terminal. Interactive adapters may render after direct
 * keyboard or mouse input so focus and selection feedback is immediately
 * visible.
 *
 * @typeParam TData - Complete renderer input accepted by {@link setData}.
 * @typeParam TElement - Blessed element owned by the adapter.
 */
export interface BlessedComponentHandle<
  TData,
  TElement extends blessed.Widgets.Node = blessed.Widgets.BoxElement,
> {
  /** Underlying Blessed element available for standard element operations. */
  readonly element: TElement;

  /** Destroys and detaches the owned element without destroying its parent. */
  destroy(): void;

  /**
   * Re-renders component content using complete replacement data.
   *
   * The element identity is preserved. Call `screen.render()` explicitly when
   * one or more updates should become visible.
   */
  setData(data: TData): void;
}
