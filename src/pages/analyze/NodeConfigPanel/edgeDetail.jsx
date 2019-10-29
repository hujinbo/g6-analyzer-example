/*
 * @Author: moyee
 * @Date: 2019-05-28 10:14:23
 * @LastEditors: moyee
 * @LastEditTime: 2019-08-14 19:31:15
 * @Description: 边的详情组件
 */

import React, { Component } from 'react'
import { Row, Col, Collapse, Table, message } from 'antd';
import { isString, omit } from 'lodash'
import Editor from '@antv/g6-editor';
import { edgePropertiesMapping } from '@/constant/edgePropertiesMapping'
import styles from './index.less'
const { Panel } = Collapse

const { InstanceManager } = Editor

const edgeColorStyle = [
  '#69c0ff', '#85a5ff', '#5cdbd3', '#ff9c6e', '#ffc069', '#95de64', '#ff7875', '#b37feb'
]

const edgeWidth = [3, 5, 7, 9, 12]

class EdgeDetail extends Component {
  constructor(props) {
    super(props)
    this.actions = InstanceManager.getActions(props.id, 'graphStore')
    this.model = InstanceManager.getModel(props.id, 'graphStore')
  }

  /**
   * 修改边的颜色
   * @param {string} color 颜色值
   * @memberof EdgeDetail
   */
  handleChangeColor = (color) => {
    const { id } = this.props
    const { currentItem } = this.model
    const editor = InstanceManager.getEditor(id)
    const graph = editor.getGraph()
    const model = currentItem.getModel()

    debugger
    graph.updateItem(currentItem, {
      style: {
        ...model.style,
        stroke: color
      }
    })
  }

  /**
   * 修改边的宽度
   * @param {number} size 边的宽度值
   *
   * @memberof EdgeDetail
   */
  handleChangeWidth = (size) => {
    const { id } = this.props
    const { currentItem } = this.model
    const editor = InstanceManager.getEditor(id)
    const graph = editor.getGraph()
    
    const model = currentItem.getModel()

    graph.updateItem(currentItem, {
      style: {
        ...model.style,
        lineWidth: size
      }
    })
  }

  render() {
    const { detail } = this.props

    if(!detail) {
      return null
    }
    
    const { data } = detail
    
    if(!data) {
      // 如果不存在data属性，则说明是新添加的关系，点击后进行编辑
      message.warn('暂无详细信息')
      return false
    }
    const baseInfo = omit(data, ['properties', 'source', 'target', 'edgeType'])
    const propertyData = []
    let count = 1;
    for(let key in baseInfo) {
      const value = baseInfo[key]
      if(!isString(value)) {
        continue
      }
      // 根据详情生成数据
      propertyData.push({
        property: edgePropertiesMapping[key],
        value
      })
    }

    const { properties } = data
    for(let key in properties) {
      const value = properties[key]
      if(!isString(value)) {
        continue
      }
      // 根据详情生成数据
      propertyData.push({
        property: `字段${count++}`,//edgePropertiesMapping[key],
        value
      })
    }
    const columns = [
      {
        title: '属性',
        dataIndex: 'property'
      },
      {
        title: '值',
        dataIndex: 'value'
      }
    ];
    console.log(detail)

    return (
      <Collapse defaultActiveKey={['1']}>
        <Panel header='属性' key='1'>
          <Table 
            columns={columns} 
            dataSource={propertyData}
            pagination={false} />
        </Panel>
        <Panel header='自定义样式' key='2'>
          <Row>
            <Col span={24}>
              <p>边的颜色</p>
            </Col>
            <Col span={24}>
              {
                edgeColorStyle.map(color => 
                  <span 
                    onClick={() => this.handleChangeColor(color)}
                    style={{background: color}}
                    className={styles.nodeColor}></span>)
              }
            </Col>
          </Row>
          <Row>
            <Col span={24} style={{marginTop: 25}}>
              <p>边宽度</p>
            </Col>
            <Col span={24}>
              {
                edgeWidth.map(size => 
                  <span 
                    style={{ height: size }}
                    onClick={() => this.handleChangeWidth(size)}
                    className={styles.edgeWidth}></span>)
              }
            </Col>
          </Row>
        </Panel>
      </Collapse>
    )
  }
}

export default EdgeDetail