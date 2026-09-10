import { html } from "lit"
import { customElement } from "lit/decorators.js"
import * as popover from "@zag-js/popover"
import { MachineController, normalizeProps, spreadProps as spread } from "@zag-js/lit"
import { nanoid } from "nanoid"
import { PageElement } from "../lib/page-element"

@customElement("popover-trigger-last-page")
export class PopoverTriggerLastPage extends PageElement {
  private machineId = nanoid(5)
  private machine = new MachineController(this, popover.machine, () => ({
    getRootNode: () => this.ownerDocument,
    id: this.machineId,
    modal: false,
    portalled: true,
  }))

  render() {
    const api = popover.connect(this.machine.service, normalizeProps)

    return html`
      <main class="popover">
        <div data-part="root">
          <button data-testid="button-before">Button :before</button>
          <button data-testid="popover-trigger" ${spread(api.getTriggerProps())}>Click me</button>
          ${
            api.open
              ? html`
                  <div ${spread(api.getPositionerProps())}>
                    <div data-testid="popover-content" class="popover-content" ${spread(api.getContentProps())}>
                      <a href="#" data-testid="focusable-link">Focusable Link</a>
                      <input data-testid="input" placeholder="input" />
                      <button data-testid="popover-close-button" ${spread(api.getCloseTriggerProps())}>X</button>
                    </div>
                  </div>
                `
              : ""
          }
        </div>
      </main>
    `
  }
}
