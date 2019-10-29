/*
 * @Author: moyee
 * @Date: 2019-02-12 15:30:31
 * @LastEditors: moyee
 * @LastEditTime: 2019-08-16 14:14:56
 * @Description: 鼠标hover的Behavior，相关节点highlight和dark
 */

import G6 from '@antv/g6';

G6.registerBehavior('analyzer-node-hover', {
  getEvents() {
    return {
      'node:mouseenter': 'onNodeHover',
      'node:mouseover': 'onNodeHover',
      'node:mouseout': 'onNodeUnHover',
      'node:mouseleave': 'onNodeUnHover',
    };
  },
  onNodeHover(evt) {
    const { item } = evt

    const graph = this.graph

    // 所有节点和边的透明度都变成0.2
    const nodeLark = graph.getStateKey('node', 'inactive')
    const edgeLark = graph.getStateKey('edge', 'inactive')
    const nodes = graph.getNodes()
    const allEdges = graph.getEdges()
    
    nodes.forEach(node => {
      if(!node.destroyed && node !== item) {
        const model = node.getModel()
        const { style } = model
        if(!style || style.opacity !== 0) {
          graph.setItemState(node, nodeLark, true)
        }
      }
    })
    
    allEdges.forEach(edge => graph.setItemState(edge, edgeLark, true))

    const stateKey = graph.getStateKey('node', 'hover');
    const edgeKey = graph.getStateKey('edge', 'hover')
    // 与当前节点相连的所有边及节点透明度改成1.0
    const edges = item.getEdges()
    
    edges.forEach(edge => {
      const target = edge.getTarget()
      const source = edge.getSource()
      if(target !== item || target === source) {
        graph.setItemState(edge, edgeKey, true)
        graph.setItemState(target, stateKey, true)
      }
    })

    const selecteKey = graph.getStateKey('node', 'select')

    const hasSelected = item.hasState(selecteKey)
    if(!hasSelected) {
      graph.setItemState(item, stateKey, true)
    }
  },

  onNodeUnHover(evt) {
    const { item } = evt
    const graph = this.graph;

    const nodeLark = graph.getStateKey('node', 'inactive')
    const edgeLark = graph.getStateKey('edge', 'inactive')
    const allNodes = graph.getNodes()
    const allEdges = graph.getEdges()
    
    // 取消所有inactive状态
    allNodes.forEach(node => {
      if(!node.destroyed) {
        graph.setItemState(node, nodeLark, false)
      }
    })
    allEdges.forEach(edge => graph.setItemState(edge, edgeLark, false))
    
    const stateKey = graph.getStateKey('node', 'hover')
    const edgeKey = graph.getStateKey('edge', 'hover')

    // 取消所有hover状态 
    allNodes.forEach(node => {
      if(!node.destroyed) {
        graph.setItemState(node, stateKey, false)
      }
    })
    allEdges.forEach(edge => graph.setItemState(edge, edgeKey, false))

    const selecteKey = graph.getStateKey('node', 'select')

    const hasSelected = item.hasState(selecteKey)
    if(!hasSelected) {
      graph.setItemState(item, stateKey, false)
    }
  },
});