import { InvalidVectorError } from "./utilities"

export interface Vector2DInterface {
  x: number
  y: number
  isPositive: boolean
  clone(): Vector2DInterface
  errorIfNotWithinBounds(
    lowerBound: Vector2DInterface,
    upperBound?: Vector2DInterface
  ): void
}

/** A class representing a two-dimensional vector. */
export class Vector2D implements Vector2DInterface {
  constructor(public x: number = 0, public y: number = 0) {}

  /** Determines whether both components of the vector as positive or zero. */
  get isPositive(): boolean {
    return this.x >= 0 && this.y >= 0
  }

  /** Produce a new vector with the same components as the current vector. */
  clone(): Vector2DInterface {
    return new Vector2D(this.x, this.y)
  }

  /**
   * Throw an error if the current vector's components do not fall within the
   * ranges between two given vectors.
   * @throws {InvalidVectorError}
   */
  errorIfNotWithinBounds(
    lowerBound: Vector2DInterface,
    upperBound?: Vector2DInterface
  ): void {
    if (this.x < lowerBound.x || this.y < lowerBound.y) {
      throw new InvalidVectorError()
    }

    if (upperBound && (this.x > upperBound.x || this.y > upperBound.y)) {
      throw new InvalidVectorError()
    }
  }
}
