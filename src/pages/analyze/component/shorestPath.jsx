/*
 * @Author: moyee
 * @Date: 2019-05-30 20:14:07
 * @LastEditors: moyee
 * @LastEditTime: 2019-05-31 11:24:51
 * @Description: 最短路径组件
 */
import React, { Component } from 'react'
import { Modal, Row, Col, Select, message } from 'antd'
import Editor from '@antv/g6-editor'
import BaseGraph from '../baseGraph'
const { Option } = Select
const { InstanceManager } = Editor

export default class ShorestPath extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: ''
    }
    this.actions = InstanceManager.getActions(props.id, 'graphStore')
    this.model = InstanceManager.getModel(props.id, 'graphStore')
  }

  /**
   * 选择目标节点
   *
   * @param {string} value 目标节点值
   * @memberof ShorestPath
   */
  handleChange = (value) => {
    this.setState({
      value
    })
  }

  handleOk = () => {
    const { graphData, shorest } = this.model
    const { sourceNode } = shorest
    const { id } = this.props
    const { value } = this.state
    const baseGraph = new BaseGraph(graphData)
    const path = baseGraph.shortestDis(sourceNode.id, value)
    if(!path) {
      // 不存在最短路径
      message.warning(`不存在从${sourceNode.id}->${value}的最短路径`)
      return false
    }
    // 调用actions中处理最短路径的方法
    const editor = InstanceManager.getEditor(id)
    const graph = editor.getGraph()
    this.actions.queryShorest(graph, path)
  }

  handleCancel = () => {
    this.actions.hideShorest()
  }

  render() {
    const { visible } = this.props
    const { shorest, graphData } = this.model
    const { sourceNode } = shorest
    if(!sourceNode) {
      return null
    }
    const { id, label } = sourceNode

    // 获取所有节点的ID
    const { nodes } = graphData
    return (
      <Modal
        title="最短路径"
        visible={visible}
        width={400}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Row style={{ marginBottom: 25}}>
          <Col span={4} style={{fontWeight: 'bolder'}}>起始点：</Col>
          <Col span={20}>{`${id} / ${label}`}</Col>
        </Row>
        <Row>
          <Col span={4} style={{fontWeight: 'bolder'}}>目标点：</Col>
          <Col span={20}>
            <Select
              showSearch
              style={{ width: 200 }}
              placeholder="Select a person"
              optionFilterProp="children"
              onChange={this.handleChange}
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {
                nodes.map(node => (
                  <Option value={node.id}>{node.label}</Option>
                ))
              }
            </Select>
          </Col>
        </Row>
      </Modal>
    )
  }
}