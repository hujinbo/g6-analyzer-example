import React, { Component } from 'react'
import Item from './nodeItem'

export default class NodePanel extends Component {

  render() {
    const { children, className, style } = this.props
    return (
      <div className={className} style={style} >
        {
          children
        }
      </div>
    );
  }
}

export const NodeItem = Item