import { ToolInterface } from "./tool/tool"

export interface ToolbarItemInterface {
  readonly tool: ToolInterface
  readonly element: HTMLElement
}

/**
 * Represents an item in the list of tools in the toolbar, presenting an icon
 * which can be clicked to select the corresponding tool.
 */
export class ToolbarItem implements ToolbarItemInterface {
  static readonly itemClassName = 'toolbar-item'
  static readonly selectedClassName = 'toolbar-item-selected'

  readonly element: HTMLElement

  constructor(public readonly tool: ToolInterface) {
    this.element = document.createElement('li')
    this.element.id = tool.toolbarItemId
    this.element.classList.add(ToolbarItem.itemClassName)

    this.bindListeners()
  }

  /** Select the toolbar item in the toolbar, giving it a highlighted style. */
  protected select(): void {
    this.element.classList.add(ToolbarItem.selectedClassName)
  }

  /**
   * Deselect the toolbar item in the toolbar, removing its highlighted style.
   */
  protected deselect(): void {
    this.element.classList.remove(ToolbarItem.selectedClassName)
  }

  /**
   * Bind event listeners required for the proper functioning of the toolbar
   * item.
   * @fires Tool#select
   * @fires Tool#deselect
   */
  protected bindListeners(): void {
    this.tool.on('select', this.select.bind(this))
    this.tool.on('deselect', this.deselect.bind(this))
  }
}
