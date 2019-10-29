/*
 * @Author: moyee
 * @Date: 2019-05-30 11:05:02
 * @LastEditors: moyee
 * @LastEditTime: 2019-06-06 18:10:32
 * @Description: 图类
 */
// import { isString } from 'lodash'

class StackNode {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class Stack {
  constructor() {
    this.N = 0;
    this.first = null;
  }

  push(a) {
    this.first = this._push(this.first, a);
  }

  _push(x, a) {
    if (x == null) {
      this.N++;
      return new StackNode(a);
    }
    var oldX = x;
    this.N++;
    x = new StackNode(a);
    x.next = oldX;
    return x;
  }

  pop() {
    if (this.first == null) {
      return undefined;
    }

    var oldFirst = this.first;
    var item = oldFirst.value;
    this.first = oldFirst.next;
    this.N--;

    return item;
  }

  size() {
    return this.N
  }

  isEmpty() {
    return this.N === 0;
  }

  peep() {
    if (this.first == null) {
      return undefined;
    }

    return this.first.value;
  }

  toArray() {
    var result = [];
    let x = this.first;
    while (x != null) {
      result.push(x.value);
      x = x.next;
    }
    return result;
  }
}


class Edge {
  constructor(source, target, weight = 1) {
    this.source = source
    this.target = target
    this.weight = weight
  }

  either() {
    return this.source
  }

  other(id) {
    return id === this.source ? this.target : this.source
  }

  from() {
    return this.source
  }

  to() {
    return this.target
  }
}

export default class BaseGraph {
  constructor({ nodes, edges }) {
    // { source: [Edge, Edge], target: [Edge]}
    this.adjInfo = {}
    this.nodeInfo = {}
    this.nodes = nodes

    this.marked = {}
    this.crycleMarked = {}
    this.edgeTo = {}
    this.cost = {}
    this.nodeIds = []

    this.dfsOrder = []

    // 根据传进来的nodes构造node，并初始化adjInfo
    for (let node of nodes) {
      this.adjInfo[node.id] = []
      this.nodeInfo[node.id] = node

      // 设置初始状态，全部都没有遍历过
      this.marked[node.id] = false
      this.edgeTo[node.id] = null
      this.cost[node.id] = Number.MAX_VALUE
    }

    for (let edge of edges) {
      const { source, target } = edge
      const edgeInstance = new Edge(source, target, 1)

      this.adjInfo[source].push(edgeInstance);
      this.adjInfo[target].push(edgeInstance);
    }
  }

  getNodes() {
    return this.nodes
  }

  adj(node) {
    return this.adjInfo[node]
  }

  relax(edge) {
    const source = edge.from()
    const target = edge.to()

    if (this.cost[target] > this.cost[source] + edge.weight) {
      this.cost[target] = this.cost[source] + edge.weight
      this.marked[target] = true
      this.edgeTo[target] = edge
    }
  }

  hasPathTo(nodeId) {
    return this.marked[nodeId]
  }

  pathTo(node) {
    const path = new Stack()
    for (let x = node; x !== this.source; x = this.edgeTo[x].other(x)) {
      path.push(this.edgeTo[x])
    }

    return path.toArray()
  }

  distanceTo(nodeId) {
    return this.cost[nodeId]
  }

  shortestDis(source, target) {
    this.source = source
    this.cost[source] = 0
    this.marked[source] = true

    // if(source === target) {
    //   return [new Edge(source, target)]
    // }

    for (let j = 0; j < this.nodes.length; ++j) {
      for (let v = 0; v < this.nodes.length; ++v) {
        const current = this.nodes[v]
        const adjEdges = this.adj(current.id)
        for (let i = 0; i < adjEdges.length; ++i) {
          const edge = adjEdges[i]
          this.relax(edge)
        }
      }
    }

    if (this.hasPathTo(target)) {
      var path = this.pathTo(target);
      console.log('path', path)

      for (var i = 0; i < path.length; ++i) {
        var e = path[i];

        console.log(e.from() + ' => ' + e.to() + ': ' + e.weight);
      }
      return path
      // console.log('=====distance: '  + this.distanceTo(nodeId) + '=========');
    }
    return null
  }

  /**
   * 从指定节点开始，进行深入遍历
   *
   * @param {string} nodeId 节点ID
   * @returns 返回遍历顺序的节点
   * @memberof BaseGraph
   */
  dfs(nodeId) {
    this.marked[nodeId] = true
    if (this.adjInfo[nodeId]) {
      this.dfsOrder.push(this.nodeInfo[nodeId])
    }
    const adjNode = this.adj(nodeId)

    for (let i = 0; i < adjNode.length; ++i) {
      const targetEdge = adjNode[i]
      if (!this.marked[targetEdge.target]) {
        this.dfs(targetEdge.target)
      }
    }
    return this.dfsOrder
  }

  crylePath(nodeId) {
    // 节点为1，表示正在访问，节点为2表示已经访问以及所有可以从它到达的节点，0表示没有访问
    this.crycleMarked[nodeId] = 1

    const adjNode = this.adj(nodeId)

    for (let i = 0; i < adjNode.length; ++i) {
      // if(this.dfsOrder.length > 0) {
      //   return this.dfsOrder
      // }
      const targetEdge = adjNode[i]
      // 排除入边
      if (targetEdge.target === nodeId) {
        continue
      }
      if (!this.crycleMarked[targetEdge.target]) {
        this.edgeTo[targetEdge.target] = nodeId
        this.crylePath(targetEdge.target)
      } else if (this.crycleMarked[targetEdge.target] === 1) {
        console.log(`有环路，${nodeId}, ${targetEdge.target}`)
        for (let x = nodeId; x !== targetEdge.target; x = this.edgeTo[x]) {
          this.dfsOrder.push(x)
        }
        this.dfsOrder.push(targetEdge.target)
        // this.dfsOrder.push(this.nodeInfo[nodeId])
      }
    }
    this.crycleMarked[nodeId] = 2
    // 如果不包括目标节点，则不能返回环
    return this.dfsOrder
  }
}
