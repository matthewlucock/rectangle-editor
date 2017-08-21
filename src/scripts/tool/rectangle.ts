import * as Color from 'color'

import { Tool } from './tool'
import { EditorControlsCategory } from "../editorControlsCategory"
import { RectangleLayer } from "../layer/rectangle"
import { LayerManagerInterface } from "../layer/manager"

/**
 * A class representing the rectangle tool in the editor, allowing for
 * rectangles to be created, with properties such as size and position that can
 * be dynamically modified.
 */
export class RectangleTool extends Tool {
  protected readonly createRectangleLayerButton: HTMLElement
  protected readonly positionXInput: HTMLInputElement
  protected readonly positionYInput: HTMLInputElement
  protected readonly sizeXInput: HTMLInputElement
  protected readonly sizeYInput: HTMLInputElement
  protected readonly fillInput: HTMLInputElement
  protected readonly strokeColorInput: HTMLInputElement
  protected readonly strokeWidthInput: HTMLInputElement

  readonly toolbarItemId = 'rectangle-toolbar-item'

  constructor(protected readonly layerManager: LayerManagerInterface) {
    super()

    const controlsElement = document.createElement('ul')

    const createRectangleLayerContainer = document.createElement('li')
    this.createRectangleLayerButton = document.createElement('button')
    this.createRectangleLayerButton.id = 'create-rectangle-layer-button'
    this.createRectangleLayerButton.classList.add('editor-button')
    this.createRectangleLayerButton.textContent = 'Create rectangle layer'
    createRectangleLayerContainer.appendChild(this.createRectangleLayerButton)

    const positionContainer = document.createElement('li')
    positionContainer.textContent = 'Position'

    this.positionXInput = document.createElement('input')
    this.positionXInput.placeholder = 'X'
    positionContainer.appendChild(this.positionXInput)

    this.positionYInput = document.createElement('input')
    this.positionYInput.placeholder = 'Y'
    positionContainer.appendChild(this.positionYInput)

    const sizeContainer = document.createElement('li')
    sizeContainer.textContent = 'Size'

    this.sizeXInput = document.createElement('input')
    this.sizeXInput.placeholder = 'X'
    sizeContainer.appendChild(this.sizeXInput)

    this.sizeYInput = document.createElement('input')
    this.sizeYInput.placeholder = 'Y'
    sizeContainer.appendChild(this.sizeYInput)

    const fillContainer = document.createElement('li')
    fillContainer.textContent = 'Fill'

    this.fillInput = document.createElement('input')
    fillContainer.appendChild(this.fillInput)

    const strokeContainer = document.createElement('li')
    strokeContainer.textContent = 'Stroke'

    this.strokeColorInput = document.createElement('input')
    strokeContainer.appendChild(this.strokeColorInput)

    this.strokeWidthInput = document.createElement('input')
    this.strokeWidthInput.placeholder = 'Width'
    strokeContainer.appendChild(this.strokeWidthInput)

    const controlElements = [
      createRectangleLayerContainer,
      positionContainer,
      sizeContainer,
      fillContainer,
      strokeContainer
    ]

    for (const element of controlElements) {
      element.classList.add(EditorControlsCategory.controlClassName)
      controlsElement.appendChild(element)
    }

    const numberInputs = [
      this.positionXInput,
      this.positionYInput,
      this.sizeXInput,
      this.sizeYInput,
      this.strokeWidthInput
    ]

    for (const input of numberInputs) {
      input.type = 'number'
      input.size = 5
      input.min = '0'
      input.step = '1'
      input.classList.add(EditorControlsCategory.textInputClassName)
    }

    const colorInputs = [this.fillInput, this.strokeColorInput]

    for (const input of colorInputs) {
      input.type = 'color'
      input.classList.add(EditorControlsCategory.colorInputClassName)
    }

    this.controlsCategory = new EditorControlsCategory(
      'Rectangle',
      controlsElement
    )

    this.bindListeners()
  }

  /**
   * Bind event listeners required for the rectangle tool.
   * @listens LayerManager#select
   */
  protected bindListeners(): void {
    this.layerManager.on('select', this.layerSelectListener.bind(this))

    this.createRectangleLayerButton.addEventListener('click', () => {
      this.layerManager.add(new RectangleLayer())
    })

    this.positionXInput.addEventListener(
      'input',
      this.positionXInputListener.bind(this)
    )
    this.positionYInput.addEventListener(
      'input',
      this.positionYInputListener.bind(this)
    )
    this.sizeXInput.addEventListener(
      'input',
      this.sizeXInputListener.bind(this)
    )
    this.sizeYInput.addEventListener(
      'input',
      this.sizeYInputListener.bind(this)
    )
    this.fillInput.addEventListener(
      'input',
      this.fillInputListener.bind(this)
    )
    this.strokeColorInput.addEventListener(
      'input',
      this.strokeColorInputListener.bind(this)
    )
    this.strokeWidthInput.addEventListener(
      'input',
      this.strokeWidthInputListener.bind(this)
    )
  }

