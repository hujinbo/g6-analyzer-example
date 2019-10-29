import React, { Component } from 'react'

class NodeConfPanel extends Component {

  render() {
    const { children } = this.props
    
    return (
      <div>{children}</div>
    )
  }
}

export default NodeConfPanel
