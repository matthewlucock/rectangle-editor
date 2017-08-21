import * as EventEmitter from "events"

import { convertNumberToPixelLength, UnmanagedLayerError } from '../utilities'
import { Vector2DInterface, Vector2D } from '../vector'
import { CanvasInterface, Canvas } from '../canvas/canvas'
import { CanvasRectangle } from '../canvas/rectangle'
import { LayerInterface, Layer } from './layer'
import { RasterLayer } from './raster'

export interface LayerManagerInterface extends EventEmitter {
  readonly element: HTMLElement
  readonly layers: Array<LayerInterface>
  size: Vector2DInterface
  selectedLayer: LayerInterface
  add(layer: LayerInterface): void
  remove(layer: LayerInterface): void
  select(layer: LayerInterface): void
  addNewRasterLayer(): void
  renameSelectedLayer(): void
  removeSelectedLayer(): void
  downloadMergedFile(fileName: string): void
  reset(): void
}

/** A class for managing the image layers in the editor. */
export class LayerManager extends EventEmitter
implements LayerManagerInterface {
  protected static readonly downloadLinkId = 'editor-download-link'
  protected static createdRasterLayerCount = 0

  readonly element: HTMLElement
  readonly layers: Array<LayerInterface>
  selectedLayer: LayerInterface

  protected downloadLink: HTMLAnchorElement
  private _size: Vector2DInterface

  constructor() {
    super()

    this.element = document.createElement('div')
    this.element.id = 'layer-manager'

    this.layers = []
    this._size = new Vector2D()
    this.downloadLink = document.getElementById(
      LayerManager.downloadLinkId
    ) as HTMLAnchorElement
  }

  get size(): Vector2DInterface {
    return this._size
  }

  /**
   * Sets the size of all managed layers as well as the layer manager to ensure
   * the managed layers are always the same size as the layer manager.
   * @throws {InvalidVectorError} The size vector must not be negative.
   */
  set size(size: Vector2DInterface) {
    size.errorIfNotWithinBounds(new Vector2D())

    this._size = size
    this.element.style.width = convertNumberToPixelLength(size.x)
    this.element.style.height = convertNumberToPixelLength(size.y)

    for (const layer of this.layers) layer.size = size
  }

  /**
   * Throw an error if the passed layer is not being managed by the layer
   * manager.
   * @throws {UnmanagedLayerError}
   */
  protected errorIfNotManagingLayer(layer: LayerInterface): void {
    if (!this.layers.includes(layer)) throw new UnmanagedLayerError()
  }

  /**
   * Add a layer to set of layers being managed by the layer manager.
   * Ensures the layer is the correct size, its canvas is in the correct
   * position in the canvas stack, and adds event listeners on the layer that
   * control other mechanisms.
   * The new layer is selected once added.
   * @fires LayerManager#add
   * @listens Layer#shiftUp
   * @listens Layer#shiftDown
   */
  add(layer: LayerInterface): void {
    layer.size = this.size

    // Add the new layer's canvas to the bottom of the canvas stack.
    this.element.insertBefore(layer.container, this.element.firstElementChild)

    this.layers.unshift(layer)
    this.emit('add', layer)
    this.select(layer)

    layer.on('shift-up', () => {
      this.shiftUp(layer)
    })
    layer.on('shift-down', () => {
      this.shiftDown(layer)
    })
  }

  /**
   * Removes the passed layer from the set of layers being managed.
   * Adds a new raster layer to the manager if no layers remain after the passed
   * layer is removed.
   * Selects the next layer up in the rendering stack if the removed layer was
   * the selected layer.
   * @throws {UnmanagedLayerError}
   * @fires LayerManager#remove
   */
  remove(layer: LayerInterface): void {
    this.errorIfNotManagingLayer(layer)

    const layerPosition = this.layers.indexOf(layer)

    this.layers.splice(layerPosition, 1)
    layer.container.remove()
    this.emit('remove', layer)

    if (!this.layers.length) this.addNewRasterLayer()

    if (this.selectedLayer === layer) {
      // Selects the next layer up in the rendering stack, or the first layer
      // if the removed layer was previously the first layer.
      let nextLayerPositionToSelect = layerPosition
      if (nextLayerPositionToSelect > 0) nextLayerPositionToSelect--
      this.select(this.layers[nextLayerPositionToSelect])
    }
  }

  /**
   * Select the passed layer.
   * @throws {UnmanagedLayerError}
   * @fires LayerManager#select
   * @fires Layer#select
   * @fires LayerManager#deselect
   * @fires Layer#deselect
   */
  select(layer: LayerInterface): void {
    this.errorIfNotManagingLayer(layer)

    // Abort if the layer being selected is already selected.
    if (this.selectedLayer === layer) return

    if (this.selectedLayer) {
      this.selectedLayer.emit('deselect')
      this.emit('deselect')
    }

    this.selectedLayer = layer
    layer.emit('select')
    this.emit('select')
  }

  /** Create a new raster layer and add it to the layer manager. */
  addNewRasterLayer(): void {
    const layer = new RasterLayer()

    LayerManager.createdRasterLayerCount++
    layer.name = `Layer ${LayerManager.createdRasterLayerCount}`

    this.add(layer)
  }

  /**
   * Rename the selected layer, providing a prompt to the user to enter a new
   * name.
   */
  renameSelectedLayer(): void {
    const newName = prompt('Please enter a name.')
    this.selectedLayer.name = newName
  }

  /** Remove the selected layer from the manager. */
  removeSelectedLayer(): void {
    this.remove(this.selectedLayer)
  }

  /**
   * Produce a canvas containing the contents of the layers being managed,
   * merged in order of the rendering stack.
   * Hidden layers are not included.
   */
  protected generateMergedCanvas(): CanvasInterface {
    const mergedCanvas = new Canvas()
    mergedCanvas.size = this.size

    for (const layer of this.layers) {
      if (layer.visible) mergedCanvas.copy(layer.rasterCanvas)
    }

    return mergedCanvas
  }

  /**
   * Cause the browser to download an image representing the result of merging
   * the layers being managed.
   */
  downloadMergedFile(fileName: string): void {
    const mergedCanvas = this.generateMergedCanvas()
    this.downloadLink.download = `${fileName}.png`
    this.downloadLink.href = mergedCanvas.element.toDataURL()
    this.downloadLink.click()
  }

  /**
   * Set the layer manager back to its initial state, removing all layers being
   * managed.
   */
  reset(): void {
    LayerManager.createdRasterLayerCount = 0
    for (const layer of this.layers.slice()) this.remove(layer)
  }

  /**
   * Shift a passed layer one level up in the rendering stack.
   * @throws {UnmanagedLayerError}
   * @fires LayerManager#shiftUp
   */
  protected shiftUp(layer: LayerInterface): void {
    this.errorIfNotManagingLayer(layer)

    const layerPosition = this.layers.indexOf(layer)

    // Do nothing if the layer is already at the top of the rendering stack.
    if (layerPosition === this.layers.length - 1) return

    const nextLayer = this.layers[layerPosition + 1]
    this.layers[layerPosition] = nextLayer
    this.layers[layerPosition + 1] = layer
    this.element.insertBefore(nextLayer.container, layer.container)

    this.emit('shift-up', layer)
  }

  /**
   * Shift a passed layer one level down in the rendering stack.
   * @throws {UnmanagedLayerError}
   * @fires LayerManager#shiftDown
   */
  protected shiftDown(layer: LayerInterface): void {
    this.errorIfNotManagingLayer(layer)

    const layerPosition = this.layers.indexOf(layer)

    // Do nothing if the layer is already at the bottom of the rendering stack.
    if (layerPosition === 0) return

    const previousLayer = this.layers[layerPosition - 1]
    this.layers[layerPosition] = previousLayer
    this.layers[layerPosition - 1] = layer
    this.element.insertBefore(layer.container, previousLayer.container)

    this.emit('shift-down', layer)
  }
}

/**
 * @event LayerManager#add
 * @description Fired when a layer is added to the manager.
 * The value is the added layer.
 */

/**
 * @event LayerManager#remove
 * @description Fired when a layer is removed from the manager.
 * The value is the removed layer.
 */

/**
 * @event LayerManager#select
 * @description Fired when a layer is selected.
 */

/**
 * @event LayerManager#deselect
 * @description Fired when a layer is deselected.
 */

/**
 * @event LayerManager#shiftUp
 * @description Fired when a layer is shifted one position up in the rendering
 * stack.
 * The value is the shifted layer.
 */

/**
 * @event LayerManager#shiftDown
 * @description Fired when a layer is shfited one position down in the rendering
 * stack.
 * The value is the shifted layer.
 */
