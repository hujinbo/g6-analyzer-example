/*
 * @Author: moyee
 * @Date: 2019-05-30 20:14:07
 * @LastEditors: moyee
 * @LastEditTime: 2019-08-16 17:21:14
 * @Description: 输入两个节点，预判关系
 */
import React, { Component } from 'react'
import { Modal, Row, Col, Select, Input } from 'antd'
import Editor from '@antv/g6-editor'
const { Option } = Select
const { InstanceManager } = Editor
const InputGroup = Input.Group

export default class Predict extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dstId: '',
      srcId: '',
      srcType: 'customId',
      dstType: 'customId'
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

  handleOk = () => {
    const { id } = this.props
    const { dstId, srcId, srcType, dstType } = this.state
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
    
    this.actions.queryNodeShorestPath(srcId, dstId, srcType, dstType, graph)
  }

  handleCancel = () => {
    this.setState({
      dstId: '',
      srcId: '',
      srcType: 'customId',
      dstType: 'customId'
    })
    this.actions.hiddenPredict()
  }

  render() {
    const { visible } = this.props
    const { srcType, dstType } = this.state
    return (
      <Modal
        title="新增关系预判"
        visible={visible}
        width={400}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Row style={{ marginBottom: 25}}>
          <Col span={4} style={{fontWeight: 'bolder'}}>起始点：</Col>
          <Col span={20}>
            <InputGroup compact>
              <Select value={srcType}
                onChange={this.handleSrcType}>
                <Option value="customId">部门名称</Option>
                <Option value="cardId">个人姓名</Option>
              </Select>
              <Input placeholder='请输入起始点ID' 
                onChange={this.handleSourceChange}
                style={{ width: 200 }} />
            </InputGroup>
          </Col>
        </Row>
        <Row>
          <Col span={4} style={{fontWeight: 'bolder'}}>目标点：</Col>
          <Col span={20}>
            <InputGroup compact>
              <Select value={dstType}
                onChange={this.handleDstType}>
                <Option value="customId">部门名称</Option>
                <Option value="cardId">个人姓名</Option>
              </Select>
              <Input placeholder='请输入目标点ID' 
                onChange={this.handleChange}
                style={{ width: 200 }} />
            </InputGroup>
          </Col>
        </Row>
      </Modal>
    )
  }
}