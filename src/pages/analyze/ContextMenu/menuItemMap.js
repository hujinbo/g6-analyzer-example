import BaseGraph from '../baseGraph'
import { message } from '@alipay/bigfish/antd'

export default {
  demo: {
    key: 'demo',
    lable: '样例 中文',
    icon: 'example',
    visible: (item) => {
      // 同步返回bool值,没有配置时默认为显示
      return true
    },
    disabled: (item) => {
      // 返回一个 Promise,  返回bool值.
      // 这里面应该只有一个逻辑分支, 保证单一职责
      // 如果要写if else 请新写一个 key
      return new Promise((resovle, reject) => {
        resovle(true || false)
      })
    },
    onClick: (item, action, key) => {
      // 这里处理点击事件 可以放到redux中统一处理.
    }
  },


  // 重命名和注释
  shorestPath: {
    label: '两点之间路径',
    icon: 'edit'
  },

  // checkCycleByNode: {
  //   label: '全量查找数据',
  //   icon: 'play-circle'
  // },
  checkCycle: {
    label: '查找图中该节点所在的数据',
    icon: 'play-circle',
    disabled: true,
    onClick: (instance, item) => {
      const graph = instance.graph
      const autoPaint = graph.get('autoPaint')
      graph.setAutoPaint(false)

      const data = graph.save()
      const nodeId = item.id
      const baseGraph = new BaseGraph(data)
      const crycle = baseGraph.crylePath(nodeId)
      console.log(crycle)
      if(!crycle.includes(nodeId)) {
        message.warn(`节点${item.label}不包含在任何环路中!`)
        return false
      }
      crycle.forEach(id => {
        const node = graph.findById(id)
        const nodeStateKey = graph.getStateKey('node', 'select')
        graph.setItemState(node, nodeStateKey, true)
        // 获取与该节点相连的edge
        const outEdges = node.getOutEdges()
        const edges = outEdges.filter(edge => {
          const model = edge.getModel()
          return crycle.includes(model.target)
        })
        const stateKey = graph.getStateKey('edge', 'select')
        edges.forEach(item => {
          graph.setItemState(item, stateKey, true);
        })
      })

      graph.setAutoPaint(autoPaint)
      graph.paint()
    }
  },

  // 复制
  // copy: {
  //   label: '复制',
  //   icon: 'copy'
  // },

  clickNodeAddEdge: {
    label: '实时构图',
    icon: 'logout'
  },

  degreeQuery1: {
    label: '展开1度关系',
    icon: 'column-width',
    degree: 1
  },

  degreeQuery2: {
    label: '展开2度关系',
    icon: 'column-width',
    degree: 2
  },

  degreeQuery3: {
    label: '展开3度关系',
    icon: 'column-width',
    degree: 3
  },
  degreeQuery4: {
    label: '展开4度关系',
    icon: 'column-width',
    degree: 4
  },
  degreeQuery5: {
    label: '展开5度关系',
    icon: 'column-width',
    degree: 5
  },
  degreeQuery6: {
    label: '展开6度关系',
    icon: 'column-width',
    degree: 6
  },

  hiddenNode: {
    label: '隐藏',
    icon: 'bell',
    onClick: (instance, item) => {
      const graph = instance.graph
      const autoPaint = graph.get('autoPaint')
      graph.setAutoPaint(false)

      const nodeId = item.id
      const currentNode = graph.findById(nodeId)

      // 取消节点的选择状态
      const selecteKey = graph.getStateKey('node', 'select')

      const hasSelected = currentNode.hasState(selecteKey)
      if(hasSelected) {
        graph.setItemState(currentNode, selecteKey, false)
      }

      const edges = currentNode.getEdges()
      edges.forEach(edge => {
        // edge.hide()
        graph.updateItem(edge, {
          style: {
            opacity: 0,
            fillOpacity: 0
          }
        })
      })
      
      graph.updateItem(currentNode, {
        style: {
          opacity: 0
        },
        labelCfg: {
          style: {
            fillOpacity: 0,
            zIndex: 0
          }
        }
      })
      currentNode.toBack()
      // currentNode.hide()

      graph.setAutoPaint(autoPaint)
      graph.paint()
    }
  },
  
  // 删除
  delete: {
    key: 'delete',
    label: '删除',
    icon: 'delete'
  }
}