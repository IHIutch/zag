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
})
