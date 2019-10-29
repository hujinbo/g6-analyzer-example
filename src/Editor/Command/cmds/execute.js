
import Command from '../../Command';
import G6 from '@antv/g6';
import _ from 'lodash';


import {
  snapShotBack,
  snapShotexecute,
  changeModeEnable,
  changeModeExecute,
  changeModeBack,
  hasItemSelected,
} from './common';



const eventEnum = {
  saveAll: 'cmd:saveAll',
  saveDag: 'cmd:saveDag',
  saveParams: 'cmd:saveParams',

  showLog: 'cmd:showNodeLog',
  executeTo: 'cmd:executeToNode',
  executeNode: 'cmd:executeNode',
  executeFrom: 'cmd:executeFromNode',
  stopNodeExecution: 'cmd:stopNodeExecution',
}






Command.addCommand('executeFromNode', {
  queue: false,
  enable(editor) {
    return hasItemSelected(editor)
  },
  method(editor, params) {

    // 获取当前节点
    let node = params;

    if (!node || !node.id) {
      const select = editor.getSelected('node')
      const graph = editor.getGraph();
      _.each(select, (val, id) => {
        if (val) {
          const item = graph.findById(id);
          node = item.get('model')
        }
      });
    }

    editor.emit(eventEnum.executeFrom, node)
  },
  back: snapShotBack,
  tips: '从此处开始执行'
});



Command.addCommand('executeToNode', {
  queue: false,
  enable(editor) {
    return hasItemSelected(editor)
  },
  method(editor, params) {
    // 获取当前节点
    let node = params;

    if (!node || !node.id) {
      const select = editor.getSelected('node')
      const graph = editor.getGraph();
      _.each(select, (val, id) => {
        if (val) {
          const item = graph.findById(id);
          node = item.get('model')
        }
      });
    }

    editor.emit(eventEnum.executeTo, node)
  },
  back: snapShotBack,
  tips: '执行到此处'
});


Command.addCommand('executeNode', {
  queue: false,
  enable(editor) {
    return hasItemSelected(editor)
  },
  method(editor, params) {
    // 获取当前节点
    let node = params;

    if (!node || !node.id) {
      const select = editor.getSelected('node')
      const graph = editor.getGraph();
      _.each(select, (val, id) => {
        if (val) {
          const item = graph.findById(id);
          node = item.get('model')
        }
      });
    }

    editor.emit(eventEnum.executeNode, node)
  },
  back: snapShotBack,
  tips: '执行该节点'
});


Command.addCommand('stopNodeExecution', {
  queue: false,
  enable(editor) {
    return true
  },
  method(editor, params) {
    // 获取当前节点
    let node = params;

    if (!node || !node.id) {
      const select = editor.getSelected('node')
      const graph = editor.getGraph();
      _.each(select, (val, id) => {
        if (val) {
          const item = graph.findById(id);
          node = item.get('model')
        }
      });
    }

    editor.emit(eventEnum.stopNodeExecution, node)
  },
  back: snapShotBack,
  tips: '停止执行'
});



Command.addCommand('log', {
  queue: false,
  enable(editor) {
    return hasItemSelected(editor)
  },
  method(editor, params) {
    editor.emit(eventEnum.showLog, params)
  },
  back: snapShotBack,
  tips: '查看日志'
});


// 撤销
Command.addCommand('saveAll', {
  queue: false,
  enable(editor) {
    return true //isCanvasHasFocus(editor)
  },
  execute(editor) {
    editor.emit(eventEnum.saveAll)
  },
  shortcutCodes: [
    // ['metaKey', 's'],
    // ['ctrlKey', 's']
  ],
  tips: '保存DAG'
});



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