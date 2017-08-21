const fs = require('fs')
const util = require('util')

const stylus = require('stylus')

const stylusRender = util.promisify(stylus.render)

const renderStylusFile = (stylusFilePathFragment, cssFilePathFragment) => {
  const stylusToParse = fs.readFileSync(
    `src/styles/${stylusFilePathFragment}.styl`,
    'utf8'
  )

  stylusRender(stylusToParse, { compress: true }).then(css => {
    fs.writeFileSync(`dist/${cssFilePathFragment}.css`, css)
  })
}

const stylusData = {
  'editor/main': 'editor/main',
  'splash': 'main',
  'help': 'help'
}

for (const fileData of Object.entries(stylusData)) renderStylusFile(...fileData)
