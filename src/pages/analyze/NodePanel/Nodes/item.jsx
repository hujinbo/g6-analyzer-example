import React from 'react'
import style from '../index.less'


// 模拟的节点Icon
const nodeIconMap = {
  batchInferenceJob: 'https://gw.alipayobjects.com/zos/rmsportal/NKmorGEesOtYawmMJkhi.svg',
  odpsCmd: 'https://gw.alipayobjects.com/zos/rmsportal/qXItsPCgijgVkgLiattJ.svg',
  tensorflow: 'https://gw.alipayobjects.com/zos/rmsportal/msMyjRAdZvDOLOeimTYF.svg'
}

const Item = ({ node }) => {
  return (
    <img draggable='false'
      alt=''
      src={nodeIconMap[node.codeName]} 
      className={style.nodeItem} />
  )
}

export default Item