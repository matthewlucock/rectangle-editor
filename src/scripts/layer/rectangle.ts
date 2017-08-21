import * as Color from 'color'

import { Vector2DInterface } from '../vector'
import { LayerInterface, Layer } from './layer'
import { CanvasRectangleInterface, CanvasRectangle } from '../canvas/rectangle'

export interface RectangleLayerInterface extends LayerInterface {
  position: Vector2DInterface
  rectangleSize: Vector2DInterface
  strokeWidth: number
  strokeColor: Color.Color
  fill: Color.Color
}

/**
 * A class for layers optimised to represent rectangles, maintaing data such as
 * position, size, and fill color, and allowing for these properties to be
 * modified dynamically.
 */
export class RectangleLayer extends Layer implements RectangleLayerInterface {
  protected readonly rectangle: CanvasRectangleInterface

  constructor() {
    super()
    this.name = 'Rectangle'
    this.rectangle = new CanvasRectangle(this.rasterCanvas)
  }

  get position(): Vector2DInterface {
    return this.rectangle.position
  }

  set position(position: Vector2DInterface) {
    this.rectangle.position = position
    this.draw()
  }

  get rectangleSize(): Vector2DInterface {
    return this.rectangle.size
  }

  set rectangleSize(size: Vector2DInterface) {
    this.rectangle.size = size
    this.draw()
  }

  get strokeWidth(): number {
    return this.rectangle.strokeWidth
  }

  set strokeWidth(strokeWidth: number) {
    this.rectangle.strokeWidth = strokeWidth
    this.draw()
  }

  get strokeColor(): Color.Color {
    return this.rectangle.strokeColor
  }

  set strokeColor(strokeColor: Color.Color) {
    this.rectangle.strokeColor = strokeColor
    this.draw()
  }

  get fill(): Color.Color {
    return this.rectangle.fill
  }

  set fill(fill: Color.Color) {
    this.rectangle.fill = fill
    this.draw()
  }

  /**
   * Draw the rectangle onto the layer's canvas, clearing the rectangle if it
   * had already been drawn.
   * @fires Layer#rasterUpdate
   */
  draw(): void {
    this.rasterCanvas.clear()
    this.rectangle.draw()
    this.emit('raster-update')
  }
}
