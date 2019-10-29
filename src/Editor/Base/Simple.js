import { merge, capitalize } from 'lodash';

const getterProps = ['main', 'plugin'];

class SimpleBase {

  getDefaultCfg() {
    return {};
  }

  constructor(cfg) {
    const defaultCfg = this.getDefaultCfg();
    this._cfg = merge({}, this._cfg, defaultCfg, cfg);
    this._private = {
      cfg: {},
      data: {},
      main: {},
    };
    this.init(this._cfg);
  }

  init(cfg) {

  }

  add(value, property = 'main') {
    const { key } = value;

    if (!key) {
      console.warn('add时,请指定一个key');
    }

    if (!this._private[property]) {
      this._private[property] = {};
    }

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
    value.key = key;
    this.add(value, property);
  }

  destroy() {
    this._cfg = {};
    this.destroyed = true;
  }
}

export default SimpleBase;
