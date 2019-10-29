/*
 * @Author: moyee
 * @Date: 2019-01-29 14:50:54
 * @LastEditors: moyee
 * @LastEditTime: 2019-02-18 17:17:43
 * @Description: 绘图核心区域
 */
import React, { Component } from 'react'
import { DropTarget } from 'react-dnd'

import ItemTypes from '../../constants'
import { stopEvent } from '@/common/utils';
import InstanceManager from '../../InstanceManager'
import refContext from '../G6Wrapper/Context'
import style from './index.less'


const canvasTarget = {
  drop(props, monitor, component) {
    const item = monitor.getItem();
    const offset = monitor.getClientOffset();
    const editor = InstanceManager.getEditor(props.id)
    const graph = InstanceManager.getGraph(props.id)

    return {
      ...item,
      ...offset,
      graph,
      editor,
    };
  },
};




class Canvas extends Component {

  componentDidMount() {
    const { setCanvasRef } = this.props;
    setCanvasRef(this.ref)
  }


  onContextMenu = (e) => {
    stopEvent(e);
    return false
  }


  render() {
    const { connectDropTarget, styles = {}, id } = this.props;
    const { className } = styles;
    return connectDropTarget(
      <div
        className={`${className} ${style.canvas} g6-editor-canvas `} style={styles}
        ref={(ref) => this.ref = ref}
        id={`pai-canvas-${id}`}
        tabIndex="0"
        onContextMenu={this.onContextMenu}
      />
    );
  }
}

const CanvasWithConetxt = (props) => (
  <refContext.Consumer>
    {({ setCanvasRef }) => <Canvas {...props} setCanvasRef={setCanvasRef} />}
  </refContext.Consumer>
)

export default DropTarget(
  ItemTypes.NODE,
  canvasTarget,
  (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
  }))(CanvasWithConetxt);
