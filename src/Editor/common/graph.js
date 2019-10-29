import _ from 'lodash';

export const each = (obj = {}, fn) => (Object.entries(obj).forEach(
  (item, idx) => fn(item[0], item[1], idx, obj))
);

class Edge {
  constructor({ target, source }) {
    this.to = `${target}`
    this.from = `${source}`
    this.id = `${source}-${target}`
  }
}




class Graph {
  constructor({ nodes = [], edges = [] }) {
    this.adjacent = {};
    this.nodeMap = {};
    this.path = []
    this.addEdges(edges)
    this.addNodes(nodes)
  }

  addEdges(edges) {
    this.edges = edges
    edges.forEach(edge => {
      this.addEdge(edge)
    })
  }

  addEdge(edgeCfg) {
    const edge = new Edge(edgeCfg)
    if (!this.adjacent[edge.from]) {
      this.adjacent[edge.from] = []
    }
    if (!this.adjacent[edge.to]) {
      this.adjacent[edge.to] = []
    }
    this.adjacent[edge.from].push(edge)
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

  getNodeCount() {
    return Object.keys(this.adjacent).length
  }

  // 向下查找
  dfs(node, visitMap, visitList, graph) {
    visitMap[node] = true
    const edges = graph.getNodeOutputEdges(node);
    edges.forEach(edge => {
      if (!visitMap[edge.to]) {
        this.dfs(edge.to, visitMap, visitList, graph)
      }
    })
    visitList.push(node)
  }

  // 反向查找
  dfs_source(node, visitMap, visitList, graph) {
    visitMap[node] = true
    const edges = graph.getUpStream(node);
    edges.forEach(edge => {
      if (!visitMap[edge.from]) {
        this.dfs_source(edge.from, visitMap, visitList, graph)
      }
    })
    visitList.push(node)
  }

  // 向下搜索
  searcFromhNode(node) {
    node = node + ''
    const visitMap = {};
    let visitList = [];
    this.dfs(node, visitMap, visitList, this)
    visitList.reverse()
    // console.log(visitList.map(id => this.nodeMap[id].name))
    return visitList
  }

  // 向上搜索
  searchNode(node) {
    this.topOrder();
    node = node + ''
    const visitMap = {};
    let visitList = [];
    this.dfs_source(node, visitMap, visitList, this)
    // console.log(visitList.map(id => this.nodeMap[id].name))
    return visitList
  }

  // 获取子图 返回 {nodes:[],edges:[]}
  getSubGraph(node, type) {
    let nodes = []

    if (type === 'up') {
      nodes = this.searchNode(node)
    }

    if (type === 'down') {
      nodes = this.searcFromhNode(node)
    }

    const edges = this.getEdgeByNodes(nodes)
    nodes = nodes.map(id => this.nodeMap[id])

    return { nodes, edges }
  }

  getEdgeByNodes(nodes = []) {
    return this.edges.filter(edge => {
      return nodes.includes(edge.source) && nodes.includes(edge.target)
    })
  }

  getNodesName = (nodes = []) => {
    const names = nodes.map(id => (this.nodeMap[id] || {})['name'])
    console.log(names)
    return names
  }

  topOrder() {
    const visitMap = {};
    let orderList = []

    each(this.adjacent, (node, edges, idx) => {
      if (!visitMap[node]) {
        const visitList = [];
        this.dfs(node, visitMap, visitList, this)
        visitList.forEach((node) => {
          orderList.unshift(node)
        })
      }
    })
    this.orderList = orderList
    // this.orderNames = this.getNodesName(orderList)
    return orderList
  }

  hasCycle = () => {
    const { length } = this.topOrder();
    return length < this.getNodeCount()
  }

  getNodeOutputEdges(node) {
    return this.adjacent[node] || []
  }


  getSeachList = (node) => {
    return this.orderList.slice(0, this.orderList.indexOf(node))
  }

  getUpStream(node) {
    node = node + '';
    const source = [];
    const searchList = this.getSeachList(node);

    searchList.forEach(nodeId => {
      const edges = this.adjacent[nodeId]
      edges.forEach((edge) => {
        if (edge.to === node) {
          source.push(edge)
        }
      })
    })

    return source;
  }
}



export default Graph