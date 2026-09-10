import { mergeProps as mergeCoreProps } from "@zag-js/core"

type Props = Record<string | symbol, any>

/** Merges Lit's `@event` keys while retaining the core merge semantics. */
export function mergeProps<T extends Props>(...args: Array<T | undefined>): T {
  const regular: Props[] = []
  const events: Props[] = []

  for (const props of args) {
    if (!props) continue
    const normal: Props = {}
    const event: Props = {}
    for (const key of Reflect.ownKeys(props)) {
      const value = props[key as keyof typeof props]
      if (typeof key === "string" && key.startsWith("@")) event[`on${key.slice(1)}`] = value
      else normal[key] = value
    }
    regular.push(normal)
    if (Object.keys(event).length) events.push(event)
  }

  const result: Props = { ...mergeCoreProps(...regular) }
  const mergedEvents = mergeCoreProps(...events)
  for (const key of Object.keys(mergedEvents)) result[`@${key.slice(2)}`] = mergedEvents[key]
  for (const symbol of Object.getOwnPropertySymbols(mergedEvents)) result[symbol] = mergedEvents[symbol]
  return result as T
}
