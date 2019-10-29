import Base from '../Base/Simple';
import G6 from '@antv/g6';
import _ from 'lodash';

import './Shape';
import './Behavior';

class Graph extends Base {
  constructor(cfg) {
    super(cfg);
    this.init(cfg);
    this.initShortCut(cfg);
  }

  init = cfg => {

    const g6 = new EditorGraph({
      ...cfg,
    });
    this.set('g6', g6, 'main');

    window.g6 = g6

  };

  initShortCut = (cfg) => {
    const { shortcut = {} } = cfg;
    //声明command中生效的快捷键
    const shortcutCmdMap = {
      redo: true,
      undo: true,
      delete: true,
      resetZoom: true,
      autoZoom: true,
      zoomIn: true,
      zoomOut: true,
      selectAll: true,
      copy: true,
      paste: true,
      saveAll: true,
    };
    const graph = this.get('g6', 'main');
    graph.set('shortcut', _.merge({}, shortcutCmdMap, shortcut))
  }
}

export default Graph;

class EditorGraph extends G6.Graph {
  getEditor() {
    return this.get('__editor')
  }

  getStateKey(type, stateName) {
    return `${type}@${stateName}`
  }

  parseStateKey(stateKey) {
    const [type, stateName] = stateKey.split('@')
    return { type, stateName }
  }


  findItemByState(type, stateName, needItem = false) {
    const stateKey = this.getStateKey(type, stateName)
    const itemList = this.findAllByState(type, stateKey) || [];
    return needItem ? itemList :
      itemList.map(item => item.get('id')).filter(item => !!item)
  }


  // 获取当前选中状态
  getSelect(type_, needItem = false) {
    let types;
    // 处理默认值
    if (type_) {
      types = [type_]
    } else {
      types = ['node', 'edge', 'anchor']
    }

    const result = {}
    types.forEach(type => {
      // 获取所有实例
      result[type] = this.findItemByState(type, 'select', needItem)
    })

    if (type_) {
      // 如果有指定类型, 返回数组
      return result[type_] || []
    }
    return result
  }

  // 清理当前选中状态
  clearSelect(type_) {
    let types;
    // 处理默认值
    if (type_) {
      types = [type_]
    } else {
      types = ['node', 'edge', 'anchor']
    }

    types.forEach(type => {
      // 获取所有实例
      this.clearState(type, 'select')
      this.clearState(type, 'hover')
    })
  }

  clearState(type, state) {
    const stateKey = this.getStateKey(type, state)
    const itemList = this.findAllByState(type, stateKey) || [];
    itemList.forEach(item => {
      this.setItemState(item, stateKey, false)
    })
  }

  //states = { select: { 123: true }}
  setState(item_, states) {
    const graph = this

    if (_.isObject(states)) {
      _.each(states, (idMap, stateName) => {

        if (_.isNil(idMap)) {
          const type = item_.get('type')
          const states = this.get('states')
          const currentState = states[`${type}@${stateName}`] || []
          currentState.forEach(item => {
            graph.setItemState(item, `${type}@${stateName}`, false)
          })
        }

        if (_.isString(idMap)) {
          const item = graph.findById(idMap)
          const type = item.get('type');
          graph.setItemState(item, `${type}@${stateName}`, true)
        }

        if (_.isObject(idMap)) {
          _.each(idMap, (val, id) => {
            const item = graph.findById(id)
            if (item) {
              const type = item.get('type');
              const stateKey = `${type}@${stateName}`
              graph.setItemState(item, stateKey, val)
            } else {
              console.warn(JSON.stringify(states, null, 2))
            }
          })
        }
      })
    }
  }

  getState() {
    const states = this.get('states') || {}
    const result = {
      node: {
        hover: '',
        select: {},
        default: {},
        processing: {},
        error: {},
      },
      anchor: {
        active: {},
        hover: '',
      },
      edge: {
        select: {},
        hover: '',
      }
    }
    _.each(states, (list, key = '') => {
      const [type, stateName] = key.split('@')
      list.forEach((item) => {
        if (type && stateName) {
          if (stateName === 'hover') {
            result[type][stateName] = item.get('id')
          }
          result[type][stateName] = {
            [item.get('id')]: true,
          }
        }
      })
    })

    return result
  }
  
  cursor(cursor) {
    if (!this.canvasStyle) {
      this.canvasStyle = this.get('canvas').get('el').style
    }
    const current = this.get('canvas').get('el').style.cursor



    if (!cursor) {
      this.canvasStyle.cursor = this.preCursor
      this.preCursor = 'default'
    }

    const self = this;

    setTimeout(() => {
      if (cursor) {
        if (self.preCursor !== self.canvasStyle.cursor) {
          self.preCursor = current
        }
        self.canvasStyle.cursor = cursor
        return
      }
    }, 0);
  }

  focus() {
    this.get('container').focus()
  }

  clearData() {
    const self = this
    self.set('data', null)
    self.set('nodes', [])
    self.set('edges', [])
    self.set('itemMap', {})
  }
}