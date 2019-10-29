import { merge, capitalize } from 'lodash';
import EventEmitter from 'wolfy87-eventemitter';

const getterProps = ['main', 'plugin'];
class EventBase extends EventEmitter {
  getDefaultCfg() {
    return {};
  }

  constructor(cfg) {
    super(cfg);
    const defaultCfg = this.getDefaultCfg();
    this._private = {
      cfg: merge({}, this._cfg, defaultCfg, cfg),
      data: {},
      main: {},
      plugin: {},
    };
    this.init(this._cfg);
  }

  init() { }

  add(value, property = 'main') {
    const { __key: key } = value;

    if (!key) console.warn('add时,请指定一个key');

    // 初始化
    this._private[property] = this._private[property] || {};

    // 自动增加一个get方法
    if (getterProps.includes(property)) {
      const methodKey = `get${capitalize(key)}`;
      this[methodKey] = () => {
        return this.take(key, property);
      };
    }

    this._private[property][key] = value;
  }

  take(key, property = 'main') {
    return this._private[property][key];
  }

  rm(key) {
    const value = this._private[key];
    if (value.destroy) {
      value.destroy();
    }
    delete this.this._private[key];
  }

  get(key, property = 'data') {
    return this.take(key, property);
  }

  set(key, value, property = 'data') {
    value.__key = key;
    this.add(value, property);
  }

  destroy() {
    this._cfg = {};
    this._private = {};
    this.destroyed = true;
  }
}

export default EventBase;
