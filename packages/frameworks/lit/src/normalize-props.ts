import { createNormalizer } from "@zag-js/types"

export interface AttrMap {
  [key: string]: string
}

export const propMap: AttrMap = {
  onFocus: "onFocusin",
  onBlur: "onFocusout",
  onChange: "onInput",
  onDoubleClick: "onDblclick",
  htmlFor: "for",
  className: "class",
  defaultValue: "value",
  defaultChecked: "checked",
  defaultSelected: "selected",
}

const properties = new Set(["value", "checked", "selected", "indeterminate", "multiple"])
const enumeratedAttributes = new Set(["contenteditable", "draggable", "spellcheck"])
const caseSensitiveSvgAttrs = new Set([
  "viewBox",
  "preserveAspectRatio",
  "clipPath",
  "clipRule",
  "fillRule",
  "strokeWidth",
  "strokeLinecap",
  "strokeLinejoin",
  "strokeDasharray",
  "strokeDashoffset",
  "strokeMiterlimit",
])

export const toStyleString = (style: Record<string, unknown>) =>
  Object.entries(style).reduce((result, [key, value]) => {
    if (value == null) return result
    const name = key.startsWith("--") ? key : key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
    return `${result}${name}:${value};`
  }, "")

export const normalizeProps = createNormalizer((props: Record<string, unknown>) => {
  const normalized: Record<string, unknown> = {}
  for (let [key, value] of Object.entries(props)) {
    if (value === undefined) continue
    key = propMap[key] ?? key
    if (key === "style" && typeof value === "object" && value !== null) {
      normalized.style = value
      continue
    }
    if (key.startsWith("on") && typeof value === "function") {
      normalized[`@${key.slice(2).toLowerCase()}`] = value
      continue
    }
    const lowerKey = key.toLowerCase()
    if (properties.has(lowerKey)) {
      normalized[`.${lowerKey}`] = value
      continue
    }
    if (key.startsWith("aria-") || enumeratedAttributes.has(lowerKey)) {
      normalized[lowerKey] = typeof value === "boolean" ? String(value) : value
      continue
    }
    if (typeof value === "boolean") normalized[`?${lowerKey}`] = value
    else normalized[caseSensitiveSvgAttrs.has(key) ? key : lowerKey] = value
  }
  return normalized
})
