import { merge, has, omit } from 'lodash';

import initCmd from './CmdBuilder';

const cmdMap = {};
const cmdList = [];

class Command {
  static addCommand = (name, cmdConfig, base) => {
    if (cmdMap[name]) {
      cmdMap[name] = merge({}, cmdMap[name], cmdConfig);
    } else {
      cmdConfig.name = name;
      let cmd = initCmd(cmdConfig);
      if (base && cmdMap[base]) {
        cmd = merge({}, Command[base], cmdConfig);
      }
      cmdMap[name] = cmd;
      cmdList.push(cmd);
    }
  };

  static has = name => {
    return has(cmdMap, name);
  };

  constructor(options = {}) {
    const { queueIdx = 0, queue = [], clipboard = [] } = options;
    this.key = 'cmd';
    this.cmdMap = cmdMap;
    this.cmdList = cmdList;
    this.queueIdx = queueIdx;
    this.queue = queue;
    this.clipboard = clipboard;
  }

  enable = (name, editor) => {
    const cmd = this.getCmd(name);
    return cmd.enable(editor);
  };

  getCmd = name => {
    const { cmdMap } = this;
    return cmdMap[name];
  };

  execute = (name, editor, obj, params) => {
    const { queue, queueIdx, cmdMap } = this;
    const cmd = merge({}, cmdMap[name], obj);

    if (cmd.enable(editor)) {
      cmd.init();
      if (cmd.queue) {
        queue.splice(queueIdx, queue.length - queueIdx, cmd);
        this.queueIdx += 1
      }
      // hook
      editor.emit('before-command-execute', {
        cmd,
      });
      // 执行
      cmd.execute(editor, params);
      // hook
      editor.emit('after-command-execute', {
        cmd,
      });

      return cmd;
    }
  };

  /**
   * 根据单条配置生成符合要求的command配置
   * @param {object} cmd 单条配置
   * cmd example：
   * {
   *    key: 'zoomIn',
   *    tips: '缩小',
   *    command: 'zoomIn',
   *    enable: true
   *  }
   *
   * @memberof Editor
   */
  createCommandConfig = (cmd) => {
    return {
      key: cmd.name,
      icon: cmd.name,
      enable: (editor) => cmd.enable(editor),
      tips: cmd.tips || '',
      command: cmd.name
    }
  }

  /**
   * 获取命令配置项，过滤掉不显示的命令
   * @param {array} hiddenCmds 需要隐藏的命令
   *
   * @memberof Command
   */
  getCmdConfig = (hiddenCmds) => {
    const cmdMap = omit(this.cmdMap, hiddenCmds)
    let result = []
    for (let cmd in cmdMap) {
      const tmpConfig = this.createCommandConfig(cmdMap[cmd])
      result.push(tmpConfig)
    }
    return result
  }
}

export default Command;

require('./cmds');
