import _ from 'lodash';
import G6 from '@antv/g6';

import ShapeBase from './base';

const CLS_SHAPE = 'edge-shape';


const EdgeShape = {
  style: {},
  itemType: 'edge', // node, edge, group, anchor 等
  /**
     * 文本是否跟着线自动旋转，默认 false
     * @type {Boolean}
     */
  labelAutoRotate: false,

  /**
   * 绘制边
   * @override
   * @param  {Object} cfg   边的配置项
   * @param  {G.Group} group 边的容器
   * @return {G.Shape} 图形
   */
  drawShape(cfg, group) {
    const item = group.get('item')
    const shapeStyle = this.getShapeStyle(cfg, item);
    const shape = group.addShape('path', {
      className: CLS_SHAPE,
      attrs: shapeStyle
    });
    group.set('keyShape', shape)
    return shape;
  },

  /**
   * 获取边的 path
   * @internal 供扩展的边覆盖
   * @param  {Array} points 构成边的点的集合
   * @return {Array} 构成 path 的数组
   */
  getPath(points) {
    const path = [];
    _.each(points, (point, index) => {
      if (index === 0) {
        path.push(['M', point.x, point.y]);
      } else {
        path.push(['L', point.x, point.y]);
      }
    });
    return path;
  },


  /**
 * 获取图形的配置项
 * @internal 仅在定义这一类节点使用，用户创建和更新节点
 * @param  {Object} cfg 节点的配置项
 * @return {Object} 图形的配置项
 */
  getShapeStyle(cfg, item) {
    const startPoint = cfg.startPoint;
    const endPoint = cfg.endPoint;
    const { x: x1, y: y1 } = startPoint
    const { x: x2, y: y2 } = endPoint
    let path
    if (y2 - y1 > 3 && Math.abs(x2 - x1) < 33) {
      path = this.cubicBezier(startPoint, endPoint);
    } else {
      path = this.quadratic(startPoint, endPoint);
    }

    const stateStyle = this.getStateStyle(null, false, item)
    const style = _.merge({}, stateStyle, {
      path
    }, this.style.default, cfg.style);
    return style;
  },

  cubicBezier(startPoint, endPoint) {
    const innerPoint1 = {
      x: startPoint.x,
      y: (endPoint.y - startPoint.y) * this.curvePosition[0] + startPoint.y
    };
    const innerPoint2 = {
      x: endPoint.x,
      y: (endPoint.y - startPoint.y) * this.curvePosition[1] + startPoint.y
    };

    return [
      'M', startPoint.x, startPoint.y,
      'C',
      innerPoint1.x, innerPoint1.y,
      innerPoint2.x, innerPoint2.y,
      endPoint.x, endPoint.y
    ].join(' ');
  },


  quadratic(sourcePoint, targetPoint) {
    let centerX = (sourcePoint.x + targetPoint.x) / 2;
    let centerY = (sourcePoint.y + targetPoint.y) / 2;
    let tolerance = 50;

    let sub = targetPoint.y - sourcePoint.y;

    if (sub > -100 && sub < 100) {
      tolerance = Math.max(Math.abs((targetPoint.y - sourcePoint.y)) / 2, 30);
    }
    return [
      'M', sourcePoint.x, sourcePoint.y,
      'Q', sourcePoint.x, sourcePoint.y + tolerance,
      centerX, centerY,
      'T',
      targetPoint.x, targetPoint.y
    ].join(' ');
  },
  /**
   * 更新节点，包含文本
   * @override
   * @param  {Object} cfg 节点/边的配置项
   * @param  {G6.Item} item 节点/边
   */
  update(cfg, item) {
    const group = item.getContainer();
    const shape = this.getShape(item);
    // 这里决定要更新哪些属性
    const shapeStyle = this.getShapeStyle(cfg, item);
    // 更新实例上的属性
    shape.attr(shapeStyle);

    this.afterUpdate && this.afterUpdate(cfg, item)
  },
};

const EdgeBaseShape = _.merge({}, ShapeBase, EdgeShape);

export default EdgeBaseShape


