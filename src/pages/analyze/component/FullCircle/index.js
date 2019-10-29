import React, { Component } from 'react'
import { Drawer, Table, Pagination, Radio, Button } from 'antd'
import Editor from '@antv/g6-editor'
import styles from './index.less'

const RadioGroup = Radio.Group
const RadioButton = Radio.Button
const { InstanceManager } = Editor

export default class FullCircleList extends Component {
  constructor(props) {
    super(props)
    const { id } = props
    this.state = {
      type: '3'
    }
    this.actions = InstanceManager.getActions(id, 'graphStore')
    this.model = InstanceManager.getModel(id, 'graphStore')
  }
  /**
   * 分页查询数据列表
   * @param {number} page 当前页数
   *
   * @memberof FullCircleList
   */
  handlePageChange = (page) => {
    const param = {
      currentPage: page,
      pageSize: 10,
      cycleType: this.state.type
    }
    this.actions.queryCircleList(param)
  }

  handleChangeType = (evt) => {
    const value = evt.target.value
    this.setState({
      type: value
    })
    const param = {
      currentPage: 1,
      pageSize: 10,
      cycleType: value
    }
    this.actions.queryCircleList(param)
  }

  queryCrycleDetail = (item) => {
    const { id } = this.props
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

    const param = {
      id: item.id
    }
    this.actions.queryCrycleDetail(param)
  }

  render() {
    
    const { fullCircleList, close, visible, pagination } = this.props

    const columns = [
      {
        title: 'ID',
        dataIndex: 'id',
      },
      {
        title: '亲密度',
        dataIndex: 'score',
        render: (value) => value && value.toFixed(2)
      },
      {
        title: '关系总数',
        dataIndex: 'totalMoney',
      },
      {
        title: '节点数量',
        dataIndex: 'nodeCount',
      },
      {
        title: '操作',
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        render: (item) => <a href='#' onClick={() => this.queryCrycleDetail(item)}>查看</a>,
      }
    ];

    return (
      <Drawer
        title='全量数据'
        closable={true}
        onClose={() => close()}
        visible={visible}
        bodyStyle={{ padding: 10 }}
        width={400}
        className={styles.fullListContainer}
        mask={false}
      >
        <div className={styles.tableContainer}>
          <RadioGroup 
            value={this.state.type} 
            style={{ marginBottom: 15 }}
            onChange={this.handleChangeType}>
            <RadioButton value='3'>类型1</RadioButton>
            <RadioButton value='2'>类型2</RadioButton>
            <RadioButton value='1'>类型3</RadioButton>
            <RadioButton value='4'>其他</RadioButton>
          </RadioGroup>
          <Table 
            columns={columns} 
            dataSource={fullCircleList} 
            size="small"
            pagination={false} />
          <Pagination size="small"
            current={pagination.currentPage}
            total={pagination.totalCount}
            onChange={this.handlePageChange} />
        </div>
      </Drawer>
    )
  }
}
