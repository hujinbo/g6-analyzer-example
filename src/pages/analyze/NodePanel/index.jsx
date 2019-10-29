/*
 * @Author: moyee
 * @Date: 2019-01-30 14:44:13
 * @LastEditors: moyee
 * @LastEditTime: 2019-05-21 20:45:41
 * @Description: Pai业务场景下的侧边栏组件容器
 */
import React, { Component } from 'react';
import { NodePanel, NodeItem } from '@antv/g6-editor/Components'

import Nodes from './Nodes/item'
import Pipelines from './Pipelines'
import style from './index.less'

import SplitPane from 'react-split-pane'

import AntvEditor from '@antv/g6-editor'
const { InstanceManager } = AntvEditor

class NodePanelContainer extends Component {

  state = {
    size: 'calc(60vh)',
    isOpen: false,
  }

  constructor(props) {
    super(props)
    const { id } = props;
    const model = InstanceManager.getModel(id, 'nodeItem')
    console.log('model', model)
    this.model = model
  }


  componentDidMount = () => {

    const maxSize = this.domNode ? this.domNode.splitPane.clientHeight - 76 : undefined
    this.setState({
      maxSize
    })
  }


  render() {
    const { items } = this.model
    return (
      <div className={style.panel}>
        <NodePanel>
          {
            items.map(item =>
              <NodeItem node={item}>
                <Nodes node={item} />
              </NodeItem>)
          }

        </NodePanel>
        {/* <SplitPane
          minSize={160}
          maxSize={maxSize}
          size={panel1Size}
          split="horizontal"
          className={style.canvas}
          onChange={this.onPanelSizeChange}
          ref={(ref) => { this.domNode = ref }}
        >


          <div className={style.pipeline}>
            <Pipelines />
          </div>

          <div className={style.nodes}>
            <Nodes id={id} />
          </div>


        </SplitPane> */}
      </div>
    );
  }
}

export default NodePanelContainer


