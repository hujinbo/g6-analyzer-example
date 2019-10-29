import React, { Component } from 'react'

import { Tooltip } from 'antd'
import { view } from 'react-easy-state'
import ReactDOM from 'react-dom'

import InstanceManager from '../../InstanceManager';
import style from './index.less'

let tooltipDomNode



const initDomContainer = () => {
  if (tooltipDomNode) {
    return tooltipDomNode
  }

  tooltipDomNode = document.querySelector('#g6-editor-tooltip');

  if (tooltipDomNode) {
    return tooltipDomNode
  }

  tooltipDomNode = document.createElement('div');
  tooltipDomNode.setAttribute('id', 'g6-editor-tooltip')
  document.body.appendChild(tooltipDomNode);
  tooltipDomNode.style.position = 'absolute';
  tooltipDomNode.style.zIndex = '10000';
  tooltipDomNode.style.left = '0px';
  tooltipDomNode.style.top = '0px';
  return tooltipDomNode
}

initDomContainer()

class EditorTooltip extends Component {
  constructor(props) {
    super(props);
    const { id } = props;
    this.model = InstanceManager.getModel(id, 'tooltip')
    this.actions = InstanceManager.getActions(id)
  }



  render() {
    const { visible, x, y, text, placement } = this.model
    const position = { left: `${x}px`, top: `${y}px`, }


    return ReactDOM.createPortal(
      (<Tooltip title={text} placement={placement} visible={visible && !!text} >
        <div style={position} className={style.hook}></div>
      </Tooltip>),
      tooltipDomNode,
    );
  }
}

export default view(EditorTooltip)
