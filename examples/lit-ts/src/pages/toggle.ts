import { html } from "lit"
import { customElement } from "lit/decorators.js"
import * as toggle from "@zag-js/toggle"
import { MachineController, normalizeProps, spreadProps as spread } from "@zag-js/lit"
import { Bold, createElement } from "lucide"
import { PageElement } from "../lib/page-element"

@customElement("toggle-page")
export class TogglePage extends PageElement {
  private machine = new MachineController(this, toggle.machine)

  render() {
    const api = toggle.connect(this.machine.service, normalizeProps)

    return html`
      <main class="toggle">
        <button ${spread(api.getRootProps())}>
          <span ${spread(api.getIndicatorProps())}> ${createElement(Bold)} </span>
        </button>
      </main>

      <zag-toolbar>
        <state-visualizer .state=${this.machine.service}></state-visualizer>
      </zag-toolbar>
    `
  }
}
