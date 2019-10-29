import SimpleBase from './Simple';
import '../EventCenter';
import EventEmitter from 'wolfy87-eventemitter';

import Command from '../Command';
import Graph from '../Graph';
import Grid from '../Components/Plugin/Grid'
import NodeGroup from '../Components/Plugin/group';
import AlignLine from '../Components/Plugin/AlignLine'


import _ from 'lodash';

// editor的 private方法放这里. 
// 这里的方法都是给public方法调用的. 
class EditorBase extends SimpleBase {


  initEvent(cfg) {
    const event = new EventEmitter(cfg);
    this.set('event', event, 'main');
  }


  initGraph(cfg) {
    const graph = new Graph({
      ...cfg,
      __editor: this,
    });

    const g6 = graph.getG6();

    this.set('graph', g6, 'main');
  }


  /**
   * 初始化辅助线
   *
   * @memberof EditorBase
   */
  initAlignLine() {
    const alignLine = new AlignLine({
      editor: this
    })
    this.set('alignLine', alignLine, 'plugin')
  }

  /**
   * 初始化editor网格
   *
   * @param {object} cfg 配置项
   * @memberof EditorBase
   */
  initGrid(cfg = {}) {
    const grid = new Grid({
      ...cfg,
      editor: this
    })
    grid.init()
    this.set('editorGrid', grid, 'plugin')
  }

  /**
   * 初始化节点群组
   *
   * @param {object} [cfg={}]
   * @memberof EditorBase
   */
  initNodeGroup(cfg = {}) {
    const nodeGroup = new NodeGroup({
      ...cfg,
      editor: this
    })
    this.set('nodeGroup', nodeGroup, 'plugin')
  }

  // 需要在Cmd和Graphinit后执行
  initCmd(cfg) {
    const cmd = new Command(cfg);
    this.set('cmd', cmd, 'main');
  }


  initShortCut(cfg = {}) {
    const graph = this.getGraph();
    const cmdList = this.getCmdList()
    const graphShortcut = graph.get('shortcut')
    const editor = this
    graph.on('keydown', event => {

      // 快捷键只在画布有焦点时生效
      const hasFocus = isCanvasHasFocus(editor)
      if (!hasFocus) {
        return
      }

      // 找出所有 有快捷键的cmd
      const commands = cmdList.filter(command => {
        return command.shortcutCodes && graphShortcut[command.name];
      });
      // 遍历执行command
      let hit
      commands.forEach(command => {
        if (this.isShortcutEnable(command, event)) {
          this.executeCommand(command.name);
          hit = true
          return false;
        }
      })
      // 全选时阻止浏览器事件
      hit && event.preventDefault();
      return false
    });
  }


  isShortcutEnable(command, event) {
    const { shortcutCodes } = command;
    return shortcutCodes.some((keys) => {
      if (_.isString(keys)) {
        return this.eventHasKey(event, keys)
      }
      if (_.isArray(keys)) {
        return keys.every(key => {
          return this.eventHasKey(event, key)
        })
      }
      return false
    })
  }


  eventHasKey(event, key) {
    return event[key] || event.key === key || event.code === key
  }

  getCommands() {
    return this.getCmd().queue;
  }

  getCmdList() {
    return this.getCmd().cmdList;
  }

  commandEnable(name) {
    const cmd = this.getCmd();
    return cmd.enable(name, this);
  }

  getCurrentCommand() {
    const commandCfg = this.getCmd();
    const { queue, current } = commandCfg;
    return queue[current - 1];
  }

  /**
   * 获取command配置项，过滤掉需要隐藏的命令
   *
   * @param {array} hiddenCmds 需要过滤的命令列表
   * @returns
   * @memberof EditorBase
   */
  getCmdConfig(hiddenCmds) {
    return this.getCmd().getCmdConfig(hiddenCmds)
  }
}

export default EditorBase;




export const isCanvasHasFocus = (editor) => {

  const canvasElement = editor.getGraph().get('container')
  // 画布
  if (document.activeElement === canvasElement ||
    document.activeElement.classList.contains('g6-editor-canvas')
  ) {
    return true
  }
  // toolbar temp1
  if (document.activeElement.classList.contains('g6-editor-toolbar')) {
    return true
  }
  // 右键菜单
  if (document.activeElement.classList.contains('g6-editor-contextmenu')) {
    return true
  }
  // disable
  return false
}
