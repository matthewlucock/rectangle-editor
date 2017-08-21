import { ToolInterface } from "./tool/tool"
import { ToolManagerInterface } from "./tool/manager"
import { ToolbarItemInterface, ToolbarItem } from "./toolbarItem"

export interface ToolbarInterface {
  readonly items: Array<ToolbarItemInterface>
}

/** A class for managing the toolbar in the editor. */
export class Toolbar implements ToolbarInterface {
  readonly items: Array<ToolbarItemInterface>

  protected readonly element: HTMLElement
  protected readonly itemsListElement: HTMLElement

  constructor(protected toolManager: ToolManagerInterface) {
    this.element = document.getElementById('toolbar')
    this.itemsListElement = document.getElementById('toolbar-items')
    this.items = []
    this.bindListeners()
  }

  /** Add a tool to the toolbar. */
  protected addTool(tool: ToolInterface): void {
    const toolbarItem = new ToolbarItem(tool)
    this.items.push(toolbarItem)
    this.itemsListElement.appendChild(toolbarItem.element)

    toolbarItem.element.addEventListener('click', () => {
      this.toolManager.select(tool)
    })
  }

  /**
   * Bind event listeners required for the proper functioning of the toolbar.
   * @listens ToolManager#add
   */
  protected bindListeners(): void {
    this.toolManager.on('add', this.addTool.bind(this))
  }
}
