import * as Color from "color"

// A Color object representing rgba(0, 0, 0, 0).
export const transparentBlack = Color('black').alpha(0)

/**
 * An error representing that a vector was invalid in the context of the calling
 * function.
 */
export class InvalidVectorError extends Error {
  constructor(message?: string) {
    super(message)
    this.name = 'InvalidVectorError'
  }
}

/**
 * An error thrown when attempting to perform an operation on a layer using a
 * layer manager that is not managing the layer.
 */
export class UnmanagedLayerError extends Error {
  constructor(message?: string) {
    super(message)
    this.name = 'UnmanagedLayerError'
  }
}

/**
 * An error thrown when attempting to perform an operation on a tool using a
 * tool manager that is not managing the tool.
 */
export class UnmanagedToolError extends Error {
  constructor(message?: string) {
    super(message)
    this.name = 'UnmanagedToolError'
  }
}

/**
 * An error thrown when attempting to perform an operation on a editor controls
 * category using a controls category manager that is not managing the controls
 * category.
 */
export class UnmanagedControlsCategoryError extends Error {
  constructor(message?: string) {
    super(message)
    this.name = 'UnmanagedControlsCategoryError'
  }
}

export const convertNumberToPixelLength = (value: number): string => {
  return `${value}px`
}
