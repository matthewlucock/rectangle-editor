const fs = require('fs')

const pug = require('pug')

const getPugFilePath = fileTitle => `src/markup/${fileTitle}.pug`
const getHtmlFilePath = fileTitle => `dist/${fileTitle}.html`

const indexHtml = pug.renderFile(getPugFilePath('index'))
fs.writeFileSync(getHtmlFilePath('index'), indexHtml)

const editorHtml = pug.renderFile(getPugFilePath('editor'))
fs.writeFileSync(getHtmlFilePath('editor/index'), editorHtml)

const manualPagesTitles = {
  'interface-overview': 'Interface overview',
  'editor-navigation': 'Editor navigation',
  'toolbar': 'Toolbar',
  'layer-manipulation-controls': 'Layer manipulation controls',
  'layers': 'Layers',
  'layer-list': 'Layer list',
  'rectangle-tool': 'Rectangle tool',
  'bucket-tool': 'Bucket tool'
}

for (const fileTitle of Object.keys(manualPagesTitles)) {
  const pageHtml = pug.renderFile(getPugFilePath(`manual/${fileTitle}`))
  fs.writeFileSync(getHtmlFilePath(`manual/${fileTitle}`), pageHtml)
}

const manualIndexHtml = pug.renderFile(getPugFilePath('manual/index'), {
  manualPagesTitles
})
fs.writeFileSync(getHtmlFilePath('manual/index'), manualIndexHtml)

const walkthroughsPagesTitles = {
  'editor-basics': 'Basics of using the editor',
  'using-the-layer-pane': 'Using the layer pane',
  'using-the-rectangle-tool': 'Using the rectangle tool'
}

for (const fileTitle of Object.keys(walkthroughsPagesTitles)) {
  const pageHtml = pug.renderFile(getPugFilePath(`walkthroughs/${fileTitle}`))
  fs.writeFileSync(getHtmlFilePath(`walkthroughs/${fileTitle}`), pageHtml)
}

const walkthroughsIndexHtml = pug.renderFile(
  getPugFilePath('walkthroughs/index'),
  {
    walkthroughsPagesTitles
  }
)
fs.writeFileSync(getHtmlFilePath('walkthroughs/index'), walkthroughsIndexHtml)
