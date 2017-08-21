export interface EditorControlsCategoryInterface {
  readonly nameElement: HTMLElement
  readonly controlsElement: HTMLElement
  showCategory(): void
  hideCategory(): void
  select(): void
  deselect(): void
}

/**
 * Represents a category of controls for the editor, to be interacted with in
 * the editor header.
 */
export class EditorControlsCategory implements EditorControlsCategoryInterface {
  static readonly nameElementClassName = 'editor-controls-category-name'
  static readonly categoryNameSelectedClassName = (
    'editor-controls-category-name-selected'
  )
  static readonly controlsCategoryClassName = 'editor-controls-category'
  static readonly hiddenClassName = 'editor-controls-hidden'
  static readonly controlClassName = 'editor-control'
  static readonly textInputClassName = 'editor-control-text-input'
  static readonly colorInputClassName = 'editor-control-color-input'

  readonly nameElement: HTMLElement

  /**
   * @param {string} name The name of the category, which will appear as the
   * category's title in the editor header.
   * @param {HTMLElement} controlsElement The element that contains the controls
   * for the category.
   */
  constructor(name: string, public readonly controlsElement: HTMLElement) {
    this.nameElement = document.createElement('li')
    this.nameElement.classList.add(EditorControlsCategory.nameElementClassName)
    this.nameElement.textContent = name

    this.controlsElement.classList.add(
      EditorControlsCategory.controlsCategoryClassName
    )

    this.hideControls()
  }

  /** Display the category's set of controls in the editor header. */
  protected showControls(): void {
    this.controlsElement.classList.remove(
      EditorControlsCategory.hiddenClassName
    )
  }

  /** Hide the category's set of controls within the editor header. */
  protected hideControls(): void {
    this.controlsElement.classList.add(EditorControlsCategory.hiddenClassName)
  }

  /** Display the tab for the category of controls in the editor header. */
  showCategory(): void {
    this.nameElement.classList.remove(EditorControlsCategory.hiddenClassName)
  }

  /**
   * Hide the set of controls and its corresponding tab in the editor header.
   */
  hideCategory(): void {
    this.nameElement.classList.add(EditorControlsCategory.hiddenClassName)
    this.hideControls()
  }

  /**
   * Select the category of controls within the editor header, displaying its
   * set of controls and adding a highlighted style to its tab.
   */
  select(): void {
    this.nameElement.classList.add(
      EditorControlsCategory.categoryNameSelectedClassName
    )
    this.showControls()
  }

  /**
   * Deselect the category of controls within the editor header, hiding its set
   * of controls and removing its tab's highlighed style.
   */
  deselect(): void {
    this.nameElement.classList.remove(
      EditorControlsCategory.categoryNameSelectedClassName
    )
    this.hideControls()
  }
}
