/*
 * @Author: moyee
 * @Date: 2019-06-14 10:47:00
 * @LastEditors: moyee
 * @LastEditTime: 2019-08-16 14:21:15
 * @Description: file content
 */
import G6 from '@antv/g6'
import { merge } from 'lodash'
import nodeBaseShape from '../ShapeBase/node'
import { nodeColorMap, defaultNodeColors } from '@/constant'

const nodeSizeMap = {
  small: 10,
  normal: 20,
  large: 30,
}

const conf = {
  itemType: 'node',
  style: {
    default: {
      cursor: 'pointer',
      opacity: 1,
      labelCfg: {
        style: {
          fillOpacity: 1
        }
      },
      text: {
        x: 0,
        y: 0,
        fontSize: 12,
        label: 'unknow',
        textAlign: 'center',
        fill: 'rgba(0, 0, 0, 0.65)'
      },
      shadowBlur: 0
    },
    select: {
      stroke: '#ff9c6e',
      strokeWidth: 10,
      opacity: 1,
      fillOpacity: 1
    },
    hover: {
      fill: '#40a9ff',
      opacity: 1,
      cursor: 'pointer',
      labelCfg: {
        style: {
          fillOpacity: 1
        }
      }
    },
    inactive: {
      opacity: 0.2,
      labelCfg: {
        style: {
          fillOpacity: 0.2
        }
      }
    }
  },
  /**
   * 绘制后的附加操作, 基于circle扩展
   * @param  {Object} cfg 节点的配置项
   * @param  {G.Group} group 节点的容器
   */
  drawShape(cfg = {}, group) {
    const nodeColors = nodeColorMap[cfg.nodeType] || defaultNodeColors
    const keyShape = group.addShape('circle', {
      attrs: {
        x: 0,
        y: 0,
        r: nodeSizeMap.normal,
        fill: nodeColors[0],
        opacity: this.style.default.opacity
      }
    })

    const bgCircle = group.addShape('circle', {
      attrs: {
        x: 0,
        y: 0,
        r: nodeSizeMap.normal + 4,
        fill: nodeColors[2]
      },
      className: 'bg-circle'
    })
    bgCircle.toBack()
    bgCircle.hide()

    return keyShape
  },
  /**
   * 绘制文本
   * @param {object} cfg 配置项
   * @param {G.Group} group 节点容器
   */
  drawLabel(cfg = {}, group) {
    const { style } = cfg
    const styles = merge({}, this.style.default, style)
    const { text, fillOpacity } = styles
    const { x, y, fontSize, textAlign, label, fill } = text

    const labelCfg = cfg.labelCfg || {}
    const labelStyle = this.getLabelStyle(cfg, labelCfg, group)
    const circleText = group.addShape('text', {
      attrs: {
        ...labelStyle,
        x,
        y,
        text: cfg.label || label,
        textAlign,
        fontSize,
        fill,
        // fillOpacity
      }
    })

    circleText.set('capture', false)
    return circleText
  },
  /**
   * 设置节点不同状态下的颜色
   * @param {string} name 状态名称
   * @param {boolean} value 状态值
   * @param {Item} item item实例
   */
  getStateStyle(name, value, item) {
    const key = this.getStateKey(name)
    const model = item.getModel()
    const group = item.getContainer()
    const bgCircle = group.findByClassName('bg-circle')
    if(bgCircle) {
      bgCircle.hide()
    }
    const { style, colors } = model

    const hoverStyle = merge({}, this.style.hover, style)
    const defaultStyle = merge({}, this.style.default, style)
    const nodeColors = nodeColorMap[model.nodeType] || defaultNodeColors

    if (key === 'hover' && value) {
      return {
        ...hoverStyle,
        fill: colors && colors[1] || nodeColors[1],
        r: style && style.r || nodeSizeMap.normal
      }
    } else if (key === 'select' && value) {
      bgCircle.show()
      // 如果颜色有变化，则需要更新颜色
      bgCircle.attr({
        fill: colors && colors[2] || nodeColors[2],
        r: style && style.r ? style.r + 4 : nodeSizeMap.normal + 4
      })
    } else if(key === 'inactive' && value) {
      return this.style.inactive
    } else {
      return {
        ...defaultStyle,
        fill: colors && colors[0] || nodeColors[0],
        r: style && style.r || nodeSizeMap.normal
      }
    }
  }
}

const config = merge({}, nodeBaseShape, conf)

G6.registerNode('circle-node', config)