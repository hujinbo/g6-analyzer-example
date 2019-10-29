import React, { Component } from 'react';
import { Drawer, Icon } from 'antd';
import Editor from '@antv/g6-editor';
import NodeDetail from './nodeDetail'
import EdgeDetail from './edgeDetail'
import LabelList from '../component/LabelList'
import style from './index.less'

const { InstanceManager, view } = Editor
class NodeConfigPanel extends Component {
  constructor(props) {
    super(props)
    this.model = InstanceManager.getModel(props.id, 'graphStore')
    this.actions = InstanceManager.getActions(props.id, 'graphStore')
  }

  handleChangeName() {
    const editor = InstanceManager.getEditor(666)
    const currentGroup = editor.getNodegroup()
    const customGroup = currentGroup.customGroup
    const graph = editor.getGraph()
    console.log(graph.save())
    // for(let id in customGroup) {
    //   console.log(id)
    //   currentGroup.updateGroupName(id, '自定义')
    // }
  }

  onClose = () => {
    const { id } = this.props
    const editor = InstanceManager.getEditor(id)
    const graph = editor.getGraph()
    const currentModel = graph.getCurrentMode()
    if(currentModel !== 'default') {
      graph.setMode('default')
    }
    this.actions.hide()
  }

  onCloseEdgeDetail = () => {
    this.model.visibleEdgeDetail = false
  }

  showDetailInfo = (item) => {
    const { srcId, dstId, edgeType, timestamp } = item
    this.actions.clickEdgeQueryDetail({ srcId, dstId, edgeType, timestamp })
    this.model.visibleEdgeDetail = true
  }

  render() {
    const type = this.model.type
    const { id }= this.props
    const { currentEdges, currentModel, visibleDetail, visibleEdgeDetail } = this.model

    console.log('currentEdges', visibleDetail, visibleEdgeDetail)
    // const translateX = visibleDetail && !visibleEdgeDetail
    // const translateStyle = {
    //   translateX: translateX ? 'translateX(0px)' : 'translateX(-180px)'
    // }
    return (
      <div>
        <Drawer
          title={type === 'node' ? `节点${currentModel.label}详情` : `边的详情`}
          placement="right"
          width='425'
          closable={true}
          mask={false}
          onClose={this.onClose}
          visible={visibleDetail}
          className={style.detailContainer}
        >
          {/** 如果有多条聚合边，则在抽屉中显示边 */}
          {
            currentEdges.length > 0
            ?
              <div className={style.labelList}>
                <LabelList labelList={currentEdges}
                  showDetailInfo={this.showDetailInfo} />
              </div>
            :
            (
              type === 'node'
                ? 
                <NodeDetail id={id} detail={currentModel} />
                :
                <EdgeDetail id={id} detail={currentModel} />
            )
          }
          <Drawer
            title='属性详情'
            visible={visibleEdgeDetail}
            width='425'
            closable={true}
            mask={false}
            onClose={this.onCloseEdgeDetail}
            className={style.detailContainer}>
            <EdgeDetail id={id} detail={currentModel} />
          </Drawer>
        </Drawer>
      </div>
      
    );
  }
}

export default view(NodeConfigPanel)