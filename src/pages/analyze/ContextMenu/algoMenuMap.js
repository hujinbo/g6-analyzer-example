import _ from 'lodash'

const node_algo_map = {
  demo_code_name: {
    items: ['rename', 'copy', 'delete', 'divider', 'log'],
    onShow: (item) => {
      // 当配置这个字段时,  应该返回promise 如果resolve的值是false 则不显示菜单. 
      return new Promise((resovle, reject) => {
        resovle(true)
      })
    }
  },

  'common': {
    items: [
      'hiddenNode', 'divider',
      'degreeQuery1', 'degreeQuery2', 'degreeQuery3', 'degreeQuery4', 'degreeQuery5', 'degreeQuery6'
    ]
  },

  "canvas": {
    items: [
      'clickNodeAddEdge'
    ]
  },
  
  "tensorflow": {
    items: [
      'shorestPath', 'checkCycle', 'copy',
      'divider',
      'delete',
      'divider',
      'clickNodeAddEdge'
    ]
  },
  "odpsCmd": {
    items: [
      'shorestPath', 'checkCycle', 'copy',
      'divider',
      'delete',
      'divider',
      'clickNodeAddEdge'
    ]
  },
  "batchInferenceJob": {
    items: [
      'shorestPath', 'checkCycle', 'copy',
      'divider',
      'delete',
      'divider',
      'clickNodeAddEdge'
    ]
  }
}

_.each(node_algo_map, (val, key = '', ) => {
  node_algo_map[key.toLowerCase()] = val;
})

export default node_algo_map