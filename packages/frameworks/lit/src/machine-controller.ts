import type { Machine, MachineSchema, Service } from "@zag-js/core"
import { isEqual } from "@zag-js/utils"
import { VanillaMachine } from "@zag-js/vanilla"
import type { ReactiveController, ReactiveControllerHost } from "lit"

export type LitHost = ReactiveControllerHost & HTMLElement

export class MachineController<T extends MachineSchema> implements ReactiveController {
  private machine: VanillaMachine<T>
  private unsubscribe: VoidFunction | undefined
  private started = false
  private previousProps: Partial<T["props"]>
  private readonly getProps: () => Partial<T["props"]>

  constructor(
    private readonly host: LitHost,
    private readonly machineConfig: Machine<T>,
    getProps?: () => Partial<T["props"]>,
  ) {
    this.getProps = () => getProps?.() ?? {}
    this.previousProps = this.getProps()
    this.machine = new VanillaMachine(machineConfig, this.getProps)
    host.addController(this)
  }

  private recreateMachine() {
    this.unsubscribe?.()
    this.unsubscribe = undefined
    this.machine.stop()
    this.machine = new VanillaMachine(this.machineConfig, this.getProps)
    this.unsubscribe = this.machine.subscribe(() => this.host.requestUpdate())
  }

  hostConnected() {
    if (this.started) {
      this.recreateMachine()
      this.started = false
    } else {
      this.unsubscribe = this.machine.subscribe(() => this.host.requestUpdate())
    }
  }

  hostUpdate() {
    const nextProps = this.getProps()
    if (isEqual(this.previousProps, nextProps)) return
    this.previousProps = nextProps
    if (!this.started) {
      this.recreateMachine()
      return
    }
    this.machine.updateProps(this.getProps)
  }

  hostUpdated() {
    if (this.started) return
    this.started = true
    this.machine.start()
  }

  hostDisconnected() {
    this.unsubscribe?.()
    this.unsubscribe = undefined
    this.machine.stop()
  }

  get service(): Service<T> {
    return this.machine.service
  }
}
