import * as EventEmitter from "events"

import { Vector2DInterface, Vector2D } from "../vector"
import { CanvasInterface, Canvas } from "../canvas/canvas"

export interface LayerInterface extends EventEmitter {
  readonly container: HTMLDivElement
  readonly rasterCanvas: CanvasInterface
  name: string
  size: Vector2DInterface
  visible: boolean
  copy(layer: LayerInterface): void
}

/** A class representing an image layer in the editor. */
export class Layer extends EventEmitter implements LayerInterface {
  static readonly containerClassName = 'layer-container'
  static readonly hiddenClassName = 'layer-hidden'
  static readonly rasterCanvasClassName = 'layer-raster-canvas'

  readonly container: HTMLDivElement
  readonly rasterCanvas: CanvasInterface

  protected _name: string
  private _size: Vector2DInterface
  private _visible: boolean

  constructor() {
    super()

    this.container = document.createElement('div')
    this.container.classList.add(Layer.containerClassName)

    this.rasterCanvas = new Canvas()
    this.rasterCanvas.element.classList.add(Layer.rasterCanvasClassName)
    this.container.appendChild(this.rasterCanvas.element)

    this._name = ''
    this._visible = true
  }

  get name(): string {
    return this._name
  }

  /** @fires Layer#rename */
  set name(name: string) {
    this._name = name
    this.emit('rename', name)
  }

  get size(): Vector2DInterface {
    return this._size
  }

  /**
   * @throws {InvalidVectorError} The size vector must not be negative.
   * @fires Layer#resize
   */
  set size(size: Vector2DInterface) {
    size.errorIfNotWithinBounds(new Vector2D())
    this._size = size
    this.rasterCanvas.size = size
    this.emit('resize')
  }

  get visible(): boolean {
    return this._visible
  }

  /** @fires Layer#visibility */
  set visible(visible: boolean) {
    this._visible = visible
    this.container.classList.toggle(Layer.hiddenClassName, !visible)
    this.emit('visibility')
  }

  /** Copy the data of a passed layer onto the layer. */
  copy(layer: LayerInterface): void {
    this.name = layer.name
    this.size = layer.size
    this.visible = layer.visible
    this.rasterCanvas.copy(layer.rasterCanvas)
  }
}

/**
 * @event Layer#rename
 * @description Fired when the layer is renamed.
 * @type {string} The new name of the layer.
 */

 /**
  * @event Layer#resize
  * @description Fired when the layer is resized.
  */

/**
 * @event Layer#visibility
 * @description Fired when the visiblity of the layer is modified.
 */

/**
 * @event Layer#select
 * @description Fired when the layer is selected.
 */

 /**
  * @event Layer#deselect
  * @description Fired when the layer is deselected.
  */

/**
 * @event Layer#shiftUp
 * @description Fired when the layer is shifted one position up in the
 * rendering stack.
 */

 /**
  * @event Layer#shiftDown
  * @description Fired when the layer is shifted one position down in the
  * rendering stack.
  */

/**
 * @event Layer#rasterUpdate
 * @description Fired when the pixel data of the layer is modified.
 */
