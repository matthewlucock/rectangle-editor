import { Vector2DInterface, Vector2D } from "./vector"
import { LayerInterface } from "./layer/layer"

export interface LayerPaneItemInterface {
  readonly layer: LayerInterface
  readonly element: HTMLElement
  delete(): void
}

/** Represents a list item in the list of layers presented in the layer pane. */
export class LayerPaneItem implements LayerPaneItemInterface {
  static readonly paneItemClassName = 'layer-pane-item'
  static readonly selectedClassName = 'layer-pane-item-selected'
  static readonly visibilityButtonClassName = (
    'layer-pane-item-visibility-button'
  )
  static readonly visibilityButtonVisibleClassName = (
    'layer-pane-item-visibility-button-visible'
  )
  static readonly thumbnailContainerClassName = 'layer-thumbnail-container'
  static readonly thumbnailClassName = 'layer-thumbnail'
  static readonly nameElementClassName = 'layer-name'
  static readonly shiftContainerClassName = 'layer-shift-container'
  static readonly shiftButtonClassName = 'layer-shift-button'
  static readonly shiftDownButtonClassName = 'layer-shift-down-button'
  static readonly shiftUpButtonClassName = 'layer-shift-up-button'
  protected static maximumThumbnailSize = new Vector2D(50, 50)

  readonly element: HTMLElement

  protected readonly visibilityButton: HTMLElement
  protected readonly thumbnail: HTMLImageElement
  protected readonly nameElement: HTMLElement
  protected readonly layerListeners: Object
  protected readonly shiftUpButton: HTMLButtonElement
  protected readonly shiftDownButton: HTMLButtonElement

  constructor(public readonly layer: LayerInterface) {
    this.element = document.createElement('li')
    this.element.classList.add(LayerPaneItem.paneItemClassName)

    this.visibilityButton = document.createElement('button')
    this.visibilityButton.classList.add(LayerPaneItem.visibilityButtonClassName)
    this.element.appendChild(this.visibilityButton)

    const thumbnailContainer = document.createElement('div')
    thumbnailContainer.classList.add(LayerPaneItem.thumbnailContainerClassName)
    this.element.appendChild(thumbnailContainer);

    this.thumbnail = new Image()
    this.thumbnail.classList.add(LayerPaneItem.thumbnailClassName)
    thumbnailContainer.appendChild(this.thumbnail)

    this.nameElement = document.createElement('span')
    this.nameElement.classList.add(LayerPaneItem.nameElementClassName)
    this.element.appendChild(this.nameElement)

    const shiftContainer = document.createElement('div')
    shiftContainer.classList.add(LayerPaneItem.shiftContainerClassName)
    this.element.appendChild(shiftContainer)

    this.shiftUpButton = document.createElement('button')
    this.shiftUpButton.classList.add(LayerPaneItem.shiftUpButtonClassName)
    shiftContainer.appendChild(this.shiftUpButton)

    this.shiftDownButton = document.createElement('button')
    this.shiftDownButton.classList.add(LayerPaneItem.shiftDownButtonClassName)
    shiftContainer.appendChild(this.shiftDownButton)

    const shiftButtons = [this.shiftUpButton, this.shiftDownButton]

    for (const button of shiftButtons) {
      button.classList.add(LayerPaneItem.shiftButtonClassName)
    }

    this.layerListeners = {
      'raster-update': this.updateThumbnail.bind(this),
      resize: this.updateThumbnail.bind(this),
      select: this.select.bind(this),
      deselect: this.deselect.bind(this),
      visibility: this.setVisibilityButtonState.bind(this),
      rename: this.setLayerName.bind(this)
    }

    this.setVisibilityButtonState()
    this.updateThumbnail()
    this.setLayerName()

    this.bindListeners()
  }

  /** Select the layer list item in the layer pane. */
  protected select(): void {
    this.element.classList.add(LayerPaneItem.selectedClassName)
  }

  /** Deselect the layer list item in the layer pane. */
  protected deselect(): void {
    this.element.classList.remove(LayerPaneItem.selectedClassName)
  }

  /** Delete the layer list item from the list of layers in the layer pane. */
  delete(): void {
    this.element.remove()
    this.unbindLayerListeners()
  }

  /** Update the layer thumbnail in the layer list item in the layer pane. */
  protected updateThumbnail(): void {
    const rasterCanvasDataURL = this.layer.rasterCanvas.element.toDataURL()
    this.thumbnail.src = rasterCanvasDataURL

    /**
     * The layer thumbnail exists in a finitely bounded box.
     * The longest dimension of the image corresponds to that dimension in the
     * thumbnail being the maximum size. The length of the other side is
     * calculated based on the aspect ratio of the image.
     * This ensures that the thumbnail is roughly the same size regardless of
     * the actual size of the image, while ensuring that the aspect ratio of the
     * thumbnail matches the aspect ratio of the image.
     */

    const aspectRatio = (
      this.layer.rasterCanvas.size.x / this.layer.rasterCanvas.size.y
    );
    const thumbnailSize = LayerPaneItem.maximumThumbnailSize.clone()

    if (this.layer.rasterCanvas.size.x > this.layer.rasterCanvas.size.y) {
      thumbnailSize.y /= aspectRatio
    } else {
      thumbnailSize.x *= aspectRatio
    }

    this.thumbnail.width = thumbnailSize.x
    this.thumbnail.height = thumbnailSize.y
  }

  protected setLayerName(): void {
    this.nameElement.textContent = this.layer.name
  }

  /**
   * Sets the visual button of the visibility toggle button based on the
   * visibility of the corresponding layer.
   */
  protected setVisibilityButtonState(): void {
    this.visibilityButton.classList.toggle(
      LayerPaneItem.visibilityButtonVisibleClassName,
      this.layer.visible
    )
  }

  /**
   * Bind event listeners required for the proper functioning of the layer pane
   * item.
   * @listens Layer#rename
   * @listens Layer#resize
   * @listens Layer#visibility
   * @listens Layer#rasterUpdate
   * @listens Layer#shiftDown
   * @listens Layer#shiftUp
   */
  protected bindListeners(): void {
    for (const event of Object.keys(this.layerListeners)) {
      const listener = this.layerListeners[event]
      this.layer.on(event, listener)
    }

    this.visibilityButton.addEventListener(
      'click',
      this.visibilityButtonClickCallback.bind(this)
    )
    this.shiftUpButton.addEventListener('click', () => {
      this.layer.emit('shift-up')
    })
    this.shiftDownButton.addEventListener('click', () => {
      this.layer.emit('shift-down')
    })
  }

  /** Unbind event listeners on the layer pane item's corresponding layer. */
  protected unbindLayerListeners(): void {
    for (const event of Object.keys(this.layerListeners)) {
      const listener = this.layerListeners[event]
      this.layer.removeListener(event, listener)
    }
  }

  protected visibilityButtonClickCallback(event: MouseEvent): void {
    this.layer.visible = !this.layer.visible
    event.stopPropagation()
  }
}
