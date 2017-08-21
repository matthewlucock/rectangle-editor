const util = require('util')
const cpy = util.promisify(require('cpy'))

cpy('src/img/logo.png', 'dist')
cpy('src/img/editor/*.png', 'dist/editor')
cpy('src/img/manual/*.png', 'dist/manual/img')
cpy('src/img/walkthroughs/*.png', 'dist/walkthroughs/img')
