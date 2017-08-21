import * as Color from 'color'

import { LayerInterface, Layer } from './layer'
import { CanvasRectangle } from '../canvas/rectangle'

export interface RasterLayerInterface extends LayerInterface {
  fill(fillColor: Color.Color): void
}

/**
 * A class for representing raster layers i.e. layers that are just pixel data.
 */
export class RasterLayer extends Layer implements RasterLayerInterface {
  /**
   * Fill the layer with a solid color.
   * @fires Layer#rasterUpdate
   */
  fill(fillColor: Color.Color): void {
    const rectangle = new CanvasRectangle(this.rasterCanvas)
    rectangle.size = this.size
    rectangle.fill = fillColor
    rectangle.draw()
    this.emit('raster-update')
  }
}
