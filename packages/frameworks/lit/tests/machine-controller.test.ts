import { createMachine, MachineStatus } from "@zag-js/core"
import { MachineController } from "../src/machine-controller"

const tick = () => Promise.resolve().then(() => Promise.resolve())

describe("MachineController", () => {
  test("starts once, requests updates, and recreates after disconnect", async () => {
    const machine = createMachine<any>({ initialState: () => "idle", states: { idle: {} } })
    const host = { addController: vi.fn(), requestUpdate: vi.fn() } as any
    const controller = new MachineController(host, machine)
    controller.hostConnected()
    controller.hostUpdated()
    controller.hostUpdated()
    expect(controller.service.getStatus()).toBe(MachineStatus.Started)
    controller.service.context
    controller.hostDisconnected()
    expect(controller.service.getStatus()).toBe(MachineStatus.Stopped)
    controller.hostConnected()
    controller.hostUpdated()
    await tick()
    expect(controller.service.getStatus()).toBe(MachineStatus.Started)
    expect(host.requestUpdate).not.toHaveBeenCalled()
  })
})
