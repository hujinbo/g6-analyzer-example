import EventEmitter from 'wolfy87-eventemitter';
import _ from 'lodash';
import GroupHelper from './EventGroup'
import eventEnum from './constant'
import InstanceManager from '../InstanceManager'

const getMethodMap = {
  'editor': 'getEditor',
  'store': 'getStore',
  'graph': 'getGraph',
}


class EventCenter {
  static eventEnum = eventEnum
  static EventEmitter = EventEmitter
  static eventGroupMap = {}

  static addGroup(groupCfg) {
    const { key } = groupCfg
    EventCenter.eventGroupMap[key] = new GroupHelper(groupCfg)
  }

  static getTargetKey = (target) => {
    return target['__key__']
  }

  static getEventMap() {
    return EventCenter.eventGroupMap
  }

  static getEventGroup(groupName) {
    const eventGroup = EventCenter.eventGroupMap[groupName]
    if (!eventGroup) {
      console.warn(groupName, 'is not Exist in EventCenter.eventGroupMap', EventCenter.eventGroupMap)
    }
    return EventCenter.eventGroupMap[groupName]
  }

  constructor(cfg = {}) {
    const { id, targetMap = {} } = cfg;
    this.id = id;
    this.enableMap = {};
    this.targetMap = targetMap;

    _.each(targetMap, (val, key) => {
      this.addTarget(key, val)
    })

  }


  addTarget(targetKey, target) {
    target['__key__'] = targetKey
    this.targetMap[targetKey] = target
  }


  getTarget(id, target_) {
    let target = target_

    if (_.isString(target_)) {
      target = this.targetMap[target_]
      if (!target && id) {
        const getMethodName = getMethodMap[target_]
        target = InstanceManager[getMethodName](id)
      }
    }

    if (!target) {
      throw new Error(`${target_} is not exist,
        please use EventCenter.addTarget(targetKey, target) to add.
      `)
    }

    return target
  }



  enableGroup = (instanceId, target_, groups = []) => {
    try {
      const target = this.getTarget(instanceId, target_)
      _.each(groups, (groupName) => {
        const eventGroup = EventCenter.getEventGroup(groupName)
        this.enableMap[groupName] = true
        if (eventGroup) {
          eventGroup.bindEvent(instanceId, target)
        }
      })
    } catch (error) {
      console.error(error)
    }
  }


  disableGroup(instanceId, target_, groups = []) {
    try {
      const target = this.getTarget(instanceId, target_)

      _.each(groups, (groupName) => {

        const eventGroup = EventCenter.getEventGroup(groupName)

        this.enableMap[groupName] = false

        if (eventGroup) {
          eventGroup.unbind(instanceId, target)
        }

      })
    } catch (error) {
      console.error(error)
    }
  }


  disableAll(instanceId, target_) {
    try {
      const target = this.getTarget(instanceId, target_)

      _.each(this.enableMap, (isEnable, groupName) => {
        const eventGroup = EventCenter.getEventGroup(groupName)
        if (isEnable && eventGroup) {

          eventGroup.unbind(instanceId, target)
          this.enableMap[groupName] = false

        }
      })
    } catch (error) {
      console.error(error)
    }
  }


  destroy() {

    try {
      _.each(this.enableMap, (val, groupName) => {
        if (val) {
          const eventGroup = EventCenter.getEventGroup(groupName)
          if (eventGroup) {
            const { targetKey } = eventGroup
            eventGroup.unbind(this.id, targetKey)
            this.enableMap[groupName] = false
          }
        }
      })

      this.targetMap = {}
      this.enableMap = {};
      this.destroy = true

    } catch (error) {
      console.error(error)
    }
  }


}




export default EventCenter;


