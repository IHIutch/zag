import { html } from "lit"
import { customElement } from "lit/decorators.js"
import * as menu from "@zag-js/menu"
import { MachineController, normalizeProps, spreadProps as spread } from "@zag-js/lit"
import { nanoid } from "nanoid"
import { PageElement } from "../lib/page-element"

const items = [
  ...Array.from({ length: 20 }, (_, index) => ({ label: `Item ${index}`, value: `item-${index}` })),
  { label: "Zebra", value: "zebra" },
  ...Array.from({ length: 20 }, (_, index) => ({ label: `Item ${index + 20}`, value: `item-${index + 20}` })),
]

@customElement("menu-overflow-page")
export class MenuOverflowPage extends PageElement {
  private machineId = nanoid(5)
  private machine = new MachineController(this, menu.machine, () => ({
    getRootNode: () => this.ownerDocument,
    id: this.machineId,
  }))

  render() {
    const api = menu.connect(this.machine.service, normalizeProps)

    return html`
      <main class="menu">
        <button ${spread(api.getTriggerProps())}>Actions <span ${spread(api.getIndicatorProps())}>▾</span></button>
        ${
          api.open
            ? html`
                <div ${spread(api.getPositionerProps())}>
                  <ul ${spread({ ...api.getContentProps(), style: "max-height:200px;overflow-y:auto;" })}>
                    ${items.map(
                      (item) => html`<li ${spread(api.getItemProps({ value: item.value }))}>${item.label}</li>`,
                    )}
                  </ul>
                </div>
              `
            : ""
        }
      </main>
    `
  }
}
