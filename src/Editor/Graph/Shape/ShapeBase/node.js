import G6 from '@antv/g6'
import _ from 'lodash'

import ShapeBase from './base';

const { Global } = G6

const NodeShape = {
  style: {},
  itemType: 'node', // node, edge, group, anchor 等


  /**
  * 获取图形的配置项
  * @internal 仅在定义这一类节点使用，用户创建和更新节点
  * @param  {Object} cfg 节点的配置项
  * @return {Object} 图形的配置项
  */
  getShapeStyle(cfg) {
    return cfg.style;
  },


  /**
 * 绘制节点/边，包含文本
 * @override
 * @param  {Object} cfg 节点的配置项
 * @param  {G.Group} group 节点的容器
 * @return {G.Shape} 绘制的图形
 */
  draw(cfg, group) {
    const shape = this.drawShape(cfg, group);
    shape.set('className', `${this.itemType}-shape`);
    if (cfg.label) {
      const label = this.drawLabel(cfg, group);
      label.set('className', `${this.itemType}-label`);
    }
    return shape;
  },

  drawShape(/* cfg, group */) {
    // 子类的渲染逻辑覆盖这个方法
  },

  drawLabel(cfg, group) {
    const labelCfg = cfg.labelCfg || {};
    const labelStyle = this.getLabelStyle(cfg, labelCfg, group);
    const label = group.addShape('text', {
      attrs: labelStyle
    });
    return label;
  },


  getLabelStyleByPosition(/* cfg, labelCfg, group */) {
    return {}
  },

  /**
   * 获取文本的配置项
   * @internal 用户创建和更新节点/边时，同时会更新文本
   * @param  {Object} cfg 节点的配置项
   * @param {Object} labelCfg 文本的配置项
   * @param {G.Group} group 父容器，label 的定位可能与图形相关
   * @return {Object} 图形的配置项
   */
  getLabelStyle(cfg, labelCfg, group) {
    const calculateStyle = this.getLabelStyleByPosition(cfg, labelCfg, group);
    calculateStyle.text = cfg.label;
    const attrName = this.itemType + 'Label';
    // 取 nodeLabel，edgeLabel 的配置项
    const defaultStyle = Global[attrName] ? Global[attrName].style : null;
    const labelStyle = _.merge({}, defaultStyle, calculateStyle, labelCfg.style);
    return labelStyle;
  },

	/**
	 * 更新节点，包含文本
	 * @override
	 * @param  {Object} cfg 节点/边的配置项
	 * @param  {G6.Item} item 节点/边
	 */
  update(cfg, item) {
    const group = item.getContainer();

    const shapeClassName = `${this.itemType}-shape`
    const shape = group.findByClassName(shapeClassName);
    const shapeStyle = this.getShapeStyle(cfg);
    shape.attr(shapeStyle);
    const labelClassName = `${this.itemType}-label`
    const label = group.findByClassName(labelClassName);
    // 此时需要考虑之前是否绘制了 label 的场景存在三种情况
    // 1. 更新时不需要 label，但是原先存在 label，此时需要删除
    // 2. 更新时需要 label, 但是原先不存在，创建节点
    // 3. 如果两者都存在，更新
    if (!cfg.label) {
      label && label.remove();
    } else {
      if (!label) {
        const newLabel = this.drawLabel(cfg, group);
        newLabel.set('className', labelClassName);
      } else {
        const labelCfg = cfg.labelCfg || {};
        const labelStyle = this.getLabelStyle(cfg, labelCfg, group);
        /**
         * fixme g中shape的rotate是角度累加的，不是label的rotate想要的角度
         * 由于现在label只有rotate操作，所以在更新label的时候如果style中有rotate就重置一下变换
         * 后续会基于g的Text复写一个Label出来处理这一类问题
         */
        label.resetMatrix();
        label.attr(labelStyle);
        label.toFront();
      }
    }
  },




};


const NodeBaseShape = _.merge({}, ShapeBase, NodeShape);

export default NodeBaseShape
