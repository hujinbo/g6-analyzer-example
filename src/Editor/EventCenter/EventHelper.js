
import _ from 'lodash';



class EventHelper {

  constructor(cfg) {
    const { targetKey, eventName, handler, context } = cfg;
    this.validateCfg(cfg)
    this.hasBind = false;
    this.handlerMap = {};

    this.context = context;
    this.eventName = eventName;
    this.targetKey = targetKey;
    this.handler = this.wrapHandler(this, handler);
  }

  validateCfg({ eventName } = {}) {
    if (!eventName) {
      console.warn(`eventName is undefined`)
    }
  }

  wrapHandler = (self, handler) => (...args) => {
    if (!handler) {
      console.warn('handler is not defined', self, ...args)
    }

    if (self.target) {
      const { context } = this
      handler.call(context, ...args)
    } else {
      console.warn(`target 不存在`)
    }
  }


  getTarget = (target_) => {
    let target = target_

    if (_.isNil(target_)) {
      target = this.target
    }

    if (_.isString(target_)) {
      // 从context获取
      target = this.context[target_]
    }

    if (!target || !_.isFunction(target.on)) {
      debugger
      throw new Error(`${target_} is not exist,
        please use EventBank.addTarget(targetKey, target) to add.
        check context  
      `)
      console.error('context', this.context)
    } else {
      this.target = target
    }

    return target

  }


  bindEvent(id, target_) {

    try {
      const { targetKey, hasBind, eventName, handler } = this;
      // 防止重复绑定
      if (hasBind) {
        return console.warn(`
         ${ eventName} has been bound to target:${targetKey},
          please unbind first, otherwise it cause memory leak. 
      `)
      }

      // 如果target_是String 从this.context拿
      // 如果传的是实例 就更新this.target
      const target = this.getTarget(target_)

      // 绑定事件
      target.on(eventName, handler)
      // 设置flag
      this.hasBind = true
    } catch (error) {
      console.warn(error)
    }

  }


  unbind(id, target_) {
    try {
      const { targetKey, eventName, handler, hasBind } = this;

      const target = this.getTarget(target_)

      if (!hasBind || !_.isFunction(handler)) {
        return console.warn(`
         ${this.eventName} has not been bound to target:${targetKey} yet,
          therefore cannot unbind.
        `)
      }

      if (target && _.isFunction(target.off)) {

        target.off(eventName, handler)
        this.hasBind = false
      }

    } catch (error) {
      console.warn(error)
    }
  }



}


export default EventHelper