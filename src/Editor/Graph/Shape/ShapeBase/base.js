import G6 from '@antv/g6'
import _ from 'lodash'

const { Global, Util } = G6
const CLS_SHAPE = 'edge-shape';

// start,end 倒置，center 不变
function revertAlign(labelPosition) {
  let textAlign = labelPosition;
  if (labelPosition === 'start') {
    textAlign = 'end';
  } else if (labelPosition === 'end') {
    textAlign = 'start';
  }
  return textAlign;
}

const BaseShape = {
  style: {},
  itemType: '', // node, edge, group, anchor 等
  /**
  * 获取图形的配置项
  * @internal 仅在定义这一类节点使用，用户创建和更新节点
  * @param  {Object} cfg 节点的配置项
  * @return {Object} 图形的配置项
  */
  getShapeStyle(cfg) {
    return cfg.style;
  },

  getItemType() {
    if (!this.itemType) {
      console.warn(this, '没有设置itemType属性');
    }
    return this.itemType;
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
    // calculateStyle.text = cfg.label;
    const attrName = this.itemType + 'Label';
    // 取 nodeLabel，edgeLabel 的配置项
    const defaultStyle = Global[attrName] ? Global[attrName].style : null;
    const labelStyle = _.merge({}, defaultStyle, calculateStyle, labelCfg.style);
    return labelStyle;
  },

  getLabelStyleByPosition(cfg, labelCfg, group) {
    const labelPosition = labelCfg.position || this.labelPosition; // 文本的位置用户可以传入
    const style = {};
    const pathShape = group.findByClassName(CLS_SHAPE);
    // 不对 pathShape 进行判空，如果线不存在，说明有问题了
    let pointPercent;
    if (labelPosition === 'start') {
      pointPercent = 0;
    } else if (labelPosition === 'end') {
      pointPercent = 1;
    } else {
      pointPercent = 0.5;
    }
    const { refX, refY } = labelCfg; // 默认的偏移量
    // 如果两个节点重叠，线就变成了一个点，这时候label的位置，就是这个点 + 绝对偏移
    if (cfg.startPoint.x === cfg.endPoint.x && cfg.startPoint.y === cfg.endPoint.y) {
      style.x = cfg.startPoint.x + refX ? refX : 0;
      style.y = cfg.endPoint.y + refY ? refY : 0;
      return style;
    }
    const autoRotate = Util.isNil(labelCfg.autoRotate) ? this.labelAutoRotate : labelCfg.autoRotate;
    const offsetStyle = Util.getLabelPosition(pathShape, pointPercent, refX, refY, autoRotate);
    style.x = offsetStyle.x;
    style.y = offsetStyle.y;
    style.rotate = offsetStyle.rotate;
    style.textAlign = this._getTextAlign(labelPosition, offsetStyle.angle);
    return style;
  },

  // 获取文本对齐方式
  _getTextAlign(labelPosition, angle) {
    let textAlign = 'center';
    if (!angle) {
      return labelPosition;
    }
    angle = angle % (Math.PI * 2); // 取模
    if (labelPosition !== 'center') {
      if ((angle >= 0 && angle <= Math.PI / 2) || (angle >= 3 / 2 * Math.PI && angle < 2 * Math.PI)) {
        textAlign = labelPosition;
      } else {
        textAlign = revertAlign(labelPosition);
      }
    }
    return textAlign;
  },

  /**
    * 获取shape
    * @override
    * @param  {G6.Item} item 节点
    */
  getShape(item) {
    const group = item.getContainer();
    const shapeClassName = `${this.itemType}-shape`;
    const keyShape = group.findByClassName(shapeClassName);
    return keyShape || group;
  },

	/**
	 * 更新节点，包含文本
	 * @override
	 * @param  {Object} cfg 节点/边的配置项
	 * @param  {G6.Item} item 节点/边
	 */
  update(cfg, item) {
    console.warn('没有定义update逻辑', cfg)
  },

  /**
     * 解析stateKey 'node@select' => 'select'
     * @override
     * @param  {Object} name 节点/边的配置项
     * @param  {G6.Item} item 节点/边
  */
  getStateKey(name, item) {
    if (!name) {
      debugger
    }
    const [type, stateKey] = name.split('@')
    return stateKey
  },

  /**
   * 根据当前state获取style   
   * @override
   * @param  {Object} name 节点/边的配置项
   * @param  {G6.Item} item 节点/边
  */
  getStateStyle(name, value, item) {
    let style;
    if (value) {
      const key = this.getStateKey(name)
      style = this.style[key]
      return style
    } else {
      const states = item.getStates();
      style = _.cloneDeep(_.get(this.style, 'default', {}))
      states.forEach(state => {
        const key = this.getStateKey(state)
        _.merge(style, this.style[key])
      })
    }

    return style || {}
  },

	/**
	 * 设置节点的状态，主要是交互状态，业务状态请在 draw 方法中实现
	 * 单图形的节点仅考虑 selected、active 状态，有其他状态需求的用户自己复写这个方法
	 * @override
	 * @param  {String} name 状态名称
	 * @param  {Object} value 状态值
	 * @param  {G6.Item} item 节点
	 */
  setState(name, value, item) {

    const keyShape = item.get('keyShape');

    if (!keyShape) {
      return;
    }

    const styles = this.getStateStyle(name, value, item) || {};
    const { isGroup, ...shapeMap } = styles || {}

    if (isGroup) {
      _.each((shapeMap || {}), (style, subShapeKey) => {
        // isGroup 且 style是对象时, 才当做subShape来处理
        if (_.isObject(style)) {
          const subShape = keyShape.get(subShapeKey);
          if (subShape) {
            subShape.attr(style)
          } else {
            console.warn('shapeStyleMap:', shapeMap)
            console.warn(subShapeKey, 'is not exist in', keyShape)
          }
        } else {
          // 
          keyShape.attr({ [subShapeKey]: style });
        }
      })
    } else {
      keyShape.attr(styles);
    }

    const cfg = item.get('model')
    const group = item.get('group');
    this.afterSetState(cfg, group, item)
    const CLS_LABEL_SUFFIX = '-label';

    const labelClassName = this.itemType + CLS_LABEL_SUFFIX;
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
        const labelCfg = styles.labelCfg || {};
        const labelStyle = this.getLabelStyle(cfg, labelCfg, group);
        /**
         * fixme g中shape的rotate是角度累加的，不是label的rotate想要的角度
         * 由于现在label只有rotate操作，所以在更新label的时候如果style中有rotate就重置一下变换
         * 后续会基于g的Text复写一个Label出来处理这一类问题
         */
        label.resetMatrix();
        label.attr({
          ...labelStyle,
          ...cfg.style,
          // 修改节点颜色时不修改label的颜色
          fill: labelStyle.fill,
          stroke: labelCfg.stroke
        });
      }
    }
  },

  afterSetState(cfg, group, item) {

  },

  //anchor 改变位置
  updatePosition(cfg, keyShape) {
    const shapeStyle = this.getShapeStyle(cfg);
    keyShape.attr(shapeStyle)
  }
};

export default BaseShape;

