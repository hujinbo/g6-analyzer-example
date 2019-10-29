/*
 * @Author: moyee
 * @Date: 2019-06-01 15:49:43
 * @LastEditors: moyee
 * @LastEditTime: 2019-08-16 13:39:58
 * @Description: file content
 */
import { merge, groupBy } from 'lodash'
import { nodeColorMap, edgeTypeColorMap, nodeZHMap } from '../../constant'
/**
 * 合并图数据库中单个节点或两个节点之间的多条边
 *
 * @param {array} edges 边的数据
 * @returns 合并后的边的数据
 */
export const aggregationEdges = (edges) => {
  const len = edges.length
  const resultMap = {}
  const result = []
  let count = 0
  const loopPosition = ['top', 'top-right', 'top-left', 'right']
  for(let i = 0; i < len; i++) {
    const edge = edges[i]
    const source = edge.srcId
    const target = edge.dstId
    const edgeType = edge.label
    const aggId = `${source}-${target}-${edgeType}`
    edge.aggId = aggId
    edge.source = edge.srcId
    edge.target = edge.dstId
    // edge.label = edge.edgeType
    let tmpEdge
    if(!resultMap[aggId]) {
      if(source === target) {
        // edge.loopCfg = {
        //   position: loopPosition[count]
        // }
        tmpEdge = merge({}, edge, {
          aggId: `${source}-${target}-${edgeType}`,
          sourceTarget: `${source}-${target}`,
          aggEdges: [edge],
          shape: 'self-loop-edge',
          loopCfg: {
            position: loopPosition[count]
          }
        })
        count++
      } else {
        tmpEdge = merge({}, edge, {
          aggId: `${source}-${target}-${edgeType}`,
          sourceTarget: `${source}-${target}`,
          aggEdges: [edge],
          shape: 'edge-width-rect'
        })
      }
      
      result.push(tmpEdge)
      resultMap[`${source}-${target}-${edgeType}`] = edge
    } else {
      for(let k = 0; k < result.length; k++) {
        const current = result[k]
        if(current.aggId === edge.aggId) {
          current.aggEdges.push(edge)
          break
        }
      }
    }
  }
  return result
}

/**
 * 从查询的图数据库中获取图例数据
 *
 * @param {object} data
 * @returns 图例数据，分为节点和边
 */
export const getLegendData = (data) => {
  // 从图数据中获取图例数据
  const nodeLegends = []
  const nodeTypes = groupBy(data.nodes, 'nodeType')
  for(let nodeType in nodeTypes) {
    const nodes = nodeTypes[nodeType]
    let enable = false
    // 如果同label节点中有一个隐藏，可legend上显示关闭
    for(let node of nodes) {
      const style = node.style
      if(style) {
        enable = style.opacity === 1 ? true : false
        break
      } else {
        enable = true
      }
    }
    nodeLegends.push({
      type: nodeType,
      label: nodeZHMap[nodeType],
      color: nodeColorMap[nodeType] && nodeColorMap[nodeType][0] || '#ccc',
      enable
    })
  }

  const edgeLegends = []
  const edgeTypes = groupBy(data.edges, 'label')
  for(let edgeType in edgeTypes) {
    const edges = edgeTypes[edgeType]
    let edgeEable = false
    // 如果同label节点中有一个隐藏，可legend上显示关闭
    for(let edge of edges) {
      const edgeStyle = edge.style
      if(edgeStyle) {
        edgeEable = edgeStyle.opacity === 1 ? true : false
        break
      } else {
        edgeEable = true
      }
    }

    edgeLegends.push({
      type: edges[0].label,
      label: edges[0].label,
      color: edgeTypeColorMap[edgeType] && edgeTypeColorMap[edgeType][0] || '#ccc',
      enable: edgeEable
    })
  }
  
  return {
    nodes: nodeLegends,
    edges: edgeLegends
  }
}