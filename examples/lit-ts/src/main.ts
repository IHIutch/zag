import { LitElement } from "lit"
import { customElement, property } from "lit/decorators.js"
import { html, unsafeStatic } from "lit/static-html.js"
import "@zag-js/shared/src/style.css"
import "./main.css"

// Import toolbar components
import "./components/toolbar"
import "./components/state-visualizer"

// The example suite intentionally ships only components covered by Lit E2E tests.
import "./pages/accordion"
import "./pages/checkbox"
import "./pages/toggle-group"

const routes = [
  ["/accordion", "Accordion", "accordion-page"],
  ["/checkbox", "Checkbox", "checkbox-page"],
  ["/toggle-group", "Toggle group", "toggle-group-page"],
] as const

@customElement("zag-app")
export class ZagApp extends LitElement {
  // Light dom (no shadow root) due to css
  protected createRenderRoot() {
    return this
  }

  @property({ type: String })
  currentPath = window.location.pathname

  connectedCallback() {
    super.connectedCallback()
    this.updatePath()
    window.addEventListener("popstate", this.updatePath)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    window.removeEventListener("popstate", this.updatePath)
  }

  private updatePath = () => {
    this.currentPath = window.location.pathname
  }

  private navigate(path: string) {
    window.history.pushState({}, "", path)
    this.currentPath = path
  }

  private renderContent() {
    const route = routes.find(([path]) => this.currentPath === path || this.currentPath.startsWith(`${path}/`))
    return route
      ? html`<${unsafeStatic(route[2])} class="component-page"></${unsafeStatic(route[2])}>`
      : this.renderHome()
  }

  private renderHome() {
    return html`
      <div class="index-nav">
        <h2>Zag.js + Lit</h2>
        <p>Select a component from the sidebar to see it in action.</p>
      </div>
    `
  }

  render() {
    return html`
      <div class="page">
        <aside class="nav">
          <header>Zagjs</header>
          <a
            href="/"
            ?data-active=${this.currentPath === "/"}
            @click=${(e: Event) => {
              e.preventDefault()
              this.navigate("/")
            }}
          >
            Home
          </a>
          ${routes.map(
            ([path, label]) => html`
              <a
                href=${path}
                ?data-active=${this.currentPath === path}
                @click=${(e: Event) => {
                  e.preventDefault()
                  this.navigate(path)
                }}
              >
                ${label}
              </a>
            `,
          )}
        </aside>
        ${this.renderContent()}
      </div>
    `
  }
}
