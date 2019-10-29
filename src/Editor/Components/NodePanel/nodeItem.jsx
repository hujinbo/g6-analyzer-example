/*
 * @Author: moyee
 * @Date: 2019-01-26 15:50:43
 * @LastEditors: moyee
 * @LastEditTime: 2019-02-20 20:19:13
 * @Description: NodePanel侧边栏组件
 */

import React, { Component } from 'react'
import { DragSource } from 'react-dnd'
import { transPosition, _ } from '../../common/utils'
import { getEmptyImage } from 'react-dnd-html5-backend';
import ItemTypes from '../../constants'
import styles from './index.less'


const nodePanelSource = {
  canDrag(props) {
    // 默认都可以拖动，当 disabled=true时候，不允许拖动
    const { node, disabled } = props
    return !node.isFolder || disabled
  },

  isDragging(props, monitor) {
    // If your component gets unmounted while dragged
    // (like a card in Kanban board dragged between lists)
    // you can implement something like this to keep its
    // appearance dragged:
    return monitor.getItem().id === props.id;
  },

  beginDrag(props, monitor, component) {
    // Return the data describing the dragged item
    // const item = { id: props.id };
    // return item;
    const { type, node, ...rest } = props
    return {
      type, node, ...rest
    }
  },

  endDrag(props, monitor, component) {
    if (!monitor.didDrop()) {
      // You can check whether the drop was successful
      // or if the drag ended but nobody handled the drop
      // return;
    }

    // When dropped on a compatible target, do something.
    // Read the original dragged item from getItem():
    const item = monitor.getItem();

    // You may also read the drop result from the drop target
    // that handled the drop, if it returned an object from
    // its drop() method.
    const dropResult = monitor.getDropResult();

    if (dropResult) {
      console.log(`dropped ${item} into ${dropResult.name}`)
      const { x, y, node, graph, editor } = dropResult

      const realPosition = transPosition({ x, y }, graph)

      const options = _.merge({}, editor.generateNode(node), {
        x: realPosition.x,
        y: realPosition.y
      })

      graph.add('node', options)
      graph.paint()
    }

    // This is a good place to call some Flux action
    return false;
  }
}

/**
 * Specifies which props to inject into your component
 *
 * @param {*} connect
 * @param {*} monitor
 * @returns
 */
function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  }
}

class NodePanel extends Component {
  componentDidMount() {
    // const { preview } = this.props
    // if (preview && typeof preview === 'string') {
    //   const img = new Image();
    //   img.src = preview
    //   img.onload = () => this.props.connectDragPreview(img);
    // }

    this.props.connectDragPreview(getEmptyImage(), {
      captureDraggingState: true,
    });
  }



  render() {
    const { children, connectDragSource, connectDragPreview,
      backgroundColor, color, name, preview, isDragging } = this.props

    return connectDragPreview(
      <div style={{ ...preview, opacity: isDragging ? 0.5 : 1 }}>
        {
          connectDragSource(
            <div>
              {
                children ?
                  children :
                  (
                    <a
                      className={styles.defaultNodeStyle}
                      style={{
                        background: backgroundColor,
                        color: color
                      }}
                    >
                      {name}
                    </a>
                  )
              }
            </div>
          )
        }
      </div>
    )
  }
}

export default DragSource(
  ItemTypes.NODE, nodePanelSource, collect
)(NodePanel)
