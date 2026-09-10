import { html } from "lit"
import { customElement } from "lit/decorators.js"
import * as menu from "@zag-js/menu"
import { menuControls } from "@zag-js/shared"
import { MachineController, normalizeProps, spreadProps as spread } from "@zag-js/lit"
import { nanoid } from "nanoid"
import { ControlsController } from "../lib/controls-controller"
import { PageElement } from "../lib/page-element"

@customElement("menu-page")
export class MenuPage extends PageElement {
  private controls = new ControlsController(this, menuControls)
  private machineId = nanoid(5)

  private machine = new MachineController(this, menu.machine, () => ({
    getRootNode: () => this.ownerDocument,
    id: this.machineId,
    onSelect: console.log,
    ...this.controls.context,
  }))

  render() {
    const api = menu.connect(this.machine.service, normalizeProps)

    return html`
      <main class="menu">
        <div>
          <button ${spread(api.getTriggerProps())}>Actions <span ${spread(api.getIndicatorProps())}>▾</span></button>
          ${
            api.open
              ? html`
                  <div ${spread(api.getPositionerProps())}>
                    <ul ${spread(api.getContentProps())}>
                      <li data-testid="menu-item-edit" ${spread(api.getItemProps({ value: "edit" }))}>Edit</li>
                      <li data-testid="menu-item-duplicate" ${spread(api.getItemProps({ value: "duplicate" }))}>
                        Duplicate
                      </li>
                      <li data-testid="menu-item-delete" ${spread(api.getItemProps({ value: "delete" }))}>Delete</li>
                      <li data-testid="menu-item-export" ${spread(api.getItemProps({ value: "export" }))}>Export...</li>
                    </ul>
                  </div>
                `
              : ""
          }
        </div>
      </main>

      <zag-toolbar .controls=${this.controls}>
        <state-visualizer .state=${this.machine.service}></state-visualizer>
      </zag-toolbar>
    `
  }
}
