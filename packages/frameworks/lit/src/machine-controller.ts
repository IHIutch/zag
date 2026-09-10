import { MachineStatus, type Machine, type MachineSchema, type Service } from "@zag-js/core"
import { isEqual } from "@zag-js/utils"
import { VanillaMachine } from "@zag-js/vanilla"
import type { ReactiveController, ReactiveControllerHost } from "lit"

export type LitHost = ReactiveControllerHost & HTMLElement

export class MachineController<T extends MachineSchema> implements ReactiveController {
  private machine: VanillaMachine<T>
  private unsubscribe: VoidFunction | undefined
  private connected = false
  private recreateOnConnect = false
  private previousProps: Partial<T["props"]>
  private readonly getProps: () => Partial<T["props"]>
  private readonly getRootNode = () => {
    const getRootNode = (this.getProps() as Record<string, unknown>).getRootNode
    return typeof getRootNode === "function" ? getRootNode() : this.host.ownerDocument
  }
  private readonly getMachineProps = () => ({ ...this.getProps(), getRootNode: this.getRootNode })

  constructor(
    private readonly host: LitHost,
    private readonly machineConfig: Machine<T>,
    getProps?: () => Partial<T["props"]>,
  ) {
    this.getProps = () => getProps?.() ?? {}
    this.previousProps = this.getProps()
    this.machine = new VanillaMachine(machineConfig, this.getMachineProps)
    host.addController(this)
  }

  private recreateMachine(stopCurrent: boolean) {
    this.unsubscribe?.()
    this.unsubscribe = undefined
    if (stopCurrent && this.machine.service.getStatus() === MachineStatus.Started) this.machine.stop()
    this.machine = new VanillaMachine(this.machineConfig, this.getMachineProps)
    this.updateScope(this.getProps())
    if (this.connected) this.subscribe()
  }

  private subscribe() {
    this.unsubscribe = this.machine.subscribe(() => this.host.requestUpdate())
  }

  private propsAreEqual(previous: Partial<T["props"]>, next: Partial<T["props"]>) {
    return isEqual(previous, next) && isEqual(next, previous)
  }

  private updateScope(props: Partial<T["props"]>) {
    const { id, ids } = props as Record<string, unknown>
    this.machine.scope.id = id as string | undefined
    this.machine.scope.ids = ids as Record<string, unknown> | undefined
  }

  hostConnected() {
    this.connected = true
    if (this.recreateOnConnect) this.recreateMachine(false)
    else this.subscribe()
    this.recreateOnConnect = false
  }

  hostUpdate() {
    const nextProps = this.getProps()
    this.updateScope(nextProps)
    if (this.propsAreEqual(this.previousProps, nextProps)) return
    this.previousProps = nextProps
    if (this.machine.service.getStatus() !== MachineStatus.Started) {
      this.recreateMachine(true)
      return
    }
    this.machine.updateProps(this.getMachineProps)
  }

  hostUpdated() {
    if (this.machine.service.getStatus() === MachineStatus.Started) return
    this.machine.start()
  }

  hostDisconnected() {
    this.connected = false
    this.unsubscribe?.()
    this.unsubscribe = undefined
    if (this.machine.service.getStatus() === MachineStatus.Started) {
      this.machine.stop()
      this.recreateOnConnect = true
    }
  }

  get service(): Service<T> {
    return this.machine.service
  }
}
