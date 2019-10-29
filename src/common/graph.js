import _ from 'lodash';

import './G'

const splice = (list, id) => {
  const index = list.indexOf(id)
  index > 0 && list.splice(index, 1)
  return list
}


class Graph {
  constructor({ nodes = [], edges = [] }) {
    this.indegreeMap = {};
    this.adjacent = {};
    this.nodeMap = {};
    this.addEdges(edges)
    this.addNodes(nodes)
  }

  addEdges(edges = []) {
    this.edges = edges
    edges.forEach(edge => {
      this.addEdge(edge)
    })
  }

  addNodes(nodes = []) {
    this.nodes = nodes;
    nodes.forEach(node => {
      this.addNode(node)
    })
  }

  addNode(node) {
    this.nodeMap[node.id] = node
  }


  addEdge(edge) {
    const { source, target } = edge;

    // 初始化每个node的入度
    if (!this.indegreeMap[target]) {
      this.indegreeMap[target] = 0
    }
    if (!this.indegreeMap[source]) {
      this.indegreeMap[source] = 0
    }

    // 初始化邻接表
    if (!this.adjacent[source]) {
      this.adjacent[source] = []
    }
    if (!this.adjacent[target]) {
      this.adjacent[target] = []
    }

    // 邻接表增加, 排除相同的
    if (!this.adjacent[target].includes(source)) {
      // 入度 +1
      this.indegreeMap[target] += 1
      this.adjacent[target].push(source)
    }
  }

  searchFromNode(node) {
    node = '' + node
    const validSort = this.topological_sort()
    const searchList = this.topList.slice(this.topList.indexOf(node))
    const visit = []
    const children = [node]
    if (validSort) {
      while (children.length) {
        children.forEach((nodeId) => {
          // 从children中删除当前的节点
          splice(children, nodeId)

          // 记录访问路径
          if (!visit.includes(nodeId)) {
            visit.push(nodeId)
          }

          // 缩小搜索范围
          splice(searchList, nodeId)

          // 搜索下一级
          searchList.forEach((id) => {
            const inputNodes = this.adjacent[id]
            if (inputNodes.includes(nodeId)) {
              !children.includes(id) && children.push(id)
            }
          })

        })
      }
      // 结束搜索
      return visit.map(id => this.nodeMap[id].name)
    }
    console.warn('not valid dag')
    return []
  }

  searchNode(node) {
    node = '' + node
    const validSort = this.topological_sort()
    const visit = []
    const parents = [node];

    if (validSort) {
      while (parents.length) {

        parents.forEach((nodeId) => {
          // parents从移出当前节点
          splice(parents, nodeId)

          // 记录访问路径
          if (!visit.includes(nodeId)) {
            visit.push(nodeId)
          }

          //获取上游节点
          const newParents = this.adjacent[nodeId]

          Array.prototype.push.apply(parents, newParents)

        })
      }
      // 结束搜索
      return visit.map(id => this.nodeMap[id].name)
    }
    console.warn('not valid dag')
    return []
  }



  topological_sort() {

    const queue = [];
    const adjacent = this.adjacent;
    const indegree = { ...this.indegreeMap };
    const nodeCount = Object.keys(adjacent).length

    this.topList = [];


    // 将所有入度为0的顶点入队
    _.each(adjacent, (val, id) => {
      if (indegree[id] === 0) {
        queue.push(id);
      }
    })

    while (queue.length > 0) {
      // 从队列中取出一个顶点
      let node = queue.pop();
      // 输出该顶点
      this.topList.push(node)

      // 将所有v指向的顶点的入度减1，并将入度减为0的顶点入栈
      _.each(adjacent, (val, id) => {
        if (adjacent[id].includes(node)) {
          indegree[id] = indegree[id] - 1
          if (indegree[id] === 0) {
            queue.push(id);
          }
        }
      })
    }

    if (this.topList.length < nodeCount)
      // 没有访问全部节点,有向图中有回路
      return false;
    else
      // 没有回路
      return true;
  }

}

export default Graph

window.Graph = Graph