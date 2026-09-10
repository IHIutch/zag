import { html } from "lit"
import { customElement } from "lit/decorators.js"
import * as popover from "@zag-js/popover"
import { MachineController, normalizeProps, spreadProps as spread } from "@zag-js/lit"
import { nanoid } from "nanoid"
import { PageElement } from "../lib/page-element"

@customElement("popover-single-tab-stop-page")
export class PopoverSingleTabStopPage extends PageElement {
  private machineId = nanoid(5)
  private machine = new MachineController(this, popover.machine, () => ({
    getRootNode: () => this.ownerDocument,
    id: this.machineId,
    modal: true,
  }))

  render() {
    const api = popover.connect(this.machine.service, normalizeProps)

    return html`
      <main class="popover">
        <div data-part="root">
          <button data-testid="button-before">Button :before</button>
          <button data-testid="popover-trigger" ${spread(api.getTriggerProps())}>Sort by</button>
          ${
            api.open
              ? html`
                  <div ${spread(api.getPositionerProps())}>
                    <div data-testid="popover-content" class="popover-content" ${spread(api.getContentProps())}>
                      <fieldset style="border:none;padding:0">
                        <label>
                          <input data-testid="radio-name-asc" type="radio" name="sort" value="name-asc" checked />
                          Name (A to Z)
                        </label>
                        <label>
                          <input data-testid="radio-name-desc" type="radio" name="sort" value="name-desc" /> Name (Z to
                          A)
                        </label>
                        <label>
                          <input data-testid="radio-hours" type="radio" name="sort" value="hours" /> Hours
                        </label>
                      </fieldset>
                    </div>
                  </div>
                `
              : ""
          }
          <button data-testid="button-after">Button :after</button>
        </div>
      </main>
    `
  }
}
