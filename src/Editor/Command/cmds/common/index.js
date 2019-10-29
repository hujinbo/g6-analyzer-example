
import _, { isString } from 'lodash'

export function snapShotexecute(editor) {
  const graph = editor.getGraph();
  this.snapShot = graph.save();
  this.selectNodes = editor.getSelected()
  if (this.method) {
    if (isString(this.method)) {
      if (graph[this.method]) {
        graph[this.method](editor)
      } else {
        console.error(`${this.method} is not exist`)
      }
    } else {
      this.method(editor);
    }
  }
}

// 通过快照回滚
export function snapShotBack(editor) {
  const graph = editor.getGraph();
  editor.render(this.snapShot);
  // 渲染完以后设置恢复的数据，才能拿到完整的数据
  setTimeout(() => {
    editor.setSelected(this.selectNodes);
  }, 0);
  graph.emit('dagChange', null)
}


// 判断Mode是否可用
export function changeModeEnable(editor) {
  const graph = editor.getGraph();
  return graph.getCurrentMode() !== this.toMode;
}

// 切换Mode执行方法
export function changeModeExecute(editor) {
  const graph = editor.getGraph();
  this.fromMode = graph.getCurrentMode();
  graph.changeMode(this.toMode);
}

// 回滚Mode
export function changeModeBack(editor) {
  const graph = editor.getGraph();
  graph.changeMode(this.fromMode);
}

// 是否画布有选中项
export function hasItemSelected(editor) {
  const items = editor.getSelected();

  // 如果是对象
  if (_.isObject(items)) {
    let hasSelect = false
    _.each(items, (list, type) => {
      if (list.length) {
        hasSelect = true
      }
    })
    return hasSelect
  }

  return false
}


// 是否画布有选中项
export function enableExecution(editor) {
  const items = editor.getSelected('node');

  // 如果是数组
  if (_.isArray(items)) {
    return items.length === 1;
  }


  return false
}




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