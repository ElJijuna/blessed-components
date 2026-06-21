export type EventListener<TValue> = (value: TValue) => void;

export interface EventBus<TEvents extends object> {
  clear<TKey extends keyof TEvents>(event?: TKey): void;
  emit<TKey extends keyof TEvents>(event: TKey, value: TEvents[TKey]): void;
  on<TKey extends keyof TEvents>(event: TKey, listener: EventListener<TEvents[TKey]>): () => void;
}

/**
 * Creates a small synchronous typed event bus.
 */
export function createEventBus<TEvents extends object>(): EventBus<TEvents> {
  const listeners = new Map<keyof TEvents, Set<EventListener<TEvents[keyof TEvents]>>>();

  return {
    clear(event) {
      if (event === undefined) {
        listeners.clear();
      } else {
        listeners.delete(event);
      }
    },
    emit(event, value) {
      for (const listener of listeners.get(event) ?? []) {
        listener(value);
      }
    },
    on(event, listener) {
      const eventListeners =
        listeners.get(event) ?? new Set<EventListener<TEvents[keyof TEvents]>>();
      const genericListener = listener as EventListener<TEvents[keyof TEvents]>;

      eventListeners.add(genericListener);
      listeners.set(event, eventListeners);

      return () => {
        eventListeners.delete(genericListener);
      };
    },
  };
}
