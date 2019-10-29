import React from 'react'

import deeplearn from '@/assets/editor/deeplearn.icon.svg';
import datasource from '@/assets/editor/database-fill.icon.svg';
import machineLearning from '@/assets/editor/robot-fill.icon.svg';



const iconMap = {
  'dataSource': datasource,
  'deeplearning': deeplearn,
  'machineLearning': machineLearning,
}


const Icons = ({ type, ...rest }) => {
  const Icon = iconMap[type] || iconMap['default']
  return (
    <Icon {...rest} />
  )
}

export default Icons
