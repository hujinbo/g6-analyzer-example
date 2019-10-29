/*
 * @Author: moyee
 * @Date: 2019-05-28 10:14:23
 * @LastEditors: moyee
 * @LastEditTime: 2019-08-16 13:41:32
 * @Description: 节点的详情组件
 */

import React, { Component } from 'react'
import { Row, Col, Collapse, Table } from 'antd';
import { isString } from 'lodash'
import Editor from '@antv/g6-editor';
import { nodePropertiesMapping } from '@/constant/nodePropertiesMapping'
import { nodeZHMap } from '@/constant'
import styles from './index.less'
const { Panel } = Collapse

const { InstanceManager } = Editor

// 节点与颜色的映射关系
const nodeColorMapStyle = [
  {
    key: 'batchInferenceJob',
    value: '#69c0ff',
    colors: ['#69c0ff', '#40a9ff', '#bae7ff']
  },
  {
    key: 'a',
    value: '#85a5ff',
    colors: ['#85a5ff', '#597ef7', '#d6e4ff']
  },
  {
    key: 'odpsCmd',
    value: '#5cdbd3',
    colors: ['#5cdbd3', '#36cfc9', '#b5f5ec']
  },
  {
    key: 'tensorflow',
    value: '#ff9c6e',
    colors: ['#ff9c6e', '#ff7a45', '#ffd8bf']
  },
  {
    key: 'b',
    value: '#ffc069',
    colors: ['#ffc069', '#ffa940', '#ffe7ba']
  },
  {
    key: 'c',
    value: '#95de64',
    colors: ['#95de64', '#73d13d', '#d9f7be']
  },
  {
    key: 'd',
    value: '#ff7875',
    colors: ['#ff7875', '#ff4d4f', '#ffccc7']
  },
  {
    key: 'e',
    value: '#b37feb',
    colors: ['#b37feb', '#9254de', '#efdbff']
  }
]
const nodeSize = [
  {
    key: 'small',
    value: 10,
    fontSize: 8
  },
  {
    key: 'normal',
    value: 20,
    fontSize: 12
  },
  {
    key: 'large',
    value: 30,
    fontSize: 18
  }
]

class NodeDetail extends Component {
  constructor(props) {
    super(props)
    this.actions = InstanceManager.getActions(props.id, 'graphStore')
    this.model = InstanceManager.getModel(props.id, 'graphStore')
  }

  /**
   * 修改节点颜色
   * @param { Object } item 颜色对象
   *
   * @memberof NodeDetail
   */
  handleChangeColor = (item) => {
    const { id } = this.props
    const { currentItem } = this.model
    const editor = InstanceManager.getEditor(id)
    const graph = editor.getGraph()
    const model = graph.findById(currentItem).getModel()
    graph.updateItem(currentItem, {
      colors: item.colors,
      style: {
        ...model.style,
        fill: item.value
      },
      // 更新文本
    })
  }

  handleChangeSize = (item) => {
    const { id } = this.props
    const { currentItem } = this.model
    const editor = InstanceManager.getEditor(id)
    const graph = editor.getGraph()
    const model = graph.findById(currentItem).getModel()
    
    graph.updateItem(currentItem, {
      style: {
        ...model.style,
        r: item.value,
        fontSize: item.fontSize
      }
    })
  }

  render() {
    const { detail } = this.props
    
    if(!detail) {
      return null
    }
    
    const { data } = detail
    // 默认将ID及NodeType添加进去
    const propertyData = [
      {
        property: 'id',
        value: data.id
      },
      {
        property: '节点类型',
        value: nodeZHMap[data.nodeType]
      }
    ]
 
    const { properties } = data
    let count = 1;
    for(const key in properties) {
      const value = properties[key]
      if(!isString(value)) {
        continue
      }
      // 根据详情生成数据
      propertyData.push({
        property: `字段${count++}`,//nodePropertiesMapping[key],
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
console.log(properties)
    return (
      <Collapse defaultActiveKey={['1']}>
        <Panel header='属性' key='1'>
          <Table 
            columns={columns} 
            dataSource={propertyData}
            pagination={false}
          />
        </Panel>
        <Panel header='自定义样式' key='2'>
          <Row>
            <Col span={24}>
              <p>节点颜色</p>
            </Col>
            <Col span={24}>
              {
                nodeColorMapStyle.map(item => 
                  <span 
                    onClick={() => this.handleChangeColor(item)}
                    style={{background: item.value}}
                    className={styles.nodeColor}
                  >
                  </span>)
              }
            </Col>
          </Row>
          <Row>
            <Col span={24} style={{marginTop: 25}}>
              <p>节点大小</p>
            </Col>
            <Col span={24}>
              {
                nodeSize.map(item => 
                  <span 
                    style={{ width: item.value, height: item.value }}
                    onClick={() => this.handleChangeSize(item)}
                    className={styles.nodeSize}
                  >
                  </span>)
              }
            </Col>
          </Row>
        </Panel>
      </Collapse>
    )
  }
}

export default NodeDetail