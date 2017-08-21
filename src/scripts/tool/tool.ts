import * as EventEmitter from 'events'

import { EditorControlsCategoryInterface } from '../editorControlsCategory'

export interface ToolInterface extends EventEmitter {
  controlsCategory: EditorControlsCategoryInterface
  readonly toolbarItemId: string
}

/** A class representing a tool in the editor. */
export class Tool extends EventEmitter implements ToolInterface {
  controlsCategory: EditorControlsCategoryInterface
  toolbarItemId: string
}

/**
 * @event Tool#select
 * @description Fired when the tool is selected.
 */

/**
 * @event Tool#deselect
 * @description Fired when the tool is deselected.
 */
