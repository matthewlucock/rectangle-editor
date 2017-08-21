mocha.setup('bdd')

var Vector2D = require('./js/vector').Vector2D
var convertNumberToPixelLength = require('./js/utilities').convertNumberToPixelLength
var Canvas = require('./js/canvas/canvas').Canvas
var CanvasRectangle = require('./js/canvas/rectangle').CanvasRectangle
var Color = require('color')
var Layer = require('./js/layer/layer').Layer
var LayerManager = require('./js/layer/manager').LayerManager
var RasterLayer = require('./js/layer/raster').RasterLayer
var RectangleLayer = require('./js/layer/rectangle').RectangleLayer
var ToolManager = require('./js/tool/manager').ToolManager
var Tool = require('./js/tool/tool').Tool
var assert = chai.assert

describe('Vector2D', function() {
  it('Coordinates default to zero', function() {
    var vector = new Vector2D
    assert.strictEqual(vector.x, 0)
    assert.strictEqual(vector.y, 0)
  })

  it('Constructor sets coordinates', function() {
    var x = Math.random()
    var y = Math.random()
    var vector = new Vector2D(x, y)
    assert.strictEqual(vector.x, x)
    assert.strictEqual(vector.y, y)
  })

  it('isPositive', function() {
    var positiveVector = new Vector2D(5, 10)
    var negativeVector = new Vector2D(-6, -3)
    assert.isTrue(positiveVector.isPositive)
    assert.isFalse(negativeVector.isPositive)
  })

  it('clone', function() {
    var x = Math.random()
    var y = Math.random()
    var vector = new Vector2D(x, y)
    var clone = vector.clone()
    assert.strictEqual(clone.x, x)
    assert.strictEqual(clone.y, y)
  })

  it('errorIfNotWithinBounds', function() {
    var vector = new Vector2D(1, 1)
    assert.doesNotThrow(function() {
      vector.errorIfNotWithinBounds(new Vector2D(0, 0))
    })
    assert.doesNotThrow(function() {
      vector.errorIfNotWithinBounds(new Vector2D(0, 0), new Vector2D(2, 2))
    })
    assert.throws(function() {
      vector.errorIfNotWithinBounds(new Vector2D(2, 2))
    })
    assert.throws(function() {
      vector.errorIfNotWithinBounds(new Vector2D(0.5, 0.5), new Vector2D(0.9, 0.9))
    })
  })
})

describe('utilities', function() {
  it('convertNumberToPixelLength', function() {
    var number = 10
    var expectedResult = '10px'
    assert.strictEqual(convertNumberToPixelLength(10), expectedResult)
  })
})

describe('Canvas', function() {
  it('Exposes the canvas element', function() {
    var canvas = new Canvas
    assert.instanceOf(canvas.element, HTMLCanvasElement)
  })

  it('Exposes the rendering context', function() {
    var canvas = new Canvas
    assert.instanceOf(canvas.renderingContext, CanvasRenderingContext2D)
  })

  it('Exposes the size', function() {
    var canvas = new Canvas
    assert.instanceOf(canvas.size, Vector2D)
  })

  it('Sets the size', function() {
    var canvas = new Canvas
    var x = Math.random()
    var y = Math.random()
    canvas.size = new Vector2D(x, y)
    assert.strictEqual(canvas.size.x, x)
    assert.strictEqual(canvas.size.y, y)
  })

  it('Sets the size of the canvas', function() {
    var canvas = new Canvas
    var x = 6
    var y = 4
    canvas.size = new Vector2D(x, y)
    assert.strictEqual(canvas.element.width, x)
    assert.strictEqual(canvas.element.height, y)
  })

  it('Errors if setting negative size', function() {
    var canvas = new Canvas
    assert.throws(function() {
      canvas.size = new Vector2D(-7, -4)
    })
  })
})

describe('CanvasRectangle', function() {
  it('Errors if setting negative position', function() {
    var rectangle = new CanvasRectangle(new Canvas)
    assert.throws(function() {
      rectangle.position = new Vector2D(-1, -7)
    })
  })

  it('Errors if setting negative size', function() {
    var rectangle = new CanvasRectangle(new Canvas)
    assert.throws(function() {
      rectangle.size = new Vector2D(-1, -7)
    })
  })

  it('Errors if setting negative stroke width', function() {
    var rectangle = new CanvasRectangle(new Canvas)
    assert.throws(function() {
      rectangle.strokeWidth = -6
    })
  })

  it('Exposes the stroke color', function() {
    var rectangle = new CanvasRectangle(new Canvas)
    assert.isObject(rectangle.strokeColor)
  })

  it('Exposes the fill color', function() {
    var rectangle = new CanvasRectangle(new Canvas)
    assert.isObject(rectangle.fill)
  })

  it('Exposes the position', function() {
    var rectangle = new CanvasRectangle(new Canvas)
    assert.instanceOf(rectangle.position, Vector2D)
  })

  it('Exposes the size', function() {
    var rectangle = new CanvasRectangle(new Canvas)
    assert.instanceOf(rectangle.size, Vector2D)
  })

  it('Exposes the stroke width', function() {
    var rectangle = new CanvasRectangle(new Canvas)
    assert.isNumber(rectangle.strokeWidth)
  })
})

