/*
 * @Author: moyee
 * @Date: 2019-05-29 13:36:54
 * @LastEditors: moyee
 * @LastEditTime: 2019-08-11 22:06:09
 * @Description: 分析页面头部组件
 */
import React from 'React'
import { Row, Col } from 'antd'
import styles from './index.less'
import antVLogo from '../../antv-logo.svg'
import antLogo from '../../antLogo.png'

const AnalyzeHeader = () => (
  <Row className={styles.topBar}>
    {/* <Col span={1} style={{textAlign: 'center'}}>
      <Icon type="arrow-left" />
    </Col> */}
    <Col span={20}>
      {/* <Divider type='vertical' /> */}
      {/* <img alt='' src={antLogo} width='80px' height='40px' 
        style={{ marginLeft: 15 }}
        /> */}
      <img alt='' src={antVLogo} width='100px' height='50px' 
        style={{ marginLeft: 15 }} />
      <span className={styles.topTitle}>基于 G6 的图分析应用</span>
    </Col>
  </Row>
)

export default AnalyzeHeader
