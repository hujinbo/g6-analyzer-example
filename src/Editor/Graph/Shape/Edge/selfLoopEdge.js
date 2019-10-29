/*
 * @Author: moyee
 * @Date: 2019-06-14 10:47:00
 * @LastEditors: moyee
 * @LastEditTime: 2019-08-16 14:22:37
 * @Description: file content
 */
import _ from 'lodash'
import G6 from '@antv/g6'
import { generateArrow } from '../../../common/arrow'
import { edgeTypeColorMap,
  maxLineWidth, minLineWidth, aggNumber } from '@/constant'
import simpleShape from '../ShapeBase/edge'
const Util = G6.Util

const defaultConf = {
  style: {
    default: {
      lineAppendWidth: 5,
      cursor: 'default',
      lineDash: [0, 0],
      lineDashOffset: 0,
      opacity: 1,
      endArrow: true,
      labelCfg: {
        style: {
          fillOpacity: 1
        }
      }
    },
    hover: {
      cursor: 'pointer',
      lineWidth: 2,
      opacity: 1,
      labelCfg: {
        style: {
          fillOpacity: 1
        }
      }
    },
    select: {
      lineWidth: 2.5,
      opacity: 1,
      cursor: 'pointer',
    },
    inactive: {
      opacity: 0,
      labelCfg: {
        style: {
          fillOpacity: 0
        }
      }
    }
  },
  itemType: 'edge',
  labelAutoRotate: true,
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
      className: 'edge-path',
      attrs: shapeStyle
    });
    return shape;
  },
  drawLabel(cfg, group) {
    const labelCfg = cfg.labelCfg || {}
    const labelStyle = this.getLabelStyle(cfg, labelCfg, group)

    const text = group.addShape('text', {
      attrs: {
        ...labelStyle,
        text: cfg.label,
        fontSize: 12,
        fill: '#404040',
        cursor: 'pointer'
      },
      className: 'edge-label'
    })

    return text 
  },

  /**
   * 获取图形的配置项
   * @internal 仅在定义这一类节点使用，用户创建和更新节点
   * @param  {Object} cfg 节点的配置项
   * @return {Object} 图形的配置项
   */
  getShapeStyle(cfg, item) {
    cfg = this.getPathPoints(cfg);
    const startPoint = cfg.startPoint;
    const endPoint = cfg.endPoint;
    const controlPoints = this.getControlPoints(cfg);
    let points = [ startPoint ]; // 添加起始点
    // 添加控制点
    if (controlPoints) {
      points = points.concat(controlPoints);
    }
    // 添加结束点
    points.push(endPoint);
    const path = this.getPath(points);
    const defaultStyle =  this.getStateStyle('edge@default', true, item)

    const style = _.merge({}, { path }, cfg.style, defaultStyle);
    return style;
  },
  /**
   * 根据不同状态，获取不同状态下的样式值
   * @param {string} name 
   * @param {string} value 
   * @param {Item} item 
   */
  getStateStyle(name, value, item) {
    const key = this.getStateKey(name)
    const model = item.getModel()
    const { style = {} } = model

    const { data } = model
    let aggEdgeWidth = minLineWidth
    if(data) {
      const { aggEdges } = data
      aggEdgeWidth = aggEdges && aggEdges.length
    }

    let arrowWidth = 1
    if (aggEdgeWidth > aggNumber) {
      aggEdgeWidth = maxLineWidth;
      arrowWidth = maxLineWidth
    } else {
      aggEdgeWidth = minLineWidth
      arrowWidth = minLineWidth * 3
    }

    const arrowStyle = {
      endArrow: {
        path: generateArrow(style.lineWidth || arrowWidth)
      }
    }

    const hoverStyle = _.merge({}, this.style.hover, style, arrowStyle)
    const selectStyle = _.merge({}, this.style.select, style, arrowStyle)
    const defaultStyle = _.merge({}, this.style.default, arrowStyle)

    // 更新颜色
    if (key === 'hover' && value) {
      if(aggEdgeWidth > minLineWidth) {
        return {
          ...hoverStyle,
          lineWidth: aggEdgeWidth,
          stroke: edgeTypeColorMap[model.edgeType] && edgeTypeColorMap[model.edgeType][1]
        }
      }
      return hoverStyle
    } else if (key === 'select' && value) {
      if(aggEdgeWidth > minLineWidth) {
        return {
          ...selectStyle,
          lineWidth: aggEdgeWidth,
          stroke: edgeTypeColorMap[model.edgeType] && edgeTypeColorMap[model.edgeType][2]
        }
      }
      return selectStyle
    } else if(key === 'inactive' && value) {
      return {
        ...this.style.inactive,
        lineWidth: aggEdgeWidth,
        stroke: edgeTypeColorMap[model.edgeType] && edgeTypeColorMap[model.edgeType][0]
      }
    } else {
      return {
        ...defaultStyle,
        lineWidth: aggEdgeWidth,
        stroke: edgeTypeColorMap[model.edgeType] && edgeTypeColorMap[model.edgeType][0],
        ...style
      }
    }
  },
  /**
   * 获取二次贝塞尔曲线的路径
   *
   * @param {array} points 起始点、控制点和结束点
   * @returns
   */
  getPath(points) {
    const path = [];
    path.push([ 'M', points[0].x, points[0].y ]);
    path.push([ 'C', points[1].x, points[1].y, points[2].x, points[2].y, points[3].x, points[3].y ]);
    return path;
  },
  /**
   * 拖动时更新path及边的label
   *
   * @param {object} cfg 边的model
   * @param {Edge} item 边的实例
   */
  update(cfg, item) {
    const { data, style } = cfg
    const group = item.getContainer();
    const model = data || cfg

    let aggEdgeWidth = minLineWidth
    if(data) {
      const { aggEdges } = data
      aggEdgeWidth = aggEdges && aggEdges.length
    }

    let arrowWidth = 1
    if (aggEdgeWidth > aggNumber) {
      aggEdgeWidth = maxLineWidth;
      arrowWidth = maxLineWidth
    } else {
      aggEdgeWidth = minLineWidth
      arrowWidth = minLineWidth * 3
    }

    const defaultStyle = _.merge({}, this.style.default, {
      lineWidth: aggEdgeWidth,
      stroke: edgeTypeColorMap[model.edgeType] && edgeTypeColorMap[model.edgeType][0],
      endArrow: {
        path: generateArrow(arrowWidth)
      }
    }, style)

    const { opacity, onlyHideText } = defaultStyle

    // 更新 path
    const keyShape = item.getKeyShape();

    const points = Util.getLoopCfgs(cfg)
    const { startPoint, controlPoints, endPoint } = points
    keyShape.attr({
      path: [
        ['M', startPoint.x, startPoint.y],
        ['C', controlPoints[0].x, controlPoints[0].y, controlPoints[1].x, controlPoints[1].y, endPoint.x, endPoint.y]
      ],
      ...defaultStyle
    });

    const labelCfg = cfg.labelCfg || {}
    const labelStyle = this.getLabelStyle(cfg, labelCfg, group);

    const text = group.findByClassName('edge-label');
    if(text) {
      text.resetMatrix()
      text.attr({
        ...labelStyle,
        fillOpacity: onlyHideText ? 0 : opacity === 0 ? opacity : 1
      });
    }
  }
};

const config = _.merge({}, simpleShape, defaultConf)

G6.registerEdge('self-loop-edge', config, 'loop');