describe('Layer', function() {
  it('Exposes the container element', function() {
    var layer = new Layer
    assert.instanceOf(layer.container, HTMLElement)
  })

  it('Exposes the raster canvas', function() {
    var layer = new Layer
    assert.instanceOf(layer.rasterCanvas, Canvas)
  })

  it('Emits an event when renamed', function(done) {
    var layer = new Layer
    var newName = 'a'
    layer.on('rename', function(name) {
      assert.strictEqual(newName, name)
      done()
    })
    layer.name = newName
  })

  it('Errors if setting negative size', function() {
    var layer = new Layer
    assert.throws(function() {
      layer.size = new Vector2D(-1, -1)
    })
  })

  it('Emits an event when resized', function(done) {
    var layer = new Layer
    layer.on('resize', done)
    layer.size = new Vector2D(1, 1)
  })

  it('Emits an event when toggling visibility', function(done) {
    var layer = new Layer
    layer.on('visibility', done)
    layer.visible = false
  })

  it('copy', function() {
    var layer = new Layer
    var copy = new Layer

    layer.name = 'a'
    layer.size = new Vector2D(1, 1)
    layer.visible = false

    copy.copy(layer)

    assert.strictEqual(layer.name, copy.name)
    assert.strictEqual(layer.size, copy.size)
    assert.strictEqual(layer.visible, copy.visible)
  })
})

describe('LayerManager', function() {
  it('Exposes the element', function() {
    var layerManager = new LayerManager
    assert.instanceOf(layerManager.element, HTMLElement)
  })

  it('Exposes the layers', function() {
    var layerManager = new LayerManager
    assert.isArray(layerManager.layers)
  })

  it('Exposes the size', function() {
    var layerManager = new LayerManager
    assert.instanceOf(layerManager.size, Vector2D)
  })

  it('Errors if setting negative size', function() {
    var layerManager = new LayerManager
    assert.throws(function() {
      layerManager.size = new Vector2D(-1, -1)
    })
  })

  it('Setting the size sets the size of the element', function() {
    var layerManager = new LayerManager
    var x = 9
    var y = 6
    layerManager.size = new Vector2D(x, y)
    assert.strictEqual(convertNumberToPixelLength(x), layerManager.element.style.width)
    assert.strictEqual(convertNumberToPixelLength(y), layerManager.element.style.height)
  })

  it('Setting the size sets the size of layers', function() {
    var layerManager = new LayerManager
    var size = new Vector2D(4, 8)

    for (var i = 0; i < 3; i++) {
      layerManager.layers.push(new Layer)
    }

    layerManager.size = size

    for (var item of layerManager.layers) {
      assert.strictEqual(item.size, size)
    }
  })

  it('errorIfNotManagingLayer', function() {
    var layerManager = new LayerManager
    var layer = new Layer

    layerManager.layers.push(layer)

    assert.doesNotThrow(function() {
      layerManager.errorIfNotManagingLayer(layer)
    })

    assert.throws(function() {
      layerManager.errorIfNotManagingLayer(new Layer)
    })
  })

  describe('add', function() {
    it('prepends layer to beginning of layer array', function() {
      var layerManager = new LayerManager
      var layer = new Layer

      for (var i = 0; i < 3; i++) {
        layerManager.layers.push(new Layer)
      }

      layerManager.add(layer)
      assert.strictEqual(layerManager.layers[0], layer)
    })

    it('emits an event on the manager', function(done) {
      var layerManager = new LayerManager
      var layer = new Layer

      layerManager.on('add', function(addedLayer) {
        assert.strictEqual(layer, addedLayer)
        done()
      })

      layerManager.add(layer)
    })

    it('sets the size of the layer', function() {
      var layerManager = new LayerManager
      var layer = new Layer
      var size = new Vector2D(5, 3)

      layerManager.add(layer)
      layerManager.size = size
      assert.strictEqual(layer.size, size)
    })

    it('prepends element to layer list', function() {
      var layerManager = new LayerManager
      var layer = new Layer

      layerManager.add(layer)

      assert.strictEqual(layerManager.element.firstElementChild, layer.container)
    })
  })

  describe('remove', function() {
    it('errors if removing unmanaged layer', function() {
      var layerManager = new LayerManager
      assert.throws(function() {
        layerManager.remove(new Layer)
      })
    })

    it('removes the layer from the layer list', function() {
      var layerManager = new LayerManager
      var layer = new Layer

      layerManager.add(layer)
      assert.include(layerManager.layers, layer)
      layerManager.remove(layer)
      assert.notInclude(layerManager.layers, layer)
    })

    it('removes the layer container from the layer manager element', function () {
      var layerManager = new LayerManager
      var layer = new Layer

      layerManager.add(layer)
      layerManager.remove(layer)
      assert.notInclude(Array.from(layerManager.element.children), layer.container)
    })

    it('emits an event on the manager', function(done) {
      var layerManager = new LayerManager
      var layer = new Layer

      layerManager.add(layer)
      layerManager.on('remove', function(removedLayer) {
        assert.strictEqual(layer, removedLayer)
        done()
      })
      layerManager.remove(layer)
    })

    it('adds a new raster layer if the last layer is removed', function() {
      var layerManager = new LayerManager
      var layer = new Layer

      layerManager.add(layer)
      layerManager.remove(layer)

      assert.strictEqual(layerManager.layers.length, 1)
      assert.instanceOf(layerManager.layers[0], RasterLayer)
    })
  })

  describe('addNewRasterLayer', function() {
    it('adds new raster layer', function() {
      var layerManager = new LayerManager
      layerManager.addNewRasterLayer()
      assert.strictEqual(layerManager.layers.length, 1)
      assert.instanceOf(layerManager.layers[0], RasterLayer)
    })
  })

  describe('reset', function() {
    it('clears the list of layers', function() {
      var layerManager = new LayerManager

      for (var i = 0; i < 3; i++) {
        layerManager.layers.push(new Layer)
      }

      layerManager.reset()
      assert.strictEqual(layerManager.layers.length, 1)
    })
  })
})

