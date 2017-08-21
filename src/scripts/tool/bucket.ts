import * as Color from 'color'

import { Tool } from './tool'
import { EditorControlsCategory } from "../editorControlsCategory"
import { RasterLayer } from "../layer/raster"
import { LayerManagerInterface } from "../layer/manager"
import { CanvasRectangle } from "../canvas/rectangle"

/**
 * A class representing the bucket tool in the editor, allowing for raster
 * layers to be filled with solid colors.
 */
export class BucketTool extends Tool {
  protected readonly colorInput: HTMLInputElement
  protected readonly applyButton: HTMLButtonElement

  readonly toolbarItemId = 'bucket-toolbar-item'

  constructor(protected layerManager: LayerManagerInterface) {
    super()

    const controlsElement = document.createElement('ul')

    const colorContainer = document.createElement('li')
    colorContainer.textContent = 'Color'

    this.colorInput = document.createElement('input')
    this.colorInput.type = 'color'
    this.colorInput.classList.add(EditorControlsCategory.colorInputClassName)
    colorContainer.appendChild(this.colorInput)

    const applyButtonContainer = document.createElement('li')
    this.applyButton = document.createElement('button')
    this.applyButton.id = 'apply-bucket-tool-button'
    this.applyButton.classList.add('editor-button')
    this.applyButton.textContent = 'Apply'
    applyButtonContainer.appendChild(this.applyButton)

    const controlElements = [
      colorContainer,
      applyButtonContainer
    ]

    for (const element of controlElements) {
      element.classList.add(EditorControlsCategory.controlClassName)
      controlsElement.appendChild(element)
    }

    this.controlsCategory = new EditorControlsCategory(
      'Bucket',
      controlsElement
    )

    this.bindListeners()
  }

  /**
   * Bind event listeners required for the bucket tool.
   * @listens LayerManager#select
   */
  protected bindListeners(): void {
    this.layerManager.on('select', this.layerSelectListener.bind(this))
    this.applyButton.addEventListener('click', this.apply.bind(this))
  }

  /**
   * The event callback for when a layer is selected in the layer manager.
   * Enables or disables the functionality of the bucket tool according to
   * whether the selected layer is a raster layer.
   */
  protected layerSelectListener(): void {
    const selectedLayerIsRasterLayer = (
      this.layerManager.selectedLayer instanceof RasterLayer
    )

    this.colorInput.disabled = !selectedLayerIsRasterLayer
    this.applyButton.disabled = !selectedLayerIsRasterLayer
  }

  /**
   * Apply the bucket tool, filling the selected layer with a solid color as
   * inputted by the user if the selected layer is a raster layer.
   * @throws {Error} The selected layer must be a raster layer.
   */
  protected apply(): void {
    if (!(this.layerManager.selectedLayer instanceof RasterLayer)) {
      throw new Error('The selected layer must be a raster layer.')
    }

    const fillColor = Color(this.colorInput.value)
    this.layerManager.selectedLayer.fill(fillColor)
  }
}
