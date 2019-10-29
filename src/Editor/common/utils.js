
import lodash from 'lodash'

import G6 from '@antv/g6'
import Graph from './graph'

// G6 Utils方法
export const Util = G6.Util

export * from 'lodash'

export { default as _ } from 'lodash'


export const foreach = (target, fn) => {
  if (lodash.isArray(target)) {
    target.forEach(fn)
  } else if (lodash.isObject(target)) {
    objForEach(target, fn)
  }
}

export const objForEach = (obj = {}, fn) => (Object.entries(obj).forEach(
  (item, idx) => fn(item[0], item[1], idx))
);


// export const hasCycle = (edges) => {
//   const sourceIdmap = _.groupBy(edges, 'source')

//   const Graph = require('tarjan-graph');
//   const graph = new Graph()
//   objForEach(sourceIdmap, (id, edges) => {
//     const targetList = edges.map(edge => {
//       return edge.target
//     })
//     graph.add(id, targetList)
//   })

//   return graph.hasCycle()
// }

/**
 * 将页面坐标转换成Graph坐标
 * @param {object} eclientPosition
 * @param {object} graph Graph实例
 */
export const transPosition = (clientPosition, graph) => {

  // x y 表示页面的Client位置坐标
  const { x, y } = clientPosition

  // 页面的pixelRatio值
  const pixelRatio = graph.get('canvas').get('pixelRatio')
  const matrix = graph.get('group').getMatrix()

  // 从页面坐标转成canvas坐标
  const canvasPosition = graph.get('canvas').getPointByClient(x, y)

  // 将canvas坐标转成graph坐标
  const realPosition = Util.invertMatrix({ x: canvasPosition.x / pixelRatio, y: canvasPosition.y / pixelRatio }, matrix, 1)
  return realPosition
}

/**
 * 生成默认的UUDI序列
 */
export const generateUUID = () => {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-6xxx-bxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
};

// 停止冒泡
export const stopEvent = (e) => {
  if (e.preventDefault) {
    e.preventDefault();
    e.stopPropagation();
  } else {
    console.warn(e, `is not event`)
  }
};


export const hasCycle = (edges) => {
  const g = new Graph({ edges })
  return g.hasCycle()
}

/**
   * point to line distance
   * @param  {array} line 线的四个顶点 [x1, y1, x2, y2]
   * @param  {object} point 坐标点 {x, y}
   * @return {Number|NaN} distance
   */
  export const pointLineDistance = (line, point) => {
    const [ x1, y1, x2, y2 ] = line
    const { x, y } = point
    const d = [ x2 - x1, y2 - y1 ];
    if (G6.Util.vec2.exactEquals(d, [ 0, 0 ])) {
      return NaN;
    }

    const u = [ -d[1], d[0] ];
    G6.Util.vec2.normalize(u, u);
    const a = [ x - x1, y - y1 ];
    return Math.abs(G6.Util.vec2.dot(a, u));
  }

  /**
 * 计算字符串的长度
 * @param {string} str 指定的字符串
 */
const calcStrLen = (str) => {
  let len = 0;
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 0 && str.charCodeAt(i) < 128) {
      len++;
    } else {
      len += 2;
    }
  }
  return len;
}

/**
 * 计算显示的字符串
 * @param {string} str 要裁剪的字符串
 * @param {number} maxWidth 最大宽度
 * @param {number} fontSize 字体大小
 */
export const fittingString = (str, maxWidth, fontSize) => {
  const fontWidth = fontSize * 1.3 //字号+边距
  maxWidth = maxWidth * 2 // 需要根据自己项目调整
  const width = calcStrLen(str) * fontWidth
  const ellipsis = '…'
  if (width > maxWidth) {
    const actualLen = Math.floor((maxWidth - 10) / fontWidth);
    const result = str.substring(0, actualLen) + ellipsis
    return result
  }
  return str
}