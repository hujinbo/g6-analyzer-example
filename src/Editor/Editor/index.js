import EditorBase from '../Base/EditorBase';

import InstanceManager from '../InstanceManager'
import _ from 'lodash';
import Graph from '@antv/g6-editor/common/graph';
import Command from '../Command'
import eventEnum from '../EventCenter/constant'


class Editor extends EditorBase {

  static Graph = Graph
  static addCommand = Command.addCommand

  constructor(cfg, ) {
    super(cfg);
    this.init(cfg);
  }

  init = (cfg) => {
    const { uuid, graphCfg, cmdCfg, gridCfg, groupStyle } = cfg;
    this.uuid = uuid
    this.initEvent();
    this.initGraph(graphCfg);
    this.initCmd(cmdCfg);
    this.initAlignLine()
    this.initGrid(gridCfg)
    this.initNodeGroup(groupStyle)
    this.initShortCut({});
    this.emit(eventEnum.editorReady, this)
  };


  on(...args) {
    const event = this.getEvent();
    if (!event) {
      debugger
    }
    event.on(...args)
  }

  off(...args) {
    const event = this.getEvent();
    event.off(...args)
  }

  emit(...args) {
    const event = this.getEvent();
    event.emit(...args)
  }


  // 执行命令
  executeCommand = (fn, params, cfg) => {
    const cmd = this.getCmd();
    if (_.isString(fn)) {
      cmd.execute(fn, this, cfg, params);
    } else if (_.isFunction(fn)) {
      cmd.execute('common', this, { method: fn }, params);
    }
  };

  /**
   * Editor 加载数据，渲染关系图
   * @param {object} data 渲染的数据
   * @memberof Editor
   */
  render = (data, isFitView) => {


    this.emit(eventEnum.beforeEditorRender, data)

    const graph = this.getGraph();
    const eventCenter = InstanceManager.getEventCenter(this.uuid)

    // 屏蔽dag监听事件
    eventCenter.disableGroup(this.uuid, 'graph', ['graph:dagChange'])

    // graph.clear()
    graph.changeData(data);

    // graph.render();

    if (isFitView&&data.nodes.length>0) {
      setTimeout(() => {
        const graph = this.getGraph()
        const group = graph.get('group')
        const canvas = graph.get('canvas')
        const width = canvas.get('width')
        const height = canvas.get('height')
        const bbox = group.getBBox()

        // 画布比group bbox大， 即视口大小大于group的bbox
        // canvas的大小width/height和graph.get('width'), graph.get('height')值相等
        let padding = []
        if (width > bbox.width && height > bbox.height) {
          const deltaWidth = (width - bbox.width) / 2
          const deltaHeight = (height - bbox.height) / 2
          padding = [deltaHeight * 0.8, deltaWidth, deltaHeight * 1.2, deltaWidth]
        } else {
          padding = [20, 20]
        }

        graph.fitView(padding)

      }, 100);
    }


    // 恢复dag监听事件
    eventCenter.enableGroup(this.uuid, 'graph', ['graph:dagChange'])

    this.emit(eventEnum.afterEditorRender, data)
  };

  reloadData = (data, isFitView = true) => {
    this.render(data, isFitView)
  };

  /**
   * 获取Editor中所有关系图节点和边的数据
   *
   * @memberof Editor
   */
  getData = () => {
    const graph = this.getGraph();
    return graph.save();
  };



  updateNode = (nodeId, data) => {
    this.emit('data:beforeUpdate')
    const graph = this.getGraph();
    graph.update(nodeId, data)
    graph.refreshPositions()
    this.emit('data:afterUpdate')
  }



  getSelected = (type) => {
    const graph = this.getGraph();
    return graph.getSelect(type)
  }


  clearItemStatus(item) {
    const graph = this.getGraph();
    const type = item.get('type');
    ['default', 'processing', 'error', 'success'].forEach(status => {
      if (type) {
        const stateKey = graph.getStateKey(type, status)
        if (item.hasState(stateKey)) {
          graph.setItemState(item, stateKey, false)
        }
      }
    })
  }

