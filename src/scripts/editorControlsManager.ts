import { UnmanagedControlsCategoryError } from './utilities'
import { EditorControlsCategoryInterface } from './editorControlsCategory'
import { ToolManagerInterface } from "./tool/manager"

export interface EditorControlsManagerInterface {
  addCategory(category: EditorControlsCategoryInterface): void
  selectCategory(category: EditorControlsCategoryInterface): void
  hideCategory(category: EditorControlsCategoryInterface): void
}

/** Manages the categories of controls for the editor in the editor header. */
export class EditorControlsManager implements EditorControlsManagerInterface {
  protected static readonly controlsContainerId = 'editor-controls-container'
  protected static readonly categoryNamesElementId = (
    'editor-controls-category-names'
  )

  protected controlsContainer: HTMLElement
  protected categoryNamesElement: HTMLElement
  protected categories: Array<EditorControlsCategoryInterface>
  protected selectedCategory: EditorControlsCategoryInterface

  constructor(protected toolManager: ToolManagerInterface) {
    this.controlsContainer = document.getElementById(
      EditorControlsManager.controlsContainerId
    )
    this.categoryNamesElement = document.getElementById(
      EditorControlsManager.categoryNamesElementId
    )

    this.categories = []
    this.bindListeners()
  }

  /**
   * Throw an error if the controls category is not being managed by the
   * manager.
   * @throws {UnmanagedControlsCategoryError}
   */
  protected errorIfNotManagingCategory(
    category: EditorControlsCategoryInterface
  ): void {
    if (!this.categories.includes(category)) {
      throw new UnmanagedControlsCategoryError()
    }
  }

  /**
   * Add a controls category to the set of categories being managed, binding
   * event listeners to ensure proper functioning of the editor header.
   */
  addCategory(category: EditorControlsCategoryInterface): void {
    this.categoryNamesElement.appendChild(category.nameElement)
    this.controlsContainer.appendChild(category.controlsElement)
    this.categories.push(category)

    category.nameElement.addEventListener('click', () => {
      this.selectCategory(category)
    })
  }

  /**
   * Select a controls category in the manager.
   * @throws {UnmanagedControlsCategoryError}
   */
  selectCategory(category: EditorControlsCategoryInterface): void {
    this.errorIfNotManagingCategory(category)

    // Do nothing if the category to select is already selected.
    if (this.selectedCategory === category) return

    // Deselect the previously selected category if there was one.
    if (this.selectedCategory) this.selectedCategory.deselect()

    this.selectedCategory = category
    category.select()
  }

  /**
   * Deselect the selected controls category in the manager.
   * @throws {Error} No category is selected.
   */
  protected deselectSelectedCategory(): void {
    if (!this.selectedCategory) throw new Error('No category is selected.')
    this.selectedCategory.deselect()
    this.selectedCategory = undefined
  }

  /**
   * Hide a controls category's UI elements in the editor header.
   * @throws {UnmanagedControlsCategoryError}
   */
  hideCategory(category: EditorControlsCategoryInterface): void {
    this.errorIfNotManagingCategory(category)
    if (this.selectedCategory === category) this.deselectSelectedCategory()
    category.hideCategory()
  }

  /**
   * Bind event listeners required for proper functioning of the manager.
   * @listens ToolManager#add
   * @listens ToolManager#select
   * @listens ToolManager#deselect
   */
  protected bindListeners(): void {
    this.toolManager.on('add', tool => {
      tool.controlsCategory.hideCategory()
      this.addCategory(tool.controlsCategory)
    })

    this.toolManager.on('select', tool => {
      tool.controlsCategory.showCategory()
      this.selectCategory(tool.controlsCategory)
    })

    this.toolManager.on('deselect', tool => {
      this.hideCategory(tool.controlsCategory)
    })
  }
}
