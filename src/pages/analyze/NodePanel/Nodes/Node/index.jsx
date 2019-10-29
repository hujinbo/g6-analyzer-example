import React from 'react'
import style from './index.less'
import _ from 'lodash';

import NodeIcon from '../Icons'

const NodeTitle = ({ node, searchKey = '', isDragging }) => {
  const { label = '', category, isFolder } = node;
  const draggingClz = isDragging ? style.drag : ''

  // 文件夹
  if (isFolder) {
    return (
      <div className={style.category}>
        <span className={style.icon}>
          <NodeIcon type={category} fill="#bbb" />
        </span>
        <span className={style.label} >
          {label}
        </span>
      </div>
    )
  }


  const index = searchKey ? _.toLower(label).indexOf(_.toLower(searchKey)) : -1;

  if (index > -1) {
    const beforeStr = label.substr(0, index);
    const afterStr = label.substr(index + searchKey.length);

    return (
      <span className={style.node}>
        <span className={style.icon}>
          <NodeIcon type={category} fill="#bbb" />
        </span>
        <span className={style.label}>
          {beforeStr}
          <span className={style.keyword}>{searchKey}</span>
          {afterStr}
        </span>
      </span>
    )
  }

  return (
    <div className={`${style.node} ${draggingClz}`}>
      <span className={style.icon} >
        <NodeIcon type={category} fill="#bbb" />
      </span>
      <span className={style.label} >
        {label}
      </span>
    </div>
  )
}

export default NodeTitle


