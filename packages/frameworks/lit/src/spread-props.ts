import { noChange } from "lit"
import { Directive, PartType, directive, type DirectiveParameters, type PartInfo } from "lit/directive.js"
import type { ElementPart } from "lit"

type Props = Record<string, unknown>

const toCssProperty = (key: string) =>
  key.startsWith("--") ? key : key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)

const applyStyle = (element: Element, previous: unknown, next: unknown) => {
  if (typeof next === "string") {
    element.setAttribute("style", next)
    return
  }

  if (next == null && typeof previous === "string") {
    element.removeAttribute("style")
    return
  }

  if (typeof previous === "string") element.removeAttribute("style")

  const style = (element as HTMLElement).style
  if (style == null) return

  if (previous && typeof previous === "object") {
    for (const key of Object.keys(previous)) {
      if ((next as Props | null)?.[key] == null) style.removeProperty(toCssProperty(key))
    }
  }

  if (next && typeof next === "object") {
    for (const [key, value] of Object.entries(next)) {
      if (value == null) style.removeProperty(toCssProperty(key))
      else style.setProperty(toCssProperty(key), String(value))
    }
  }
}

class SpreadPropsDirective extends Directive {
  private element?: Element
  private previous: Props = {}
  private listeners = new Map<string, { listener: EventListener; options: AddEventListenerOptions | undefined }>()

  constructor(partInfo: PartInfo) {
    super(partInfo)
    if (partInfo.type !== PartType.ELEMENT) throw new Error("spreadProps can only be used in an element binding")
  }

  render(_props: Props) {
    return noChange
  }

  update(part: ElementPart, [props]: DirectiveParameters<this>) {
    this.element = part.element

    for (const key of Object.keys(this.previous)) {
      if (!(key in props)) this.remove(key)
    }

    for (const [key, value] of Object.entries(props)) {
      if (Object.is(value, this.previous[key])) continue
      this.set(key, value)
    }

    this.previous = { ...props }
    return noChange
  }

  private set(key: string, value: unknown) {
    const element = this.element!
    const prefix = key[0]
    const name = key.slice(1)

    if (key === "style") {
      applyStyle(element, this.previous.style, value)
    } else if (prefix === "@") {
      this.remove(key)
      if (value == null) return
      const listener: EventListener = (event) => {
        if (typeof value === "function") value.call(element, event)
        else (value as EventListenerObject).handleEvent(event)
      }
      const options = typeof value === "object" ? (value as AddEventListenerOptions) : undefined
      this.listeners.set(key, { listener, options })
      element.addEventListener(name, listener, options)
    } else if (prefix === ".") {
      ;(element as unknown as Props)[name] = value
    } else if (prefix === "?") {
      element.toggleAttribute(name, Boolean(value))
    } else if (value == null) {
      element.removeAttribute(key)
    } else {
      element.setAttribute(key, String(value))
    }
  }

  private remove(key: string) {
    const element = this.element!
    const prefix = key[0]
    const name = key.slice(1)

    if (key === "style") {
      applyStyle(element, this.previous.style, undefined)
    } else if (prefix === "@") {
      const registered = this.listeners.get(key)
      if (registered) element.removeEventListener(name, registered.listener, registered.options)
      this.listeners.delete(key)
    } else if (prefix === ".") {
      ;(element as unknown as Props)[name] = undefined
    } else if (prefix === "?") {
      element.removeAttribute(name)
    } else {
      element.removeAttribute(key)
    }
  }
}

export const spreadProps = directive(SpreadPropsDirective)
