import { normalizeProps } from "../src/normalize-props"

describe("normalizeProps", () => {
  test("normalizes events, properties, booleans, aliases, styles, and aria", () => {
    const click = () => undefined
    expect(
      normalizeProps.element({
        onClick: click,
        disabled: true,
        value: "x",
        "aria-hidden": "true",
        className: "x",
        style: { marginTop: "2px" },
      }),
    ).toEqual({
      "@click": click,
      "?disabled": true,
      ".value": "x",
      "aria-hidden": "true",
      class: "x",
      style: "margin-top:2px;",
    })
  })

  test("preserves SVG attribute case", () => {
    expect(normalizeProps.svg({ viewBox: "0 0 10 10", strokeWidth: 2 })).toEqual({
      viewBox: "0 0 10 10",
      strokeWidth: 2,
    })
  })
})
