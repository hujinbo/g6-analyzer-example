/*
 * @Author: moyee
 * @Date: 2019-05-28 11:43:42
 * @LastEditors: moyee
 * @LastEditTime: 2019-07-10 10:53:27
 * @Description: 分析场景下的图例组件
 */
import React from 'react'
import { Row, Col, Switch, Badge } from 'antd'
import styles from './index.less'

const GraphLegend = ({ visible, data, hide, filterData }) => (
  <div className={`${styles.legendContainer} ${visible ? styles.legendIn : styles.legendOut}`}>
    <Row>
      <Col span={11} className={styles.legendCol} style={{borderRight: '1px solid #EAEEF6'}}>
        <p>节点</p>
        {
          data.nodes.map(item => (
            <Row style={{margin: '8px 0'}}>
              <Col span={17}>
                <Badge color={item.color} text={item.label} />
              </Col>
              <Col span={6}>
                <Switch
                  size='small'
                  defaultChecked={item.enable}
                  onChange={(checked) => filterData(checked, item.type, 'node')}
                />
              </Col>
            </Row>
          ))
        }
      </Col>
      <Col span={11} className={styles.legendCol} style={{marginLeft: 25}}>
        <p>关系</p>
        {
          data.edges.map(edge => (
            <Row style={{margin: '8px 0'}}>
              <Col span={20} className={styles.lineLegend}>
                <Badge color={edge.color} text={edge.label} />
              </Col>
              <Col span={3}>
                <Switch
                  size='small'
                  checked={edge.enable}
                  onChange={(checked) => filterData(checked, edge.type, 'edge')}
                />
              </Col>
            </Row>
          ))
        }
      </Col>
    </Row>
    <div className={styles.toggleIcon} onClick={() => hide()}>
      <div className={styles.triangleIcon} />
    </div>
  </div>
)

export default GraphLegend
