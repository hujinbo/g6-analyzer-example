/*
 * @Author: moyee
 * @Date: 2019-08-16 14:51:48
 * @LastEditors: moyee
 * @LastEditTime: 2019-08-21 11:05:09
 * @Description: file content
 */
// const Numeric = require('numericjs');
const Base = require('./base');
const Util = require('@antv/g6').Util;
const MDS = require('./mds');
const RadialNonoverlapForce = require('./radialNonoverlapForce');

function getWeightMatrix(M) {
  const rows = M.length;
  const cols = M[0].length;
  const result = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      if (M[i][j] !== 0) row.push(1 / Math.pow(M[i][j], 2));
      else row.push(0);
    }
    result.push(row);
  }
  return result;
}

function getIndexById(array, id) {
  let index = -1;
  array.forEach((a, i) => {
    if (a.id === id) {
      index = i;
      return;
    }
  });
  return index;
}

function isConnected(matrix) {
  if (matrix.length > 0) {
    for (let j = 0; j < matrix[0].length; j++) {
      if (matrix[0][j] === Infinity) return false;
    }
  }
  return true;
}

class Radial extends Base {
  getDefaultCfgs() {
    return {
      maxIteration: null,         // 停止迭代的最大迭代数
      focusNode: null,            // 中心点，默认为数据中第一个点
      center: [ 0, 0 ],           // 布局中心
      unitRadius: null,           // 默认边长度
      linkDistance: 50,           // 默认边长度
      animate: true,              // 插值动画效果变换节点位置
      nonOverlap: true,           // 是否防止重叠
      nodeSize: 35,               // 节点半径
      onLayoutEnd() {},           // 布局完成回调
      onTick() {}                 // 每一迭代布局回调
    };
  }
  init() {
    const graph = this.get('graph');
    const onTick = this.get('onTick');
    const tick = () => {
      onTick && onTick();
      graph.refreshPositions();

    };
    this.set('tick', tick);
  }
  layout(data) {
    const self = this;
    self.set('data', data);
    const graph = self.get('graph');
    const nodes = data.nodes;
    const center = self.get('center');
    if (nodes.length === 0) {
      return;
    } else if (nodes.length === 1) {
      nodes[0].x = center[0];
      nodes[0].y = center[1];
      return;
    }
    const linkDistance = self.get('linkDistance');
    const unitRadius = self.get('unitRadius');

    // 如果正在布局，忽略布局请求
    if (self.isTicking()) {
      return;
    }
    // layout
    let focusNode = self.get('focusNode');
    if (Util.isString(focusNode)) {
      let found = false;
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === focusNode) {
          focusNode = nodes[i];
          self.set('focusNode', focusNode);
          found = true;
          i = nodes.length;
        }
      }
      if (!found) focusNode = null;
    }
    // default focus node
    if (!focusNode) {
      focusNode = nodes[0];
      if (!focusNode) return;
      self.set('focusNode', focusNode);
    }
    // the index of the focusNode in data
    const focusIndex = getIndexById(nodes, focusNode.id);
    self.set('focusIndex', focusIndex);

    // the graph-theoretic distance (shortest path distance) matrix
    const adjMatrix = Util.getAdjMatrix(data, false);
    self.handleAbnormalMatrix(adjMatrix, focusIndex);
    const D = Util.floydWarshall(adjMatrix);
    const connected = isConnected(D);
    self.set('distances', D);

    // the shortest path distance from each node to focusNode
    const focusNodeD = D[focusIndex];
    const width = graph.get('width');
    const height = graph.get('height');
    // the maxRadius of the graph
    const maxRadius = height > width ? width / 2 : height / 2;
    const maxD = Math.max(...focusNodeD);
    // the radius for each nodes away from focusNode
    const radii = [];
    focusNodeD.forEach((value, i) => {
      if (!unitRadius) radii[i] = value * maxRadius / maxD;
      else radii[i] = value * unitRadius;
    });
    self.set('radii', radii);

    const eIdealD = self.eIdealDisMatrix(D, linkDistance, radii);
    self.set('eIdealDistances', eIdealD);
    // the weight matrix, Wij = 1 / dij^(-2)
    const W = getWeightMatrix(eIdealD);
    self.set('weights', W);

    // the initial positions from mds
    const mds = new MDS({ distances: eIdealD, linkDistance, dimension: 2 });
    let positions = mds.layout();
    positions.forEach(p => {
      if (isNaN(p[0])) p[0] = Math.random() * linkDistance;
      if (isNaN(p[1])) p[1] = Math.random() * linkDistance;
    });
    self.set('positions', positions);
    positions.forEach((p, i) => {
      nodes[i].x = p[0] + center[0];
      nodes[i].y = p[1] + center[1];
    });
    // if the graph is connected, layout by radial layout and force nonoverlap
    if (connected) {
      // move the graph to origin, centered at focusNode
      positions.forEach(p => {
        p[0] -= positions[focusIndex][0];
        p[1] -= positions[focusIndex][1];
      });
      self.run();

      const nonOverlap = self.get('nonOverlap');
      const nodeSize = self.get('nodeSize');
      // stagger the overlapped nodes
      if (nonOverlap) {
        const nonoverlapForce = new RadialNonoverlapForce({ 
          nodeSize, adjMatrix, positions, radii, height, width,
          focusID: focusIndex,
          iterations: 200,
          k: positions.length / 4.5
        });
        positions = nonoverlapForce.layout();
      }
      // move the graph to center
      positions.forEach((p, i) => {
        nodes[i].x = p[0] + center[0];
        nodes[i].y = p[1] + center[1];
      });
    }
    // if the graph is unconnected, layout by mds
    graph.refreshPositions();
    const onLayoutEnd = self.get('onLayoutEnd');
    onLayoutEnd();
  }
  run() {
    const self = this;
    const maxIteration = self.get('maxIteration');
    const positions = self.get('positions');
    const W = self.get('weights');
    const eIdealDis = self.get('eIdealDistances');
    const radii = self.get('radii');
    for (let i = 0; i <= maxIteration; i++) {
      const param = i / maxIteration;
      self.oneIteration(param, positions, radii, eIdealDis, W);
    }
  }
  oneIteration(param, positions, radii, D, W) {
    const self = this;
    const vparam = 1 - param;
    const focusIndex = self.get('focusIndex');
    positions.forEach((v, i) => { // v
      const originDis = Util.getEDistance(v, [ 0, 0 ]);
      const reciODis = originDis === 0 ? 0 : 1 / originDis;
      if (i === focusIndex) return;
      let xMolecule = 0;
      let yMolecule = 0;
      let denominator = 0;
      positions.forEach((u, j) => { // u
        if (i === j) return;
        // the euclidean distance between v and u
        const edis = Util.getEDistance(v, u);
        const reciEdis = edis === 0 ? 0 : 1 / edis;
        let idealDis = D[j][i];
        // same for x and y
        denominator += W[j][i];
        // x
        xMolecule += W[j][i] * (u[0] + idealDis * (v[0] - u[0]) * reciEdis);
        // y
        yMolecule += W[j][i] * (u[1] + idealDis * (v[1] - u[1]) * reciEdis);
      });
      const reciR = radii[i] === 0 ? 0 : 1 / radii[i];
      denominator *= vparam;
      denominator += param * Math.pow(reciR, 2);
      // x
      xMolecule *= vparam;
      xMolecule += param * reciR * v[0] * reciODis;
      v[0] = xMolecule / denominator;
      // y
      yMolecule *= vparam;
      yMolecule += param * reciR * v[1] * reciODis;
      v[1] = yMolecule / denominator;
    });
  }
  updateLayout(cfg) {
    const self = this;
    const data = cfg.data;
    if (data) {
      self.set('data', data);
    }
    if (self.get('ticking')) {
      // stop layout
      self.set('ticking', false);
    }
    Object.keys(cfg).forEach(key => {
      self.set(key, cfg[key]);
    });
    self.layout(data);
  }
  isTicking() {
    return this.get('ticking');
  }
  destroy() {
    if (this.get('ticking')) {
      this.getSimulation().stop();
    }
    super.destroy();
  }

  eIdealDisMatrix() {
    const D = this.get('distances');
    const linkDis = this.get('linkDistance');
    const radii = this.get('radii');
    const unitRadius = this.get('unitRadius');
    const result = [];
    D.forEach((row, i) => {
      const newRow = [];
      row.forEach((v, j) => {
        if (i === j) newRow.push(0);
        else if (radii[i] === radii[j]) { // i and j are on the same circle
          newRow.push(v * linkDis / (radii[i] / unitRadius));
        } else { // i and j are on different circle
          const link = (linkDis + unitRadius) / 2;
          newRow.push(v * link);
        }
      });
      result.push(newRow);
    });
    return result;
  }
  handleAbnormalMatrix(matrix, focusIndex) {
    const rows = matrix.length;
    let emptyMatrix = true;
    for (let i = 0; i < rows; i++) {
      if (matrix[i].length !== 0) emptyMatrix = false;
      let hasDis = true;
      for (let j = 0; j < matrix[i].length; j++) {
        if (!matrix[i][j]) hasDis = false;
      }
      if (hasDis) {
        matrix[i][focusIndex] = 1;
        matrix[focusIndex][i] = 1;
      }
    }
    if (emptyMatrix) {
      let value = 0;
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < rows; j++) {
          if (i === focusIndex || j === focusIndex) value = 1;
          matrix[i][j] = value;
          value = 0;
        }
        value = 0;
      }
    }
  }
}
module.exports = Radial;