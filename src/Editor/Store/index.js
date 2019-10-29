import _ from 'lodash'
import EventEmitter from 'wolfy87-eventemitter';


import toolbar from './toolbar'
import tooltip from './tooltip'
import contextMenu from './contextMenu'

import InstanceManager from '../InstanceManager'
import EventCenter from '../EventCenter'

/*

  model 类型
  1. algo 节点定义
  2. dag图 依赖
  3. params 节点数据
  4. execute 执行
  5. status 查看状态
  6. modals 节点操作 如: 重命名

*/

const modelFactoryMap = {}

class Store extends EventEmitter {

  static modelFactoryMap = modelFactoryMap

  static regStoreModel(key = '', modelFactory) {
    if (modelFactoryMap[key]) {
      console.warn(key, '在store中被覆盖')
    }

    modelFactoryMap[key] = modelFactory
  }


  constructor(cfg = {}, key) {
    super();
    this.cfg = cfg
    this.modelMap = {}
    this.actions = {}
    this.instanceKey = key
    this.init(cfg)
    window.s = this
    console.log(this)
  }

  init(cfg) {
    this.initStore(cfg)
  }

  initStore(cfg) {
    _.each(cfg, (conf, modelName_) => {
      let modelName = modelName_
      if (modelName_.includes('=>')) {
        modelName = modelName_.split('=>')[1]
      }
      const model = this.initModel(modelName_, conf)
      this.actions[modelName] = {}
      _.each(model, (val, key) => {
        if (_.isFunction(val)) {
          this.actions[modelName][key] = val
        }
      })
    })
  }

  initModel(key, cfg) {
    const factoryClz = modelFactoryMap[key]
    const model = factoryClz(this.instanceKey, cfg, this);

    if (key.includes('=>')) {
      const [origin, renameKey] = key.split('=>')
      this.modelMap[renameKey] = model;
    } else {
      this.modelMap[key] = model;
    }


    return model
  }

  getActions() {
    return this.actions
  }

  getModel(key) {
    return this.modelMap[key]
  }

  select(path, defaultVal) {
    return _.get(this.modelMap, path, defaultVal)
  }



  enableEvent(instanceId) {
    const instance = InstanceManager.getInstance(instanceId || this.instanceKey)
    _.each(this.modelMap, (model, id) => {
      if (model.enableEvent) {
        const { eventCenter } = instance
        model.setupEvent(EventCenter, instanceId)
        model.enableEvent(instanceId, eventCenter)
      }
    })
  }


  disableEvent(instanceId) {
    const instance = InstanceManager.getInstance(instanceId || this.instanceKey)
    _.each(this.modelMap, (model, id) => {
      if (model.disableEvent) {
        const { eventCenter } = instance
        model.disableEvent(instanceId, eventCenter)
      }
    })
  }


  destroy() {
    this.modelMap = {}
  }

}


Store.regStoreModel('toolbar', toolbar)
Store.regStoreModel('tooltip', tooltip)
Store.regStoreModel('contextMenu', contextMenu)

export default Store