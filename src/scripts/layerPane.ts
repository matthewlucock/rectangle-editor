import { UnmanagedLayerError } from "./utilities"
import { LayerInterface } from "./layer/layer"
import { RasterLayer } from "./layer/raster"
import { LayerManagerInterface } from "./layer/manager"
import { LayerPaneItemInterface, LayerPaneItem } from "./layerPaneItem"

export interface LayerPaneInterface {
  readonly items: Array<LayerPaneItemInterface>
}

/**
 * A class that represents the layer pane in the editor, including the list of
 * layers, and controls for adding new layers, renaming layers, deleting layers
 * and re-ordering layers in the rendering stack.
 */
export class LayerPane implements LayerPaneInterface {
  static readonly createNewLayerButtonId: string = 'create-new-layer-button'
  static readonly renameLayerButtonId: string = 'rename-layer-button'
  static readonly deleteLayerButtonId: string = 'delete-layer-button'

  readonly items: Array<LayerPaneItemInterface>

  protected readonly element: HTMLElement
  protected readonly createNewLayerButton: HTMLElement
  protected readonly renameLayerButton: HTMLElement
  protected readonly deleteLayerButton: HTMLElement
  protected readonly layerListElement: HTMLElement

  constructor(protected layerManager: LayerManagerInterface) {
    this.element = document.getElementById('layer-pane')
    this.createNewLayerButton = document.getElementById(
      LayerPane.createNewLayerButtonId
    );
    this.renameLayerButton = document.getElementById(
      LayerPane.renameLayerButtonId
    );
    this.deleteLayerButton = document.getElementById(
      LayerPane.deleteLayerButtonId
    );
    this.layerListElement = document.getElementById('layer-list')

    this.items = []
    this.bindListeners()
  }

  /**
   * Get the layer pane item in the layer pane associated with the given layer.
   * @fires {UnmanagedLayerError}
   */
  protected getItemFromLayer(layer: LayerInterface): LayerPaneItemInterface {
    for (const item of this.items) {
      if (item.layer === layer) return item
    }

    throw new UnmanagedLayerError()
  }

  /**
   * Add a layer to the layer pane, binding the click listener allowing for the
   * layer to be selected.
   */
  protected addLayer(layer: LayerInterface): void {
    const paneItem = new LayerPaneItem(layer)
    this.items.push(paneItem)
    this.layerListElement.appendChild(paneItem.element)

    paneItem.element.addEventListener('click', () => {
      this.layerManager.select(layer)
    })
  }

  /** Remove a layer from the layer pane. */
  protected removeLayer(layer: LayerInterface): void {
    const item = this.getItemFromLayer(layer)
    this.items.splice(this.items.indexOf(item), 1)
    item.delete()
  }

  /**
   * Shift a given layer one position up in the list of layers presented in the
   * layer pane.
   */
  protected shiftLayerUp(layer: LayerInterface): void {
    const item = this.getItemFromLayer(layer)
    this.layerListElement.insertBefore(
      item.element,
      item.element.previousElementSibling
    )
  }

  /**
   * Shift a given layer one position down in the list of layers presented in
   * the layer pane.
   */
  protected shiftLayerDown(layer: LayerInterface): void {
    const item = this.getItemFromLayer(layer)
    this.layerListElement.insertBefore(
      item.element.nextElementSibling,
      item.element
    )
  }

  /**
   * Bind event listeners required for the proper functioning of the layer pane.
   * @listens LayerManager#add
   * @listens LayerManager#remove
   * @listens LayerManager#shiftUp
   * @listens LayerManager#shiftDown
   */
  protected bindListeners(): void {
    this.createNewLayerButton.addEventListener(
      'click',
      this.layerManager.addNewRasterLayer.bind(this.layerManager)
    )
    this.renameLayerButton.addEventListener(
      'click',
      this.layerManager.renameSelectedLayer.bind(this.layerManager)
    )
    this.deleteLayerButton.addEventListener(
      'click',
      this.layerManager.removeSelectedLayer.bind(this.layerManager)
    )

    this.layerManager.on('add', this.addLayer.bind(this))
    this.layerManager.on('remove', this.removeLayer.bind(this))
    this.layerManager.on('shift-up', this.shiftLayerUp.bind(this))
    this.layerManager.on('shift-down', this.shiftLayerDown.bind(this))
  }
}
