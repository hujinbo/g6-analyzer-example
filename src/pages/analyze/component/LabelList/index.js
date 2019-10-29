import React from 'react'
import { List, Skeleton } from 'antd'
import moment from 'moment'

const LabelList = ({ labelList, showDetailInfo }) => (
  <List
    header={<h3>{`共${labelList.length}条边`}</h3>}
    itemLayout="horizontal"
    dataSource={labelList}
    renderItem={item => (
      <List.Item actions={[<a onClick={() => showDetailInfo(item)}>查看详情</a>]}>
        <Skeleton avatar title={false} loading={item.loading} active>
          <List.Item.Meta
            title={<a onClick={() => showDetailInfo(item)}>{item.label}</a>}
            description={
              <div>
              <span>开始节点：{item.source}</span> 
              <br />
              目标节点：{item.target}
            </div>}
          />
        </Skeleton>
      </List.Item>
    )}
  />
)

export default LabelList