describe('RasterLayer', function() {
  it('fill emits raster update event', function(done) {
    var layer = new RasterLayer
    layer.size = new Vector2D
    layer.on('raster-update', done)
    layer.fill(Color())
  })
})

describe('RectangleLayer', function() {
  it('Errors if setting negative position', function() {
    var rectangle = new RectangleLayer
    assert.throws(function() {
      rectangle.position = new Vector2D(-1, -7)
    })
  })

  it('Errors if setting negative size', function() {
    var rectangle = new RectangleLayer
    assert.throws(function() {
      rectangle.rectangleSize = new Vector2D(-1, -7)
    })
  })

  it('Errors if setting negative stroke width', function() {
    var rectangle = new RectangleLayer
    assert.throws(function() {
      rectangle.strokeWidth = -6
    })
  })

  it('Exposes the stroke color', function() {
    var rectangle = new RectangleLayer
    assert.isObject(rectangle.strokeColor)
  })

  it('Exposes the fill color', function() {
    var rectangle = new RectangleLayer
    assert.isObject(rectangle.fill)
  })

  it('Exposes the position', function() {
    var rectangle = new RectangleLayer
    assert.instanceOf(rectangle.position, Vector2D)
  })

  it('Exposes the size', function() {
    var rectangle = new RectangleLayer
    assert.instanceOf(rectangle.rectangleSize, Vector2D)
  })

  it('Exposes the stroke width', function() {
    var rectangle = new RectangleLayer
    assert.isNumber(rectangle.strokeWidth)
  })

  it('Setting the position emits a raster update event', function(done) {
    var rectangleLayer = new RectangleLayer
    rectangleLayer.on('raster-update', done)
    rectangleLayer.position = new Vector2D
  })

  it('Setting the size emits a raster update event', function(done) {
    var rectangleLayer = new RectangleLayer
    rectangleLayer.on('raster-update', done)
    rectangleLayer.rectangleSize = new Vector2D
  })

  it('Setting the stroke width emits a raster update event', function(done) {
    var rectangleLayer = new RectangleLayer
    rectangleLayer.on('raster-update', done)
    rectangleLayer.strokeWidth = 1
  })

  it('Setting the fill emits a raster update event', function(done) {
    var rectangleLayer = new RectangleLayer
    rectangleLayer.on('raster-update', done)
    rectangleLayer.fill = Color()
  })

  it('Setting the stroke color emits a raster update event', function(done) {
    var rectangleLayer = new RectangleLayer
    rectangleLayer.on('raster-update', done)
    rectangleLayer.strokeColor = Color()
  })
})

describe('ToolManager', function() {
  it('Exposes the list of tools', function() {
    var toolManager = new ToolManager
    assert.isArray(toolManager.tools)
  })

  it('errorIfNotManagingTool', function() {
    var toolManager = new ToolManager
    var tool = new Tool
    toolManager.add(tool)

    assert.throws(function() {
      toolManager.errorIfNotManagingTool(new Tool)
    })

    assert.doesNotThrow(function() {
      toolManager.errorIfNotManagingTool(tool)
    })
  })

  describe('add', function() {
    it('appends a tool to the list of tools', function() {
      var toolManager = new ToolManager
      var tool = new Tool
      toolManager.add(tool)
      assert.strictEqual(tool, toolManager.tools[toolManager.tools.length - 1])
    })

    it('emits an event on the manager', function(done) {
      var toolManager = new ToolManager
      var tool = new Tool

      toolManager.on('add', function(addedTool) {
        assert.strictEqual(addedTool, tool)
        done()
      })

      toolManager.add(tool)
    })
  })
})

mocha.run()
