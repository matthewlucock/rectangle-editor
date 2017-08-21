import * as Color from 'color'

import { Vector2D } from './vector'
import { LayerManager } from './layer/manager'
import { RectangleLayer } from './layer/rectangle'
import { LayerPane } from './layerPane'
import { EditorNavManager } from './editorNavManager'
import { ToolManager } from './tool/manager'
import { Tool } from './tool/tool'
import { Toolbar } from './toolbar'
import { EditorControlsManager } from './editorControlsManager'
import { EditorControlsCategory } from './editorControlsCategory'
import { RectangleTool } from './tool/rectangle'
import { BucketTool } from './tool/bucket'

const canvasPane = document.getElementById('canvas-pane')
const layerManager = new LayerManager()
layerManager.size = new Vector2D(500, 500)
canvasPane.appendChild(layerManager.element)

const layerPane = new LayerPane(layerManager)

const editorNavManager = new EditorNavManager(layerManager)

const toolManager = new ToolManager()
const toolbar = new Toolbar(toolManager)

const editorControlsManager = new EditorControlsManager(toolManager)

const rectangleTool = new RectangleTool(layerManager)
toolManager.add(rectangleTool)
const bucketTool = new BucketTool(layerManager)
toolManager.add(bucketTool)

layerManager.addNewRasterLayer()
