import { LayerManagerInterface } from './layer/manager'

/** A class for managing the slide-over navigation pane in the editor. */
export class EditorNavManager {
  static readonly visibilityInputId = 'editor-nav-visibility-input'
  static readonly newImageButtonId = 'editor-nav-new-image-button'
  static readonly saveAsButtonId = 'editor-nav-save-as-button'
  static readonly overlayId = 'editor-nav-overlay'
  protected readonly visibilityInput: HTMLInputElement
  protected readonly newImageButton: HTMLInputElement
  protected readonly saveAsButton: HTMLInputElement

  constructor(protected layerManager: LayerManagerInterface) {
    this.visibilityInput = document.getElementById(
      EditorNavManager.visibilityInputId
    ) as HTMLInputElement
    this.newImageButton = document.getElementById(
      EditorNavManager.newImageButtonId
    ) as HTMLInputElement
    this.saveAsButton = document.getElementById(
      EditorNavManager.saveAsButtonId
    ) as HTMLInputElement

    this.bindListeners()
  }

  protected hideNav(): void {
    this.visibilityInput.checked = false
  }

  /**
   * Bind event listeners required for the proper functioning of the manager.
   */
  protected bindListeners(): void {
    this.newImageButton.addEventListener(
      'click',
      this.newImageButtonCallback.bind(this)
    )

    this.saveAsButton.addEventListener(
      'click',
      this.saveAsButtonCallback.bind(this)
    )
  }

  protected newImageButtonCallback(): void {
    this.layerManager.reset()
    this.hideNav()
  }

  protected saveAsButtonCallback(): void {
    let fileName = ''

    // Ask the user for a name until they enter one or cancel out of the prompt.
    do {
      fileName = prompt('Please enter a file name.')
    } while (fileName === '')

    // Do nothing if the user cancelled out of the prompt.
    if (fileName === null) return

    this.layerManager.downloadMergedFile(fileName)
    this.hideNav()
  }
}
