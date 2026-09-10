import { html, render } from "lit"
import { spreadProps } from "../src/spread-props"

describe("spreadProps", () => {
  test("replaces changed event handlers instead of accumulating them", () => {
    const container = document.createElement("div")
    const first = vi.fn()
    const second = vi.fn()
    const template = (props: Record<string, unknown>) => html`<button ${spreadProps(props)}></button>`

    render(template({ "@click": first }), container)
    container.querySelector("button")!.click()

    render(template({ "@click": second }), container)
    container.querySelector("button")!.click()

    expect(first).toHaveBeenCalledTimes(1)
    expect(second).toHaveBeenCalledTimes(1)
  })

  test("supports Lit event listener objects and their options", () => {
    const container = document.createElement("div")
    const handleEvent = vi.fn()
    const listener = { handleEvent, once: true }

    render(html`<button ${spreadProps({ "@click": listener })}></button>`, container)
    const button = container.querySelector("button")!
    button.click()
    button.click()

    expect(handleEvent).toHaveBeenCalledTimes(1)
  })

  test("updates and removes attributes, boolean attributes, and properties", () => {
    const container = document.createElement("div")
    const template = (props: Record<string, unknown>) => html`<input ${spreadProps(props)} />`

    render(template({ title: "ready", "?disabled": true, ".value": "first" }), container)

    let input = container.querySelector("input")!
    expect(input.title).toBe("ready")
    expect(input.disabled).toBe(true)
    expect(input.value).toBe("first")

    render(template({ ".value": "second" }), container)
    input = container.querySelector("input")!
    expect(input.hasAttribute("title")).toBe(false)
    expect(input.disabled).toBe(false)
    expect(input.value).toBe("second")
  })

  test("reconciles owned styles without erasing imperative styles", () => {
    const container = document.createElement("div")
    const template = (style: Record<string, unknown>) => html`<div ${spreadProps({ style })}></div>`

    render(template({ color: "red", marginTop: "2px" }), container)
    const element = container.querySelector("div")!
    element.style.setProperty("--x", "10px")

    render(template({ color: "blue" }), container)

    expect(element.style.color).toBe("blue")
    expect(element.style.marginTop).toBe("")
    expect(element.style.getPropertyValue("--x")).toBe("10px")
  })

  test("clears string-owned declarations when switching to a style object", () => {
    const container = document.createElement("div")
    const template = (style: string | Record<string, unknown>) => html`<div ${spreadProps({ style })}></div>`

    render(template("color:red;margin-top:2px"), container)
    const element = container.querySelector("div")!
    render(template({ color: "blue" }), container)

    expect(element.style.color).toBe("blue")
    expect(element.style.marginTop).toBe("")
  })
})
