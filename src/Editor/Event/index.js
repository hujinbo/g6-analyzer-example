import _ from 'lodash';
import InstanceManager from '../InstanceManager'

// 引入事件
import './graph'
import './editor'
import './store'



const graphGroups = [
  'graph:onClick',
  'graph:dagChange',
  'graph:selectChange',
  'graph:anchor-tooltip',
  'graph:node-contextmenu'
]

const editorGroups = [
  'editor:cmd',
  'editor:lifeCycle',
  // 'editor:toolbarRefresh',
]

const storeGroups = [
  'store:dataChange',
  'store:dagStatusChange'
]



export function bindEvent(instanceId, eventGroup_) {


  const eventGroup = eventGroup_ ? eventGroup_ : {
    store: storeGroups,
    graph: graphGroups,
    editor: editorGroups,
  }

  const eventCenter = InstanceManager.getEventCenter(instanceId)


  eventCenter.__eventGroup = eventGroup


  //监听画布事件
  eventCenter.enableGroup(instanceId, 'graph', eventGroup.graph)

  //监听editor事件
  eventCenter.enableGroup(instanceId, 'editor', eventGroup.editor)

  //监听editor事件
  eventCenter.enableGroup(instanceId, 'store', eventGroup.store)
}



export function unbindEvent(instanceId) {


  const eventCenter = InstanceManager.getEventCenter(instanceId)

  const eventGroup = eventCenter.__eventGroup

  // 监听editor事件
  eventCenter.disableGroup(instanceId, 'store', eventGroup.storeGroups)

  // 解除画布事件
  eventCenter.disableGroup(instanceId, 'graph', eventGroup.graphGroups)

  // 监听editor事件
  eventCenter.disableGroup(instanceId, 'editor', eventGroup.editorGroups)


}


