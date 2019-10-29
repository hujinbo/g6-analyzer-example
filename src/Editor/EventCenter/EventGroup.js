import _ from 'lodash';


import EventHandlerHelper from './EventHelper'
import InstanceManager from '../InstanceManager'

class GroupHelper {

  constructor(cfg) {
    const { targetKey, key, handlers, eventMap } = cfg;
    // 唯一标识
    this.key = key;
    // helperMap 根据实例id做隔离.
    // helpmap={ instanceId1: {...helpers} }
    this.helperMap = {};
    // 事件触发的回调
    this.handlers = handlers;
    // 监听的事件map
    this.eventMap = eventMap;
    // 监听的对象: store/editor
    this.targetKey = targetKey;
  }

  // 这里根据id 创建namespace来隔离helpers
  getHelperMapById(id) {
    if (!this.helperMap[id]) {
      this.helperMap[id] = {}
    }
    return this.helperMap[id]
  }

  initContext(id, eventName, targetKey) {
    const graph = InstanceManager.getGraph(id)
    const store = InstanceManager.getStore(id)
    const editor = InstanceManager.getEditor(id)
    const eventCenter = InstanceManager.getEventCenter(id)

    return {
      id,
      eventName,
      targetKey,
      graph,
      store,
      editor,
      eventCenter
    }
  }

  bindEvent(id, target) {
    const { targetKey, handlers, eventMap } = this

    const helperMap = this.getHelperMapById(id)

    // 创建handler
    _.each(eventMap, (handlerName, eventName) => {
      // 创建context 
      // context的eventName每个helper都不一样, 因此各创造一个
      const context = this.initContext(
        id, eventName, targetKey
      )

      // 获取method
      const handler = handlers[handlerName]
      // 把method 的作用域加上context
      const helper = new EventHandlerHelper({
        targetKey, eventName, handler, context
      })
      // 启动事件监听
      helper.bindEvent(id, target)
      // 在idMap里注册helper
      helperMap[eventName] = helper

    })

  }

  unbind(id, target) {
    const helperMap = this.getHelperMapById(id)
    _.each(helperMap, function (helper) {
      helper.unbind(id, target)
    })
  }



}


export default GroupHelper