/*
 * @Author: moyee
 * @Date: 2019-01-31 13:41:21
 * @LastEditors: moyee
 * @LastEditTime: 2019-08-16 14:12:04
 * @Description: Pai业务场景下的编辑器核心绘图区域容器
 */

import React, { PureComponent } from 'react';
import { Select, Menu, Dropdown, Row, Col, 
  Icon, Divider, Tooltip, Spin, Switch, message } from 'antd'
import { Canvas as MainCanvas, Toolbar } from '@antv/g6-editor/Components'
import Editor from '@antv/g6-editor'
import { AnalyzeHeader, Search, Predict,
  ShorestPath, PointPath, FullCircleList } from '../component'
import emptyImg from './empty.png'
import FilterPanel from '../component/Filter'
import { getVisit } from '../../../service/analyze'
import style from './index.less'

const { Option } = Select

const { InstanceManager, view } = Editor

class MainContainer extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      viewType: 'graph',
    }
    const { id } = props
    this.model = InstanceManager.getModel(id, 'graphStore')
    this.actions = InstanceManager.getActions(id, 'graphStore')
  }

  showLegend = () => {
    this.actions.showLegend()
  }

  hideLegend = () => {
    this.actions.hideLegend()
  }

  /**
   * 根据图例过滤图数据
   * @param {boolean} checked 是否选中
   * @param {string} label 节点或边的标签
   * @param {string} type 类型：节点或边
   * @memberof MainContainer
   */
  filterData = (checked, label, type) => {
    const graph = this.graph
    this.actions.filterData(checked, label, type, graph)
  }

  handleChangeView = (value) => {
    this.setState({
      viewType: value
    })
  }

  /**
   * 保存图数据
   *
   * @memberof MainContainer
   */
  saveGraph = () => {
    const graph = this.graph
    this.actions.saveGraph(graph)
  }

  /**
   * 弹出查找路径的弹框
   *
   * @memberof MainContainer
   */
  handleFindPath = () => {
    this.actions.showPointPath()
  }

  /**
   * 数据预判
   *
   * @memberof MainContainer
   */
  handlePreFindPath = () => {
    this.actions.showPredict()
  }

  /**
   * 显示所有隐藏的节点和边
   *
   * @memberof MainContainer
   */
  handleShowNode = () => {
    const graph = this.graph
    const nodes = graph.getNodes()
    const edges = graph.getEdges()
    const autoPaint = graph.get('autoPaint')
    graph.setAutoPaint(false)

    // 只更新隐藏的节点及边
    const hidenNodes = nodes.filter(node => {
      const model = node.getModel()
      const { style } = model
      return style && style.opacity === 0
    })

    const hidenEdges = edges.filter(edge => {
      const model = edge.getModel()
      const { style } = model
      return style && style.opacity === 0
    })

    hidenNodes.forEach(node => {
      graph.updateItem(node, {
        style: {
          opacity: 1,
          fillOpacity: 1
        },
        labelCfg: {
          style: {
            fillOpacity: 1
          }
        }
      })
    })

    hidenEdges.forEach(edge => {
      graph.updateItem(edge, {
        style: {
          opacity: 1,
          fillOpacity: 1
        },
        labelCfg: {
          style: {
            fillOpacity: 1
          }
        }
      })
    })

    graph.paint()
    graph.setAutoPaint(autoPaint)
  }

  /**
   * 调用接口查询所有的数据
   *
   * @memberof MainContainer
   */
  handleCheckCrycle = () => {
    const param = {
      pageSize: 10,
      currentPage: 1,
      cycleType: '3'
    }
    this.actions.queryCircleList(param)
  }

  hiddenCirclePanel = () => {
    this.model.circleVisible = false
  }

  handleFilter = () => {
    this.model.visibleFilter = !this.model.visibleFilter
  }

  toggleLabelVisible = (checked) => {
    this.model.isShowLabel = checked
    this.actions.toggleLabelVisible(this.graph, checked)
  }

  render() {
    const { id, size } = this.props

    const { viewType } = this.state

    if(!id) {
      console.warn('dagId is not defined')
    }

    if(!this.graph) {
      this.graph = InstanceManager.getGraph(id)
      console.log(this.graph)
    }
    
    let graphSchema
    const schemaJson = {
      nodes: [],
      edges: []
    }
    if(this.graph) {
      graphSchema = this.graph.save()
      console.log(graphSchema)
      const { nodes, edges } = graphSchema
      nodes.forEach(node => schemaJson.nodes.push(node.data))
      edges.forEach(edge => schemaJson.edges.push(edge.data))
    }

    const { dag } = size
    const styles = {
      width: dag.width,
      height: dag.height
    }

    const { legends, graphData, isShowLabel,
      shouldLoading, visiblePointPath, visiblePredict,
      circleVisible, fullCircleList, circlePagination, visibleFilter } = this.model

    return (
      <div className={style.main}>
        <AnalyzeHeader />
        <div className={style.header}>
          <Search id={id} />
          <Row className={style.toolbar}>
            <Col span={3} style={{ paddingLeft: 20 }}>
              <Select defaultValue='graph' 
                style={{ width: 110, marginTop: 8 }}
                onChange={this.handleChangeView}>
                <Option value='graph'>
                  <Icon type="deployment-unit" /><span style={{ marginLeft: 5}}>图视图</span>
                </Option>
                <Option value='schema'>
                <Icon type="profile" /><span style={{ marginLeft: 5}}>Schema</span>
                </Option>
              </Select>
              <Divider type='vertical' />
            </Col>
            {/* <Col span={2} style={{paddingLeft: 10, }}>
              <Divider type='vertical' />
              <Tooltip title='保存' placement='bottom'>
                <span 
                  onClick={this.saveGraph}
                  style={{padding: '0 10px', cursor: 'pointer'}}>
                  <Icon type="save" />
                </span>
              </Tooltip>
              <Divider type='vertical' />
            </Col> */}
            <Col span={3} style={{ marginLeft: -20, width: 115 }}>
              <Toolbar
                  id={id}
                />
            </Col>
            <Col span={3} style={{ width: 205 }}>
              <Divider type='vertical' />
              <Tooltip title='过滤' placement='bottom'>
                <span 
                  onClick={this.handleFilter}
                  style={{padding: '0 10px', cursor: 'pointer'}}>
                  <Icon type="filter" />
                </span>
              </Tooltip>

              <Tooltip title='根据节点查找数据' placement='bottom'>
                <span 
                  onClick={this.handleFindPath}
                  style={{padding: '0 10px', cursor: 'pointer'}}>
                  <Icon type="fork" />
                </span>
              </Tooltip>
              <Tooltip title='全量查找数据' placement='bottom'>
                <span 
                  onClick={this.handleCheckCrycle}
                  style={{padding: '0 10px', cursor: 'pointer'}}>
                  <Icon type="deployment-unit" />
                </span>
              </Tooltip>
              <Tooltip title='新增关系预判' placement='bottom'>
                <span 
                  onClick={this.handlePreFindPath}
                  style={{padding: '0 10px', cursor: 'pointer'}}>
                  <Icon type="retweet" />
                </span>
              </Tooltip>
              <Tooltip title='显示全部隐藏的节点' placement='bottom'>
                <span 
                  onClick={this.handleShowNode}
                  style={{padding: '0 10px', cursor: 'pointer'}}>
                  <Icon type="check-circle" />
                </span>
              </Tooltip>
              <Divider type='vertical' />
            </Col>
            <Col span={5} style={{ cursor: 'pointer'}}>
              显示Label：
              <Switch 
                checkedChildren='开' 
                unCheckedChildren='关' 
                onChange={this.toggleLabelVisible}
                checked={isShowLabel}
                size='small' />
            </Col>
          </Row>
        </div>
        <div className={style.container}>
          { /** 添加loading，CSS样式已添加 */}
          {shouldLoading && (
            <div className={style.loading}>
              <Spin />
            </div>
          )}
          {
            !graphData &&
              <div className={style.emptyContainer}>
                <img src={emptyImg} alt='' width='423' height='341' />
                <p style={{marginTop: 20}}>暂时数据</p>
              </div>
          }
          <MainCanvas
            id={id}
            styles={styles}
          />
          {/* {
            !visibleLegend && graphData &&
              <div className={style.toggleLeftIcon} onClick={this.showLegend}>
                <div className={style.triangleIcon}></div>
              </div>
          } */}
          {/* {
            legends.nodes.length > 0 &&
              <GraphLegend
              id={id}
              data={legends}
              hide={this.hideLegend}
              visible={visibleLegend}
              filterData={this.filterData} />
          } */}
          <FilterPanel
            id={id}
            data={legends}
            visible={visibleFilter}
            filterData={this.filterData}
            close={() => this.model.visibleFilter = false} />

          {/* <ShorestPath id={id} visible={visible} /> */}
          <PointPath id={id} visible={visiblePointPath} />
          <Predict id={id} visible={visiblePredict} />
          {
            circleVisible && 
            <FullCircleList 
              id={id}
              visible={circleVisible}
              close={this.hiddenCirclePanel}
              fullCircleList={fullCircleList}
              pagination={circlePagination}
            />
          }
          {
            viewType === 'schema' &&
            <pre className={style.schemaView}>
              { JSON.stringify(schemaJson, null, 2) }
            </pre>
          }
        </div>
      </div>
    )
  }
}

export default view(MainContainer)
