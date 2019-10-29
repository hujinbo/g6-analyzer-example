/*
 * @Author: moyee
 * @Date: 2019-08-06 20:58:02
 * @LastEditors: moyee
 * @LastEditTime: 2019-08-16 14:22:05
 * @Description: file content
 */
import _ from 'lodash'
import G6 from '@antv/g6'
import simpleShape from '../ShapeBase/edge'
import { generateArrow } from '../../../common/arrow'
import { edgeTypeColorMap,
  maxLineWidth, minLineWidth, aggNumber } from '@/constant'

// 边的显示逻辑：不同类型的边使用不同的颜色标识，聚合的边使用宽度表示
// 聚合的边：宽度从1-N，聚合的边越多，边的宽度越大

const defaultConf = {
  style: {
    default: {
      lineAppendWidth: 5,
      lineDash: [0, 0],
      lineDashOffset: 0,
      endArrow: true,
      opacity: 1,
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
      lineWidth: 2,
      cursor: 'pointer',
      opacity: 1
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
        fill: '#595959'
      },
      className: 'edge-label',
    })

    text.set('capture', false)
    return text
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
    const path = [
      ['M', x1, y1],
      ['L', x2, y2]
    ]

    const defaultStyle =  this.getStateStyle('edge@default', true, item)

    const style = _.merge(
      {}, { path }, defaultStyle
    );
    
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
    // 根据两个节点之间边的数量，计算聚合后边的宽度
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
        path: generateArrow(style.lineWidth || arrowWidth),
        // d: 20
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
  update(cfg, item) {
    const { data, style, labelCfg = {} } = cfg
    const group = item.getContainer()
    const model = data || cfg

    let aggEdgeWidth = minLineWidth
    if(data) {
      const { aggEdges } = data
      aggEdgeWidth = aggEdges && aggEdges.length
    }

    let arrowWidth = 1
    if (aggEdgeWidth > aggNumber) {
      aggEdgeWidth = maxLineWidth
      arrowWidth = maxLineWidth
    } else {
      aggEdgeWidth = minLineWidth
      arrowWidth = minLineWidth * 3
    }

    const defaultStyle = _.merge({}, this.style.default, {
      lineWidth: aggEdgeWidth,
      stroke: edgeTypeColorMap[model.edgeType] && edgeTypeColorMap[model.edgeType][0],
      endArrow: {
        path: generateArrow(arrowWidth),
        // d: 20
      }
    }, style)

    const { opacity, onlyHideText } = defaultStyle
    
    // 更新 path
    const keyShape = item.getKeyShape();
    keyShape.attr({
      path: [
        ['M', cfg.startPoint.x, cfg.startPoint.y],
        ['L', cfg.endPoint.x, cfg.endPoint.y]
      ],
      ...defaultStyle
    });
    
    const labelStyle = this.getLabelStyle(cfg, labelCfg, group);

    const text = group.findByClassName('edge-label');
    if(text) {
      text.resetMatrix();
      text.attr({
        ...labelStyle,
        fillOpacity: onlyHideText ? 0 : opacity === 0 ? opacity : 1,
        lineWidth: 0,
        strokeWidth: 0,
        fill: '#595959'
      });
    }
  }
};

const config = _.merge({}, simpleShape, defaultConf)

G6.registerEdge('edge-width-rect', config);