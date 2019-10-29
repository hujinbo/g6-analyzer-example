/*
 * @Author: moyee
 * @Date: 2019-02-15 15:24:45
 * @LastEditors: moyee
 * @LastEditTime: 2019-02-15 15:36:10
 * @Description: 键盘按下和弹起事件
 */
import G6 from '@antv/g6'

G6.registerBehavior('keyboard-select', {
  getEvents() {
    return {
      'keyup': 'onKeyUp',
      'keydown': 'onKeyDown'
    };
  },
  onDel() {
    const graph = this.graph;
    const editor = graph.getEditor();
    editor.executeCommand('delete')
  },
  onKeyDown(e) {
    const code = e.keyCode || e.which;
    if (code === 16) {
      this.keydown = true;
    } else if (code === 8) {
      this.onDel()
    } else {
      this.keydown = false;
    }
  },
  onKeyUp() {
    this.keydown = false;
  }
});