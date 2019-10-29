/**
 * 将接口返回的数据转成布局需要的数据
 * @param {object} data 节点和边的数据集
 */
import { omit } from 'lodash'

export const transformData = data => {
  let nodes = {};
  let edges = {};
  if (data.nodes) {
    nodes = data.nodes.map((node, index) => {
      return {
        id: node.id,
        nodeType: node.nodeType,
        shape: "circle-node",
        label: node.label,
        data: node
      };
    });
  }

  if (data.edges) {
    edges = data.edges.map(edge => {
      const { source, target, shape, 
        edgeType, timestamp, loopCfg } = edge;
      return {
        data: edge,
        edgeType,
        source,
        target,
        shape,
        timestamp,
        label: edge.label,
        edgeOffset: edge.edgeOffset || 0,
        loopCfg
      };
    });
  }

  return {
    nodes,
    edges
  };
};