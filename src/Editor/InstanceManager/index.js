import _ from 'lodash'

import Store from '../Store'
import Editor from '../Editor'
import { bindEvent, unbindEvent } from '../Event'

import EventCenter from '../EventCenter'
import eventEnum from '../EventCenter/constant'


/*
   => react cwm 
   => init event
   => init store 
   => add store model 
   => react canvas cwm
   => init editor 
   => init graph 
   => bind event store/editor/graph
   => model actions 
   => unmount 
   => destroy
*/

// 1. 生成的时候instance自带事件
// 2. Dag Page constructor注册 store
// 3. Dag Page  cdm 注册 graph


//  self = InstanceManager;
let self;
const instanceMap = {}

class InstanceManager {

  static instanceMap = instanceMap
  static EventCenter = EventCenter

  static hasIntance = (id) => {
    return !!instanceMap[id]
  }

  static getInstance = (id) => {
    return instanceMap[id]
  }

  static getEventCenter(id) {
    return instanceMap[id] ? instanceMap[id]['eventCenter'] : null
  }

  static getStore(id) {
    return instanceMap[id] ? instanceMap[id]['store'] : null
  }

  static getActions(id, path) {
    const instance = instanceMap[id]
    if (instance && instance['store']) {
      const actionsMap = instance['store']['actions']
      return path ? _.get(actionsMap, path) : actionsMap
    }
    return null
  }

  static getEditor(id) {
    return instanceMap[id] ? instanceMap[id]['editor'] : null
  }

  static getGraph(id) {
    return instanceMap[id] ? instanceMap[id]['graph'] : null
  }
  static getCfg(id) {
    return instanceMap[id] ? instanceMap[id]['cfg'] : null
  }

  static setEditor(id, editor) {
    const instance = self.initInstance(id)
    instance['editor'] = editor
    return instance
  }

  static setCfg(id, cfg) {
    const instance = self.initInstance(id)
    instance['cfg'] = cfg
    return instance
  }

  static setGraph(id, graph) {
    const instance = self.initInstance(id)
    instance['graph'] = graph
    return instance
  }
  /*
    1. 生成的时候instance
    2. Dag Page 注册 store
    3. 画布组件 注册 graph
    4. 注册事件
   */
  static initEventCenter(id, targetMap_) {

    const eventCenter = self.getEventCenter(id)
    const instance = self.initInstance(id)

    let targetMap = targetMap_

    if (!targetMap)
      targetMap = {
        store: self.getStore(id),
        editor: self.getEditor(id),
        graph: self.getGraph(id)
      }

    if (!eventCenter) {
      instance['eventCenter'] = new EventCenter({ id, targetMap });
    }

    return instance['eventCenter']
  }

  // 1. 生成instance
  static initInstance(id) {
    if (!self.hasIntance(id)) {
      instanceMap[id] = { id }
    }

    return instanceMap[id]
  }

  // 2. 生成 store
  static initStore(id, storeCfg) {
    const store = self.getStore(id)
    const instance = self.initInstance(id)

    if (!store) {
      instance['store'] = new Store(storeCfg, id);
    }

    return instance['store']
  }

  // 3. add model
  static initModel(id, modelKey, modelCfg = {}) {
    const shouldInit = !InstanceManager.hasIntance(id)
    let store;
    if (shouldInit) {
      store = new Store({});
    } else {
      store = InstanceManager.getInstance(id)['store']
    }
    const model = store.initModel(modelKey, modelCfg)
    return model
  }


  static addEditorInstance(id, editorCfg) {

    if (!instanceMap[id].store) {
      console.warn('store is  not defined')
    }


    const editor = new Editor(editorCfg)
    const graph = editor.getGraph()

    self.setEditor(id, editor)
    self.setGraph(id, graph)


    const eventCenter = self.initEventCenter(id)
    self.setCfg(id, editorCfg)

    const { eventGroup } = editorCfg

    self.bindEvent(id, eventGroup)

    const store = self.getStore(id)
    store.enableEvent(id, eventCenter)

    editor.emit(eventEnum.editorReady, editor)
    return instanceMap[id]
  }

  static destroyInstance(id) {

    if (!instanceMap[id].store) {
      console.warn('store is  not defined')
    }

    const eventCenter = self.getEventCenter(id)

    // const store = self.getStore(id)
    // store.disableEvent(id, eventCenter)

    eventCenter.destroy()

    const editor = self.getEditor(id)
    editor.emit(eventEnum.editorUnload, editor)
    editor.destroy()


    instanceMap[id] = {
      destroy: true
    }

  }

  static bindEvent(id) {
    bindEvent(id)
  }

  static unBindEvent(id) {
    unbindEvent(id)
  }


  static getModel(id, path, defaultVal) {
    const instance = instanceMap[id]
    if (instance && instance['store']) {
      const modelMap = instance['store']['modelMap']
      return _.get(modelMap, path, defaultVal)
    }
    return defaultVal
  }

  // 这里直接暴露event相关的静态方法
  static eventGroupMap = EventCenter.eventGroupMap
  static getEventMap = EventCenter.getEventMap
  static addGroup = EventCenter.addGroup
  static eventEnum = EventCenter.eventEnum
  static regModel = Store.regStoreModel
}

window.ins = InstanceManager
self = InstanceManager;

export default InstanceManager