  /**
   * 批量更新节点和边的状态
   * @param {object} nodes 节点, edges 边， styles 样式，格式为 { style: {} }
   */
  updateItemState({ nodes = [], edges = [], style = {} }) {

    const graph = this.getGraph()
    const autoPaint = graph.get('autoPaint')
    graph.setAutoPaint(false)
    nodes.forEach(nodeModel => {
      const node = graph.findById(nodeModel.id)
      const edgeOnNode = node.getEdges()
      edgeOnNode.forEach(edge => graph.updateItem(edge, {
        style
      }))
      graph.updateItem(node, { style })
    })
    
    edges.forEach(model => {
      const { source, target, style } = model
      const edge = graph.findAll('edge', (e) => {
        const param = e.getModel()
        return param.source === source && param.target === target
      })
      edge.forEach(e => graph.updateItem(e, { style }))
      
    })

    graph.setAutoPaint(autoPaint)
    graph.paint()
  }

  updateSelected = (selected) => {
    const graph = this.getGraph();
    _.each(selected, (ids = [], type) => {
      ids.forEach(id => {
        const item = graph.findById(id);
        if (!item) return;
        if (item.get('type') === 'node') {
          const stateKey = graph.getStateKey('node', 'select')
          graph.setItemState(item, stateKey, true)
        }
      })

    })
  }

  updateStatus = (nodeDiffMap = {}, nodeState = {}, edgeDiffMap = {}, edgeState = {}) => {
    const graph = this.getGraph();
    _.each(nodeDiffMap, (status, id) => {
      const item = graph.findById(id);

      if (item) {
        this.clearItemStatus(item)
        const stateKey = graph.getStateKey('node', status)
        graph.setItemState(item, stateKey, true)
      }

    })

    _.each(edgeDiffMap, (status, id) => {
      const item = graph.findById(id);
      this.clearItemStatus(item)
      if (item) {
        const stateKey = graph.getStateKey('edge', status)
        graph.setItemState(item, stateKey, true)
      }

    })
  }

  clearStatus = () => {

    const parse2Map = (list) => {
      return list.reduce((accum, item) => {
        accum[item.id] = 'default';
        return accum
      }, {})
    }

    const { nodes = [], edges = [] } = this.getData()
    const nodeMap = parse2Map(nodes)
    const nodeState = { 'default': Object.keys(nodeMap) }
    const edgeMap = parse2Map(edges)
    const edgeState = { 'default': Object.keys(edgeMap) }

    this.updateStatus(nodeMap, nodeState, edgeMap, edgeState)
  }

  setSelected = (selected) => {
    const graph = this.getGraph();
    _.each(selected, (val, id) => {
      const item = graph.findById(id);
      if (!item) return;
      if (item.get('type') === 'node') {
        const stateKey = graph.getStateKey('node', 'select')
        graph.setItemState(item, stateKey, true)
      }
    })
  }

  updateSelected = (selected = { node: [], edge: [] }) => {
    const graph = this.getGraph();
    _.each(selected, (ids = [], type) => {
      ids.forEach(id => {
        const item = graph.findById(id);
        if (!item) return;
        if (item.get('type') === 'node') {
          const stateKey = graph.getStateKey('node', 'select')
          graph.setItemState(item, stateKey, true)
        }
      })
    })
  }

  clearSelect = () => {
    const graph = this.getGraph();
    const selected = this.getSelected();
    _.each(selected, (val, id) => {
      if (_.isArray(val)) {
        val.forEach(id => {
          const item = graph.findById(id);
          if (item && !item.destroyed) {
            const type = item.get('type')
            const stateKey = graph.getStateKey(type, 'select')
            graph.setItemState(item, stateKey, false)
          }
        })
      } else {
        console.warn('clearSelect 失败,检查格式', selected)
      }
    })
  }

  destroy() {
    this.emit(eventEnum.editorUnload, this)
    // unbindEvent(this)
    const event = this.getEvent()
    event.removeAllListeners();
    const graph = this.getGraph();
    graph.destroy()
    this._cfg = {};
    this._private = {};
    this.destroyed = true;
  }
}

export default Editor;
