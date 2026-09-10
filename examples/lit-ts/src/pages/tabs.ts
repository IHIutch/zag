import { html } from "lit"
import { customElement } from "lit/decorators.js"
import * as tabs from "@zag-js/tabs"
import { tabsControls, tabsData } from "@zag-js/shared"
import { MachineController, normalizeProps, spreadProps as spread } from "@zag-js/lit"
import { nanoid } from "nanoid"
import { ControlsController } from "../lib/controls-controller"
import { PageElement } from "../lib/page-element"

@customElement("tabs-page")
export class TabsPage extends PageElement {
  private controls = new ControlsController(this, tabsControls)
  private machineId = nanoid(5)

  private machine = new MachineController(this, tabs.machine, () => ({
    getRootNode: () => this.ownerDocument,
    id: this.machineId,
    defaultValue: "nils",
    ...this.controls.context,
  }))

  render() {
    const api = tabs.connect(this.machine.service, normalizeProps)

    return html`
      <main class="tabs">
        <div ${spread(api.getRootProps())}>
          <div ${spread(api.getIndicatorProps())}></div>
          <div ${spread(api.getListProps())}>
            ${tabsData.map(
              (data) => html`
                <button ${spread(api.getTriggerProps({ value: data.id }))} data-testid="${data.id}-tab">
                  ${data.label}
                </button>
              `,
            )}
          </div>
          ${tabsData.map(
            (data) => html`
              <div ${spread(api.getContentProps({ value: data.id }))} data-testid="${data.id}-tab-panel">
                <p>${data.content}</p>
                ${data.id === "agnes" ? html`<input placeholder="Agnes" />` : null}
              </div>
            `,
          )}
        </div>
      </main>

      <zag-toolbar .controls=${this.controls}>
        <state-visualizer .state=${this.machine.service}></state-visualizer>
      </zag-toolbar>
    `
  }
}
