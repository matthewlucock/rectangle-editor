import * as Color from "color";

import { transparentBlack } from "../utilities"
import { Vector2DInterface, Vector2D } from "../vector"
import { CanvasInterface } from "./canvas"

export interface CanvasRectangleInterface {
  position: Vector2DInterface
  size: Vector2DInterface
  strokeWidth: number
  strokeColor: Color.Color
  fill: Color.Color
  draw(): void
}

/** A class that represents a rectangle on a canvas. */
export class CanvasRectangle implements CanvasRectangleInterface {
  /** Defaults to rgb(0, 0, 0). */
  strokeColor: Color.Color
  /** Defaults to rgb(0, 0, 0). */
  fill: Color.Color

  private _position: Vector2DInterface
  private _size: Vector2DInterface
  private _strokeWidth: number

  constructor(protected canvas: CanvasInterface) {
    this._position = new Vector2D()
    this._size = new Vector2D()
    this.strokeWidth = 0
    this.strokeColor = Color('black')
    this.fill = Color('black')
  }

  get position(): Vector2DInterface {
    return this._position
  }

  /** @throws {InvalidVectorError} The position vector must not be negative. */
  set position(position: Vector2DInterface) {
    position.errorIfNotWithinBounds(new Vector2D())
    this._position = position
  }

  get size(): Vector2DInterface {
    return this._size
  }

  /** @throws {InvalidVectorError} The size vector must not be negative. */
  set size(size: Vector2DInterface) {
    size.errorIfNotWithinBounds(new Vector2D())
    this._size = size
  }

  get strokeWidth(): number {
    return this._strokeWidth
  }

  /** @throws {Error} The stroke width must not be negative. */
  set strokeWidth(strokeWidth: number) {
    if (strokeWidth < 0) {
      throw new Error('The stroke width must not be negative.')
    }

    this._strokeWidth = strokeWidth
  }

  /** Draw the rectangle onto the canvas. */
  draw(): void {
    const { renderingContext } = this.canvas
    renderingContext.beginPath()
    renderingContext.rect(
      this.position.x,
      this.position.y,
      this.size.x,
      this.size.y
    )
    renderingContext.closePath()
    renderingContext.lineWidth = this.strokeWidth
    renderingContext.strokeStyle = this.strokeColor.string()
    renderingContext.fillStyle = this.fill.string()
    renderingContext.stroke()
    renderingContext.fill()
  }
}
