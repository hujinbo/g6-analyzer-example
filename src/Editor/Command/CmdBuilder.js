import { isString } from 'lodash';

function initCmd(options) {
  return {
    shortcutCodes: undefined,
    snapShot: undefined,
    method: undefined,
    selectNodes: {},
    queue: true,
    // TODO copy和cut使用，需要区分是copy还是cut
    clipboard: [],
    executeTimes: 1,
    init() { },
    // 判断是否可以执行
    enable() {
      return true;
    },
    // 执行
    execute(editor, params) {
      const { method } = this;
      editor.emit('cmd:beforeExec', method)
      const graph = editor.getGraph();
      this.snapShot = graph.save();
      // 保存选中状态
      this.selectNodes = editor.getSelected()


      if (isString(method)) {
        editor[this.method] && editor[this.method](params);
      } else {
        this.method(editor, params);
      }

      editor.emit('cmd:afterExec', method)
    },
    // 回滚
    back() {
      console.log('bak');
    },
    ...options,
  };
}

export default initCmd;
