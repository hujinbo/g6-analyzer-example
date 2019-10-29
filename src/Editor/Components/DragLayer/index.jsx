import React, { Component } from 'react';
import { DragLayer } from 'react-dnd';

const layerStyles = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 99999,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  cursor: 'grab',
};

@DragLayer(monitor => ({
  item: monitor.getItem(),
  itemType: monitor.getItemType(),
  initialOffset: monitor.getInitialSourceClientOffset(),
  currentOffset: monitor.getSourceClientOffset(),
  isDragging: monitor.isDragging(),
}))
class NodeDragLayer extends Component {
  getItemWrapStyle() {
    const { initialOffset, currentOffset } = this.props;
    if (!initialOffset || !currentOffset) {
      return {
        display: 'none',
      };
    }

    const { x, y } = currentOffset;
    const transform = `translate(${x}px, ${y}px)`;
    return {
      transform,
      cursor: 'grabbing',
      WebkitTransform: transform,
      display: 'inline-flex',
    };
  }

  render() {
    const { isDragging, item } = this.props;

    if (!isDragging) {
      return null;
    }

    return (
      <div data-role="drag-layer" style={layerStyles}>
        <div style={this.getItemWrapStyle()}>
          {
            React.Children.map(this.props.children, child => {
              return React.cloneElement(child, {
                ...item,
                isDragging
              })
            })}
        </div>
      </div>
    );
  }
}


export default NodeDragLayer