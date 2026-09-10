import { html } from "lit"
import { customElement } from "lit/decorators.js"
import { spread } from "@open-wc/lit-helpers"
import * as collapsible from "@zag-js/collapsible"
import { collapsibleControls } from "@zag-js/shared"
import { MachineController, normalizeProps } from "@zag-js/lit"
import { nanoid } from "nanoid"
import { ControlsController } from "../lib/controls-controller"
import { PageElement } from "../lib/page-element"
import { ChevronDown, createElement } from "lucide"

@customElement("collapsible-page")
export class CollapsiblePage extends PageElement {
  private controls = new ControlsController(this, collapsibleControls)
  private machineId = nanoid(5)

  private machine = new MachineController(this, collapsible.machine, () => ({
    getRootNode: () => this.ownerDocument,
    id: this.machineId,
    ...this.controls.context,
  }))

  render() {
    const api = collapsible.connect(this.machine.service, normalizeProps)

    return html`
      <main class="collapsible">
        <div ${spread(api.getRootProps())}>
          <button ${spread(api.getTriggerProps())}>
            Collapsible Trigger
            <div ${spread(api.getIndicatorProps())}>${createElement(ChevronDown)}</div>
          </button>
          <div ${spread(api.getContentProps())}>
            <p>
              Lorem dfd dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna sfsd. Ut enim ad minimdfd v eniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
              ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
              fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum. <a href="#">Some Link</a>
            </p>
          </div>
        </div>

        <div>
          <div>Toggle Controls</div>
          <button data-testid="open-button" @click=${() => api.setOpen(true)}>Open</button>
          <button @click=${() => api.setOpen(false)}>Close</button>
        </div>
      </main>

      <zag-toolbar .controls=${this.controls}>
        <state-visualizer .state=${this.machine.service} .omit=${["stylesRef"]}></state-visualizer>
      </zag-toolbar>
    `
  }
}
