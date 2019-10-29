import { upperFirst, merge } from 'lodash'

const gridStyle = {
  stroke: '#A3B1BF',
  lineWidth: 0.5
}

class EditorGrid {
  getDefaultCfg() {
    return {
      /**
       * grid cell
       * @type {number}
       */
      cell: 16,
      /**
       * grid line style
       * @type {object}
       */
      line: gridStyle,
      /**
       * grid style, support point and line
       * @type {string}
       */
      type: 'point',
      /**
       * visible
       * @type {boolean}
       */
      visible: true
    };
  }

  constructor(options = {}) {
    const {
      cfg = {},
      editor
    } = options
    this.gridConfig = merge(this.getDefaultCfg(), cfg)
    this.editor = editor;
    this.gridElement = null
    this.gridGroup = null
  }

  init() {
    this.onViewPortChange()
    !this.visible && this.hide()
  }

  onViewPortChange() {
    const graph = this.editor.getGraph()
    graph.on('afterviewportchange', () => {
      this.update()
    })
    // graph.on('canvas:drag', () => {
    //   this.update()
    // })
  }

  show() {
    const graph = this.editor.getGraph()
    const group = graph.get('group')
    const matrix = group.getMatrix()
    const path = this.getPath()

    const { line, type } = this.gridConfig

    const attrs = line

    const lineWidth = type === 'line' ? 1 / matrix[0] : 2 / matrix[0]

    if(type === 'point') {
      attrs.lineDash = null
    }

    attrs.lineWidth = lineWidth
    attrs.path = path

    const gridGroup = group.addGroup()

    const gridElement = gridGroup.addShape('path', {
      attrs,
      capture: false,
      zIndex: 0
    })

    // gridElement.toBack()
    gridGroup.toBack()
    this.gridElement = gridElement
    this.gridGroup = gridGroup
    gridGroup.get('canvas').draw()
    this.gridConfig.visible = false
  }

  getPath() {
    const { type } = this.gridConfig
    return this[`get${upperFirst(type)}Path`]()
  }

  getLinePath() {
    const graph = this.editor.getGraph()
    const width = graph.get('canvas').getWidth()
    const height = graph.get('canvas').getHeight()

    //graph.getPointByCanvas(0, 0)
    const topLeft = graph.get('canvas').getPointByClient(0, 0)

    //graph.getPointByCanvas(width, height)
    const bottomRight = graph.get('canvas').getPointByClient(width, height)

    const { cell } = this.gridConfig

    const flooX = Math.ceil(topLeft.x / cell) * cell
    const flooY = Math.ceil(topLeft.y / cell) * cell
    const path = []

    for(let i = 0; i <= bottomRight.x - topLeft.x; i += cell) {
      const x = flooX + i
      path.push(['M', x, topLeft.y])
      path.push(['L', x, bottomRight.y])
    }

    for(let i = 0; i <= bottomRight.y - topLeft.y; i += cell) {
      const y = flooY + i
      path.push(['M', topLeft.x, y])
      path.push(['L', bottomRight.x, y])
    }

    return path
  }

  getPointPath() {
    const graph = this.editor.getGraph()
    const width = graph.get('canvas').getWidth()
    const height = graph.get('canvas').getHeight()

    //graph.getPointByCanvas(0, 0) getCanvasByPoint getPointByClient
    const { x, y } = graph.getPointByClient(0, 0)
    const topLeft = graph.getCanvasByPoint(0, 0);
    console.log(x, y, topLeft)
    //graph.getPointByCanvas(width, height)
    const bottomRight = graph.getCanvasByPoint(width * 2, height * 2)

    const group = graph.get('group')
    const matrix = group.getMatrix()

    const detalx = 2 / matrix[0]

    const cell = this.getCell(group)

    const flooX = Math.ceil(topLeft.x / cell) * cell
    const flooY = Math.ceil(topLeft.y / cell) * cell

    const path = []

    for(let i = 0; i<= bottomRight.x - topLeft.x; i += cell) {
      const x = flooX + i
      for(let j = 0; j <= bottomRight.y - topLeft.y; j += cell) {
        const y = flooY + j
        path.push(['M', x, y])
        path.push(['L', x + detalx, y])
      }
     }

     return path
  }

  getCell(group) {
    const { cell } = this.gridConfig
    const matrix = group.getMatrix()
    const scale = matrix[0]
    if(cell * scale < 9.6) {
      return 9.6 / scale
    }
    return cell
  }

  update(cfg) {
    const gridElement = this.gridElement
    if(!gridElement) {
      return
    }
    this.gridConfig = merge(this.gridConfig, cfg)
    const path = this.getPath()
    const graph = this.editor.getGraph()
    const group = graph.get('group')
    const matrix = group.getMatrix()
    const { type } = this.gridConfig
    const lineWidth = type === 'line' ? 1 / matrix[0] : 2 / matrix[0]
    gridElement.attr('lineWidth', lineWidth)
    gridElement.attr('path', path)
    this.gridGroup.get('canvas').draw()
  }

  hide() {
    if(this.gridGroup) {
      this.gridGroup.destroy()
      const graph = this.editor.getGraph()
      graph.paint()
      this.gridConfig.visible = true
    }
  }

  destroy() {
    const gridElement = this.gridElement
    gridElement && gridElement.remove()
  }
}

export default EditorGrid
