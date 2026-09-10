import { createMachine, MachineStatus } from "@zag-js/core"
import { MachineController } from "../src/machine-controller"

const tick = () => Promise.resolve().then(() => Promise.resolve())

describe("MachineController", () => {
  test("applies changed initial props, updates the host, and reconnects", async () => {
    let props = { initial: "idle", value: 0 }
    const machine = createMachine<any>({
      initialState: ({ prop }) => prop("initial"),
      context: ({ bindable, prop }) => ({ value: bindable(() => ({ defaultValue: prop("value") })) }),
      states: { idle: {}, done: { on: { NEXT: { target: "final" } } }, final: {} },
    })
    class TestHost extends HTMLElement {
      updates = 0
      controllers: unknown[] = []
      addController(controller: unknown) {
        this.controllers.push(controller)
      }
      removeController(controller: unknown) {
        this.controllers = this.controllers.filter((item) => item !== controller)
      }
      requestUpdate() {
        this.updates++
      }
      updateComplete = Promise.resolve(true)
    }
    customElements.define("lit-test-host", TestHost)
    const host = document.createElement("lit-test-host") as TestHost
    const controller = new MachineController(host, machine, () => props)
    controller.hostConnected()
    props = { initial: "done", value: 42 }
    controller.hostUpdate()
    controller.hostUpdated()
    controller.hostUpdated()
    expect(controller.service.getStatus()).toBe(MachineStatus.Started)
    expect(controller.service.state.matches("done")).toBe(true)
    expect(controller.service.context.get("value")).toBe(42)
    controller.service.send({ type: "NEXT" })
    await tick()
    expect(host.updates).toBeGreaterThan(0)
    controller.hostDisconnected()
    expect(controller.service.getStatus()).toBe(MachineStatus.Stopped)
    controller.hostConnected()
    controller.hostUpdated()
    await tick()
    expect(controller.service.getStatus()).toBe(MachineStatus.Started)
  })

  test("does not stop twice when reconnecting after start", () => {
    const onExit = vi.fn()
    const machine = createMachine<any>({
      initialState: () => "idle",
      states: { idle: {} },
      exit: ["onExit"],
      implementations: { actions: { onExit } },
    })
    const host = document.createElement("lit-test-host") as any
    const controller = new MachineController(host, machine)

    controller.hostConnected()
    controller.hostUpdated()
    controller.hostDisconnected()
    expect(onExit).toHaveBeenCalledTimes(1)

    controller.hostConnected()
    expect(onExit).toHaveBeenCalledTimes(1)
    controller.hostUpdated()
    expect(controller.service.getStatus()).toBe(MachineStatus.Started)
  })

  test("reconnects before the first update without losing notifications", async () => {
    const machine = createMachine<any>({
      initialState: () => "idle",
      states: { idle: { on: { NEXT: { target: "done" } } }, done: {} },
    })
    const host = document.createElement("lit-test-host") as any
    host.updates = 0
    const controller = new MachineController(host, machine)

    controller.hostConnected()
    controller.hostDisconnected()
    controller.hostConnected()
    controller.hostUpdated()
    controller.service.send({ type: "NEXT" })
    await tick()

    expect(controller.service.state.matches("done")).toBe(true)
    expect(host.updates).toBeGreaterThan(0)
  })

  test("updates removed props without resetting machine state", async () => {
    let props: Record<string, unknown> = { enabled: true }
    const machine = createMachine<any>({
      props: ({ props }) => ({ enabled: false, ...props }),
      initialState: () => "idle",
      states: { idle: { on: { NEXT: { target: "done" } } }, done: {} },
    })
    const host = document.createElement("lit-test-host") as any
    const controller = new MachineController(host, machine, () => props)
    controller.hostConnected()
    controller.hostUpdated()
    expect(controller.service.prop("enabled")).toBe(true)
    controller.service.send({ type: "NEXT" })
    await tick()

    props = {}
    controller.hostUpdate()
    controller.hostUpdated()

    expect(controller.service.prop("enabled")).toBe(false)
    expect(controller.service.state.matches("done")).toBe(true)
  })

  test("recreates the machine when scope props change", () => {
    const firstRoot = document.implementation.createHTMLDocument("first")
    const secondRoot = document.implementation.createHTMLDocument("second")
    let props = { id: "first", getRootNode: () => firstRoot }
    const machine = createMachine<any>({ initialState: () => "idle", states: { idle: {} } })
    const host = document.createElement("lit-test-host") as any
    const controller = new MachineController(host, machine, () => props)
    controller.hostConnected()
    controller.hostUpdated()

    props = { id: "second", getRootNode: () => secondRoot }
    controller.hostUpdate()
    controller.hostUpdated()

    expect(controller.service.scope.id).toBe("second")
    expect(controller.service.scope.getRootNode()).toBe(secondRoot)
  })

  test("detects same-source id callbacks that capture different values", () => {
    const createIds = (prefix: string) => ({ trigger: () => `${prefix}-trigger` })
    let props = { id: "menu", ids: createIds("first") }
    const machine = createMachine<any>({ initialState: () => "idle", states: { idle: {} } })
    const host = document.createElement("lit-test-host") as any
    const controller = new MachineController(host, machine, () => props)
    controller.hostConnected()
    controller.hostUpdated()

    props = { id: "menu", ids: createIds("second") }
    controller.hostUpdate()
    controller.hostUpdated()

    expect(controller.service.scope.ids?.trigger()).toBe("second-trigger")
  })

  test("preserves state when inline id callbacks are recreated", async () => {
    const getProps = () => ({ ids: { item: (value: string) => `item-${value}` } })
    const machine = createMachine<any>({
      initialState: () => "idle",
      states: { idle: { on: { NEXT: { target: "done" } } }, done: {} },
    })
    const host = document.createElement("lit-test-host") as any
    const controller = new MachineController(host, machine, getProps)
    controller.hostConnected()
    controller.hostUpdated()
    controller.service.send({ type: "NEXT" })
    await tick()

    controller.hostUpdate()
    controller.hostUpdated()

    expect(controller.service.state.matches("done")).toBe(true)
    expect(controller.service.scope.ids?.item("a")).toBe("item-a")
  })
})
