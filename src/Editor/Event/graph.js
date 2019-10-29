import EventCenter from '../EventCenter'
import eventEnum from '../EventCenter/constant'



// 画布锚点tooltip
EventCenter.addGroup({
  key: 'graph:anchor-tooltip',
  targetKey: 'graph',
  eventMap: {
    [eventEnum.anchorMouseEnter]: 'onMouseEnter',
    [eventEnum.anchorMouseLeave]: 'onMouseLeave',
    'anchor:mouseout': 'onMouseLeave',
    [eventEnum.edgeMouseEnter]: 'onEdgeMouseEnter',
    [eventEnum.edgeMouseLeave]: 'onEdgeMouseLeave'
  },
  handlers: {
    onMouseEnter(e) {
      const { store, graph } = this
      const anchor = e.item.get('model')
      const { x, y } = anchor
      // 获取当前
      const { x: clientX, y: clientY } = graph.getClientByPoint(x, y)
      store.emit(eventEnum.anchorMouseEnter, {
        clientX: clientX,
        clientY: clientY,
        ...anchor
      })
      graph.cursor('crosshair')
    },
    onMouseLeave(e) {
      const { store, graph } = this
      store.emit(eventEnum.anchorMouseLeave)
      graph.cursor()
    },
    onEdgeMouseEnter(e) {
      const { store, graph } = this
      const { item, clientX, clientY, target } = e
      const hoverType = target.get('type')

      if(hoverType === 'text') {
        const model = item.getModel()
        graph.cursor('pointer')
        store.emit(eventEnum.edgeMouseEnter, { clientY, clientX, ...model })
      }
    },
    onEdgeMouseLeave(e) {
      const { store, graph } = this
      graph.cursor()
      store.emit(eventEnum.edgeMouseLeave)
    }
  }
})


// 节点contextMenu
EventCenter.addGroup({
  key: 'graph:node-contextmenu',
  targetKey: 'graph',
  eventMap: {
    [eventEnum.nodeContextMenu]: 'onNodeContextMenu',
    [eventEnum.canvasContextMenu]: 'onCanvasContextMenu',
    [eventEnum.contextMenuItem]: 'onContextMenuClick'
  },
  handlers: {
    onNodeContextMenu(evt) {
      const { store, graph } = this
      const { x, y, item } = evt
      if (!item) {
        return false
      }
      const model = item.get('model')
      const { x: clientX, y: clientY } = graph.getClientByPoint(x, y)
      store.emit(eventEnum.nodeContextMenu, { clientY: clientX, clientX: clientY, ...model })
    },
    onCanvasContextMenu(evt) {
      const { store, graph } = this
      const { x, y } = evt
      const { x: clientX, y: clientY } = graph.getClientByPoint(x, y)
      store.emit(eventEnum.canvasContextMenu, { isCanvas: true, codeName: 'canvas', clientY: clientX, clientX: clientY, x, y })
    },
    onContextMenuClick(...args) {
      const { store } = this
      if (args.length > 0) {
        const result = args[0]
        store.emit(eventEnum.contextMenuItem, result)
      }
    }
  }
})

// 画布节点点击 转发到redux
EventCenter.addGroup({
  key: 'graph:onClick',
  targetKey: 'graph',
  eventMap: {
    [eventEnum.nodeClick]: 'onNodeClick',
    [eventEnum.edgeClick]: 'onEdgeClick',
    [eventEnum.nodeDbClick]: 'onNodeDoubleClick',
    [eventEnum.canvasClick]: 'onCanvasClick',
    [eventEnum.multiSelect]: 'onMultiSelect',
    [eventEnum.groupClick]: 'onGroupClick'
  },
  handlers: {
    onNodeClick(e) {
      const { store } = this
      const node = e.item.get('model')
      store.emit(eventEnum.nodeClick, node)
    },
    onEdgeClick(e) {
      const { store } = this
      // 业务上会根据e.target进行判断
      store.emit(eventEnum.edgeClick, e)
    },
    onNodeDoubleClick(e) {
      const { store } = this
      const node = e.item.get('model')
      store.emit(eventEnum.nodeDbClick, node)
    },
    onCanvasClick(e) {
      const { store } = this
      store.emit(eventEnum.canvasClick)
    },
    onMultiSelect(...args) {
      const { store } = this
      store.emit(eventEnum.multiSelect, ...args)
    },
    onGroupClick(...args) {
      const { store } = this
      store.emit(eventEnum.groupClick, ...args)
    }
  }
})


// 画布节点边的增删 转发到redux
EventCenter.addGroup({
  key: 'graph:dagChange',
  targetKey: 'graph',
  eventMap: {
    'aftereadditem': 'afterAdd',
    'beforeremoveitem': 'beforeDel'
  },
  handlers: {
    beforeDel(e) {
      // 触发删除节点
      const { item = {} } = e
      const { store } = this

      const type = item.get('type');
      const model = { ...item.get('model') };


      if (type === 'node') {
        // 1. 删除node
        // 2. 清理参数
        store.emit(eventEnum.nodeDel, model)

      } else if (type === 'edge') {
        // 1. 删除node
        // 2. 清理参数
        store.emit(eventEnum.edgeDel, model)
      }

    },

    afterAdd(e) {
      console.log(this)
      // 触发添加节点
      const { store } = this;
      const { model, type } = e
      if (type === 'node') {
        store.emit(eventEnum.nodeAdd, model)
      } else if (type === 'edge') {
        store.emit(eventEnum.edgeAdd, model)
      }
    },

  }
})



// 画布状态改变  生成新的事件=> 'graph:selectChange'

EventCenter.addGroup({
  key: 'graph:selectChange',
  targetKey: 'graph',
  eventMap: {
    [eventEnum.nodeClick]: 'onStateChange',
    [eventEnum.edgeClick]: 'onStateChange',
    [eventEnum.canvasClick]: 'onStateChange',
    [eventEnum.multiSelect]: 'onStateChange',
  },
  handlers: {
    onStateChange(...args) {

      const { graph, store } = this;
      const { node = [], edge = [] } = graph.getSelect(null, true)

      const getModel = (item) => {
        return item.get('model')
      }

      const data = {
        nodes: node.map(getModel),
        edges: edge.map(getModel),
      }

      // 在store event中再指定处理函数
      store.emit(eventEnum.selectChange, data)
    },
  }
})



