import * as EventEmitter from "events"

import { UnmanagedToolError } from "../utilities"
import { ToolInterface, Tool } from "./tool"

export interface ToolManagerInterface extends EventEmitter {
  readonly tools: Array<ToolInterface>
  selectedTool: ToolInterface
  add(tool: ToolInterface): void
  select(tool: ToolInterface): void
}

/**
 * A class that manages the tools in the editor, including which tool is
 * currently selected.
 */
export class ToolManager extends EventEmitter implements ToolManagerInterface {
  readonly tools: Array<ToolInterface>
  selectedTool: ToolInterface

  constructor() {
    super()
    this.tools = []
  }

  /**
   * Throw an error if the passed tool is not being managed by the tool manager.
   * @throws {UnmanagedToolError}
   */
  protected errorIfNotManagingTool(tool: ToolInterface): void {
    if (!this.tools.includes(tool)) throw new UnmanagedToolError()
  }

  /**
   * Add a tool to the tool manager.
   * @fires ToolManager#add
   */
  add(tool: ToolInterface): void {
    this.tools.push(tool)
    this.emit('add', tool)
  }

  /**
   * Select a tool in the tool manager.
   * @fires ToolManager#select
   * @fires ToolManager#deselect
   * @fires Tool#select
   * @fires Tool#deselect
   */
  select(tool: ToolInterface): void {
    this.errorIfNotManagingTool(tool)

    // Do nothing if the tool to be selected is already selected.
    if (this.selectedTool === tool) return

    // Deselect the selected tool if a tool is currently selected.
    if (this.selectedTool) {
      this.emit('deselect', this.selectedTool)
      this.selectedTool.emit('deselect')
    }

    this.selectedTool = tool
    this.emit('select', tool)
    tool.emit('select')
  }
}

/**
 * @event ToolManager#add
 * @description Fired when a tool is added to the set of tools being managed.
 * The value is the added tool.
 */

/**
 * @event ToolManager#select
 * @description Fired when a tool is selected.
 * The value is selected tool.
 */

/**
 * @event ToolManager#deselect
 * @description Fired when a tool is deselected.
 * The value is the deselected tool.
 */
