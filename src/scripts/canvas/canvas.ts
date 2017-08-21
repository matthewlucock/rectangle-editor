import { Vector2DInterface, Vector2D } from "../vector"

export interface CanvasInterface {
  readonly element: HTMLCanvasElement
  size: Vector2DInterface
  readonly renderingContext: CanvasRenderingContext2D
  copy(canvasToCopy: CanvasInterface): void
  clear(): void
}

/**
 * A class that represents a canvas, providing optimised methods for handling
 * and interacting with the canvas over the standard Canvas API.
 */
export class Canvas implements CanvasInterface {
  readonly element: HTMLCanvasElement
  readonly renderingContext: CanvasRenderingContext2D

  private _size: Vector2DInterface

  constructor() {
    this.element = document.createElement('canvas')
    this.renderingContext = this.element.getContext('2d')
    this._size = new Vector2D()
  }

  get size(): Vector2DInterface {
    return this._size
  }

  /** @throws {InvalidVectorError} The size vector must not be negative. */
  set size(size: Vector2DInterface) {
    size.errorIfNotWithinBounds(new Vector2D())
    this._size = size
    this.element.width = this.size.x
    this.element.height = this.size.y
  }

  /** Copy the contents of a passed canvas onto the canvas. */
  copy(canvasToCopy: CanvasInterface): void {
    this.renderingContext.drawImage(canvasToCopy.element, 0, 0)
  }

  /** Clear the contents of the canvas. */
  clear(): void {
    this.renderingContext.clearRect(0, 0, this.size.x, this.size.y)
  }
}
