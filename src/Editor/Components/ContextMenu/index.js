
import React, { Component } from 'react'

import { view } from 'react-easy-state'
import ReactDOM from 'react-dom'
import { stopEvent } from '../../common/utils'
import InstanceManager from '../../InstanceManager';
import style from './index.less'
import Menu from './Menu';

import { each } from 'lodash';

let contextMenuDomNode

const initDomContainer = () => {
  if (contextMenuDomNode) {
    return contextMenuDomNode
  }

  contextMenuDomNode = document.querySelector('#g6-editor-contextmenu');

  if (contextMenuDomNode) {
    return contextMenuDomNode
  }

  contextMenuDomNode = document.createElement('div');
  contextMenuDomNode.setAttribute('id', 'g6-editor-contextmenu')
  contextMenuDomNode.setAttribute('class', 'g6-editor-contextmenu')
  contextMenuDomNode.setAttribute('tabindex', 0)
  document.body.appendChild(contextMenuDomNode);
  contextMenuDomNode.oncontextmenu = (e) => {
    return false
  }
  return contextMenuDomNode
}

class EditorContextMenu extends Component {

  constructor(props) {
    super(props);
    const { id } = props;
    initDomContainer()
    this.model = InstanceManager.getModel(id, 'contextMenu')
    this.actions = InstanceManager.getActions(id, 'contextMenu')
    this.contextMenuDomNode = contextMenuDomNode
  }


  hide = (evt) => {
    stopEvent(evt)
    this.actions.hide()
    return false
  }


  render() {

    const { visible, x, y, nodeMenuItems, nodeModel } = this.model
    const { id } = this.props
    const position = { top: `${x}px`, left: `${y}px` }

    if (visible) {
      return ReactDOM.createPortal(
        (<div className={style.mask} onClick={this.hide}>
          <div style={position} className={style.hook}>
            <Menu
              items={nodeMenuItems}
              actions={this.actions}
              target={nodeModel}
              instanceId={id}
            />
          </div>
        </div>),
        contextMenuDomNode
      );
    }

    return null

  }
}

export default view(EditorContextMenu)