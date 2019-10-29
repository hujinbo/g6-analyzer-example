/*
 * @Author: moyee
 * @Date: 2019-07-08 11:57:01
 * @LastEditors: moyee
 * @LastEditTime: 2019-08-16 13:39:28
 * @Description: 画布元素过滤器组件
 */
import React, { Component } from '@alipay/bigfish/react'
import { Drawer, Radio, Col, Row, Badge, Switch } from '@alipay/bigfish/antd'
import styles from './index.less'
const RadioGroup = Radio.Group
const RadioButton = Radio.Button

export default class DataFilter extends Component {
  constructor(props) {
    super(props)
    this.state = {
      type: 'node'
    }
  }

  filterData = (checked, type, shape) => {
    this.props.filterData(checked, type, shape)
  }

  handleChange = (evt) => {
    this.setState({
      type: evt.target.value
    })
  }

  render() {
    const { data, visible, close } = this.props
    const { type } = this.state
    
    return (
      <Drawer
        title='筛选'
        placement='left'
        closable={true}
        onClose={() => close()}
        visible={visible}
        bodyStyle={{ padding: 10 }}
        width={317}
        className={styles.filterContainer}
        mask={false}
      >
        <RadioGroup 
          value={type}
          onChange={this.handleChange}
          style={{textAlign: 'center'}}>
          <RadioButton
            style={{ width: 137 }}
            value='node'>节点</RadioButton>
          <RadioButton style={{ width: 137 }}
            value='edge'>边</RadioButton>
        </RadioGroup>

        <Row>
          <Col span={24} style={{display: this.state.type === 'node' ? 'block' : 'none'}}>
            {
              data.nodes.map(item => (
                <Row style={{margin: '8px 0'}}>
                  <Col span={20}>
                    <Badge color={item.color} text={item.label} />
                  </Col>
                  <Col span={3}>
                    <Switch
                      size='small'
                      defaultChecked={true}
                      onChange={(checked) => this.filterData(checked, item.type, 'node')}
                    />
                  </Col>
                </Row>
              ))
            }
          </Col>

          <Col span={24}  style={{display: this.state.type !== 'node' ? 'block' : 'none'}}>
            {
              data.edges.map(edge => (
                <Row style={{margin: '8px 0'}}>
                  <Col span={20} className={styles.lineLegend}>
                    <Badge color={edge.color} text={edge.label} />
                  </Col>
                  <Col span={3}>
                    <Switch
                      size='small'
                      defaultChecked={true}
                      onChange={(checked) => this.filterData(checked, edge.type, 'edge')}
                    />
                  </Col>
                </Row>
              ))
            }
          </Col>
        </Row>
      </Drawer>
    )
  }
}