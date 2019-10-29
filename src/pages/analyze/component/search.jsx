/*
 * @Author: moyee
 * @Date: 2019-05-29 13:42:43
 * @LastEditors: moyee
 * @LastEditTime: 2019-08-17 19:52:21
 * @Description: 分析页面搜索组件
 */
import React, { Component } from 'react'
import { Row, Col, Select, Input, Button, Spin } from 'antd'
import Editor from '@antv/g6-editor';
import styles from './index.less'

const { Option } = Select
const { InstanceManager } = Editor

class Search extends Component {
  constructor(props) {
    super(props)
    this.state = {
      type: 'cardId',
      value: '',
      loading: false
    }
    this.actions = InstanceManager.getActions(props.id, 'graphStore')
    this.model = InstanceManager.getModel(props.id, 'graphStore')
  }

  /**
   * 切换查询类型，支持关键词、Gremlin及GQL
   * @param {string} value 类型值
   *
   * @memberof Search
   */
  handleChange = (value) => {
    this.setState({
      type: value
    })
  }

  /**
   * 输入框值改变了后同步修改state中的值
   * @param {object} event事件句柄
   * @memberof Search
   */
  handleChangeValue = (evt) => {
    this.setState({
      value: evt.target.value
    })
  }

  searchData = () => {
    const { type, value } = this.state
    const { id } = this.props
    const graph = InstanceManager.getGraph(id)
    const canvas = graph.get('canvas')
    const width = canvas.get('width')
    const height = canvas.get('height')

    // 保存graph实例及Canvas宽度和高度，供后续关系扩展使用
    if(!this.model.graphCanvasWH) {
      this.model.graphCanvasWH = {
        graph,
        width,
        height
      }
    }
    this.setState({
      loading: true
    })

    const param = {
      id: value,
      type
    }
    this.actions.loadData(param)
  }

  render() {
    const { loading, type } = this.state
    const { shouldLoading } = this.model
    const showLoading = loading && shouldLoading
    console.log(shouldLoading, loading)
    return (
      <Row className={styles.search}>
        <Col span={2}>
          <Select 
            style={{ width: 115}} 
            size='large' 
            defaultValue={type}
            onChange={this.handleChange}
          >
            <Option value='cardId'>部门名称</Option>
            <Option value='customId'>个人姓名</Option>
          </Select>
        </Col>
        <Col span={20} style={{padding: '0 10px 0 15px', lineHeight: '40px'}}>
          <Input 
            size='large' 
            onChange={this.handleChangeValue}
          />
        </Col>
        <Col span={2}>
          <Button 
            type='primary' 
            size='large' 
            icon='search'
            onClick={this.searchData}
          >开始分析
          </Button>
        </Col>
        {showLoading && (
          <div className={styles.loading}>
            <Spin />
          </div>
        )}
      </Row>
    )
  }
}

export default Search