  /**
   * The event callback for when a layer is selected in the layer manager.
   * If the selected layer is a rectangle layer, the tool's inputs are enabled
   * and set to the corresponding values of the selected rectangle.
   * Otherwise, the inputs are disabled and their values are nulled.
   */
  protected layerSelectListener(): void {
    const numberInputs = [
      this.positionXInput,
      this.positionYInput,
      this.sizeXInput,
      this.sizeYInput,
      this.strokeWidthInput
    ]
    const colorInputs = [this.fillInput, this.strokeColorInput]
    const inputs = [...numberInputs, ...colorInputs]

    const { selectedLayer } = this.layerManager

    if (selectedLayer instanceof RectangleLayer) {
      this.positionXInput.value = String(selectedLayer.position.x)
      this.positionYInput.value = String(selectedLayer.position.y)
      this.sizeXInput.value = String(selectedLayer.rectangleSize.x)
      this.sizeYInput.value = String(selectedLayer.rectangleSize.y)
      this.fillInput.value = selectedLayer.fill.hex()
      this.strokeColorInput.value = selectedLayer.strokeColor.hex()
      this.strokeWidthInput.value = String(selectedLayer.strokeWidth)

      for (const input of inputs) input.disabled = false
    } else {
      for (const input of inputs) input.disabled = true
      for (const input of numberInputs) input.value = ""
      for (const input of colorInputs) input.value = "#000000"
    }
  }

  /**
   * The event callback for when the input for the x-coordinate of the
   * rectangle's position receives input.
   * Checks the validity of the inputted data, and then updates the selected
   * rectangle.
   */
  protected positionXInputListener(): void {
    if (!this.positionXInput.validity.valid) return

    const position = (
      this.layerManager.selectedLayer as RectangleLayer
    ).position.clone()
    position.x = Number.parseInt(this.positionXInput.value, 10)
    ;(this.layerManager.selectedLayer as RectangleLayer).position = position
  }

  /**
   * The event callback for when the input for the y-coordinate of the
   * rectangle's position receives input.
   * Checks the validity of the inputted data, and then updates the selected
   * rectangle.
   */
  protected positionYInputListener(event: Event): void {
    if (!this.positionYInput.validity.valid) return

    const position = (
      this.layerManager.selectedLayer as RectangleLayer
    ).position.clone()
    position.y = Number.parseInt(this.positionYInput.value, 10)
    ;(this.layerManager.selectedLayer as RectangleLayer).position = position
  }

  /**
   * The event callback for when the input for the x value of the rectangle's
   * size receives input.
   * Checks the validity of the inputted data, and then updates the selected
   * rectangle.
   */
  protected sizeXInputListener(): void {
    if (!this.sizeXInput.validity.valid) return

    const size = (
      this.layerManager.selectedLayer as RectangleLayer
    ).rectangleSize.clone()
    size.x = Number.parseInt(this.sizeXInput.value, 10)
    ;(this.layerManager.selectedLayer as RectangleLayer).rectangleSize = size
  }

  /**
   * The event callback for when the input for the y value of the rectangle's
   * size receives input.
   * Checks the validity of the inputted data, and then updates the selected
   * rectangle.
   */
  protected sizeYInputListener(): void {
    if (!this.sizeYInput.validity.valid) return

    const size = (
      this.layerManager.selectedLayer as RectangleLayer
    ).rectangleSize.clone()
    size.y = Number.parseInt(this.sizeYInput.value, 10)
    ;(this.layerManager.selectedLayer as RectangleLayer).rectangleSize = size
  }

  /**
   * The event callback for when the input for the rectangle's fill color
   * receives input.
   * Updates the rectangle with the inputted color.
   */
  protected fillInputListener(): void {
    const fill = Color(this.fillInput.value)
    ;(this.layerManager.selectedLayer as RectangleLayer).fill = fill
  }

  /**
   * The event callback for when the input for the rectangle's stroke color
   * receives input.
   * Updates the rectangle with the inputted color.
   */
  protected strokeColorInputListener(): void {
    const strokeColor = Color(this.strokeColorInput.value)
    ;(
      this.layerManager.selectedLayer as RectangleLayer
    ).strokeColor = strokeColor
  }

  /**
   * The event callback for when the input for the rectangle's stroke width
   * receives input.
   * Updates the rectangle with the new stroke width.
   */
  protected strokeWidthInputListener(): void {
    if (!this.strokeWidthInput.validity.valid) return
    const strokeWidth = Number.parseInt(this.strokeWidthInput.value, 10)
    ;(this.layerManager.selectedLayer as RectangleLayer).strokeWidth = (
      strokeWidth
    )
  }
}
