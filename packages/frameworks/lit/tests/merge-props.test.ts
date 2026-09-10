import { mergeProps } from "../src/merge-props"

describe("mergeProps", () => {
  test("chains Lit event props in order and preserves core merging", () => {
    const calls: string[] = []
    const result = mergeProps(
      { "@click": () => calls.push("first"), class: "a", style: { color: "red" } },
      { "@click": () => calls.push("second"), class: "b", style: { display: "block" }, "data-ownedby": "one" },
    )

    ;(result as any)["@click"](new Event("click"))
    expect(calls).toEqual(["second", "first"])
    expect(result.class).toBe("a b")
    expect(result.style).toEqual({ color: "red", display: "block" })
    expect(result["data-ownedby"]).toBe("one")
  })

  test("does not reinterpret ordinary on* props as Lit events", () => {
    const onClick = () => undefined
    const result = mergeProps({ onClick })
    expect(result.onClick).toBe(onClick)
    expect((result as any)["@Click"]).toBeUndefined()
  })
})
