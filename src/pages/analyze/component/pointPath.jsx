/*
 * @Author: moyee
 * @Date: 2019-05-30 20:14:07
 * @LastEditors: moyee
 * @LastEditTime: 2019-08-17 19:54:53
 * @Description: 查找两个节点之间的路径组件
 */
import React, { Component } from 'react'
import { Modal, Row, Col, Select, Input } from 'antd'
import Editor from '@antv/g6-editor'
import styles from './index.less'
const { Option } = Select
const { InstanceManager } = Editor
const InputGroup = Input.Group

export default class ShorestPath extends Component {
  constructor(props) {
    super(props)
    this.state = {
      nodeVisible: false,
      dstId: '',
      srcId: '',
      srcType: 'cardId',
      dstType: 'cardId'
    }
    this.actions = InstanceManager.getActions(props.id, 'graphStore')
    this.model = InstanceManager.getModel(props.id, 'graphStore')
  }

  /**
   * 选择起始节点
   *
   * @memberof ShorestPath
   */
  handleSourceChange = (evt) => {
    this.setState({
      srcId: evt.target.value
    })
  }

  /**
   * 选择目标节点
   *
   * @param {string} value 目标节点值
   * @memberof ShorestPath
   */
  handleChange = (evt) => {
    this.setState({
      dstId: evt.target.value
    })
  }

  handleSrcType = (value) => {
    this.setState({
      srcType: value
    })
  }

  handleDstType = (value) => {
    this.setState({
      dstType: value
    })
  }

  /**
   * 控制是否显示第二个节点
   *
   * @memberof ShorestPath
   */
  handleChangeVisible = () => {
    this.setState({
      nodeVisible: !this.state.nodeVisible,
      dstType: 'cardId',
      dstId: ''
    })
  }

  handleOk = () => {
    const { id } = this.props
    const { dstId, srcId, srcType, dstType, nodeVisible } = this.state
    // 调用actions中处理最短路径的方法
    const editor = InstanceManager.getEditor(id)
    const graph = editor.getGraph()
    const canvas = graph.get('canvas')
    const width = canvas.get('width')
    const height = canvas.get('height')

    graph.clearData()
    this.model.centerNode = null

    // 保存graph实例及Canvas宽度和高度，供后续关系扩展使用
    if(!this.model.graphCanvasWH) {
      this.model.graphCanvasWH = {
        graph,
        width,
        height
      }
    }
    
    let param = null
    // 查找两个节点所在的数据
    if(nodeVisible) {
      param = {
        first: srcId,
        second: dstId,
        firstType: srcType,
        secondType: dstType
      }
    } else {
      param = {
        first: srcId,
        firstType: srcType,
      }
    }
    
    this.actions.getCrycleByNode(param)
    // this.actions.queryNodeShorestPath(srcId, dstId, srcType, dstType, graph)
  }

  handleCancel = () => {
    this.actions.hiddenPointPath()
    this.setState({
      nodeVisible: false,
      dstId: '',
      srcId: '',
      srcType: 'cardId',
      dstType: 'cardId'
    })
  }

  render() {
    const { visible } = this.props
    const { nodeVisible, srcId, dstId, srcType, dstType } = this.state

    return (
      <Modal
        title="根据节点查找数据"
        visible={visible}
        width={400}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Row>
          <Col span={4} style={{fontWeight: 'bolder'}}>节点1：</Col>
          <Col span={20}>
            <InputGroup compact>
              <Select value={srcType}
                onChange={this.handleSrcType}>
                <Option value="customId">部门名称</Option>
                <Option value="cardId">个人姓名</Option>
              </Select>
              <Input placeholder='请输入起始点ID'
                value={srcId}
                onChange={this.handleSourceChange}
                style={{ width: 200 }} />
            </InputGroup>
          </Col>
        </Row>
        <Row 
          style={{ marginTop: 25, display: !nodeVisible ? 'none' : 'block'}}>
          <Col span={4} style={{fontWeight: 'bolder'}}>节点2：</Col>
          <Col span={20}>
            <InputGroup compact>
              <Select value={dstType}
                onChange={this.handleDstType}>
                <Option value="customId">部门名称</Option>
                <Option value="cardId">个人姓名</Option>
              </Select>
              <Input placeholder='请输入目标点ID' 
                value={dstId}
                onChange={this.handleChange}
                style={{ width: 200 }} />
            </InputGroup>
          </Col>
        </Row>
        <Row 
          className={styles.operateAddBtn}>
          <Col 
            span={24}
            onClick={this.handleChangeVisible}>
              {
                !nodeVisible ? <span>+</span> : <span>-</span>
              }
          </Col>
        </Row>
      </Modal>
    )
  }
}