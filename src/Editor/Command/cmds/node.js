
import Command from '../../Command';
// import G6 from '@antv/g6';
import _ from 'lodash'
import { } from '../../common/utils'


import {
  snapShotBack,
  hasItemSelected,
  isCanvasHasFocus
} from './common';

const eventEnum = {
  rename: 'cmd:renameNode',
  showLog: 'cmd:showNodeLog',
  executeTo: 'cmd:executeToNode',
  executeNode: 'cmd:executeNode',
  executeFrom: 'cmd:executeFromNode',
  stopNodeExecution: 'cmd:stopNodeExecution',
}



Command.addCommand('edit', {
  queue: false,
  enable(editor) {
    return true
  },
  method(editor, params) {
    // const { id, isContextMenu } = params;
    editor.emit(eventEnum.rename, params)
  },
  back: snapShotBack,
  tips: '重命名'
});



Command.addCommand('delete', {
  enable(editor) {
    // 处理焦点不在画布时的操作触发
    return true // isCanvasHasFocus(editor) && hasItemSelected(editor)
  },
  method(editor) {
    const graph = editor.getGraph();
    const autoPaint = graph.get('autoPaint');
    graph.setAutoPaint(false);
    const select = editor.getSelected()
    _.each(select, (list, type) => {
      list.forEach(id => {
        const item = graph.findById(id);
        graph.remove(item);
      })
    });
    graph.clearSelect();
    graph.paint();
    graph.setAutoPaint(autoPaint);
  },
  back: snapShotBack,
  shortcutCodes: ['Delete', 'Backspace'],
  tips: '删除'
});



Command.addCommand('selectAll', {
  enable(editor) {
    return isCanvasHasFocus(editor)
  },
  method(editor) {
    const graph = editor.getGraph();
    const nodes = graph.get('nodes');
    nodes.forEach(item => {
      graph.setItemState(item, 'node@select', true);
    });
    const edges = graph.get('edges');
    edges.forEach(item => {
      graph.setItemState(item, 'edge@select', true);
    });
  },
  back: snapShotBack,
  shortcutCodes: [['metaKey', 'a']],
  tips: '全选'
});


// copy command
Command.addCommand('copy', {
  queue: true,
  enable(editor) {
    return isCanvasHasFocus(editor) && hasItemSelected(editor)
  },
  method(editor, params) {
    const graph = editor.getGraph()
    const autoPaint = graph.get('autoPaint');
    graph.setAutoPaint(false);


    const selected = graph.getSelect(null, true)
    const { node: nodes, edge: edges } = selected;
    const clipboard = { nodes: [], edges: [] }
    const origin2NewMap = {};

    nodes.forEach(node => {
      const model = { ...node.getModel() }
      model.label = `copy_${model.label}`
      const newNode = editor.generateNode(model)

      if (editor.getNodeParam) {
        newNode.nodeParams = editor.getNodeParam(model)
      }
      console.log(newNode)
      delete newNode.groupId
      //记录下新旧关系
      origin2NewMap[model.id] = newNode
      clipboard.nodes.push(newNode)
    })

    edges.forEach(edge => {
      const source = edge.getSource()
      const target = edge.getTarget()
      const sourceId = source.get('id')
      const targetId = target.get('id')
      const edgeModel = edge.get('model')

      // 选中的边，且选中了节点的Source和target，才复制边，否则只复制节点
      if (origin2NewMap[sourceId] && origin2NewMap[targetId]) {
        const sourceModel = origin2NewMap[sourceId]
        const targetModel = origin2NewMap[targetId]
        const { startPoint, endPoint } = edgeModel
        const sourceAnchor = getAnchorByIdx(sourceModel, startPoint.sequence, 'output')
        const targetAnchor = getAnchorByIdx(targetModel, endPoint.sequence, 'input')
        const newEdge = editor.generateEdge(
          targetModel, sourceModel,
          targetAnchor, sourceAnchor
        )
        clipboard.edges.push(newEdge)
      }
    })


    //支持跨画布复制
    setPersist('editor-clipboard', clipboard, true)
    graph.canPaste = true
    graph.paint()
    graph.setAutoPaint(autoPaint)

  },
  back: snapShotBack,
  shortcutCodes: [
    ['metaKey', 'c'],
    ['ctrlKey', 'c']
  ],
  tips: '复制'
})

const getAnchorByIdx = (nodeCfg, idx, type) => {
  const { anchors = {} } = nodeCfg
  if (anchors[type] && anchors[type][idx - 1]) {
    return anchors[type][idx - 1]
  }
  return {}
}

// paste command
Command.addCommand('paste', {
  queue: true,
  enable(editor) {
    const graph = editor.getGraph()
    const clipboard = getPersist('editor-clipboard', { nodes: [], edges: [] }, true)
    return isCanvasHasFocus(editor) && (graph.canPaste || clipboard.nodes.length)
  },
  method(editor, params) {

    const graph = editor.getGraph()

    const clipboard = getPersist('editor-clipboard', { nodes: [], edges: [] }, true)
    const autoPaint = graph.get('autoPaint');

    graph.setAutoPaint(false);
    editor.clearSelect();

    const selectState = { nodes: [], edges: [] }
    const { nodes = [], edges = [] } = clipboard
    let deltaX = 50;
    let deltaY = 50;
    // 如果是右键
    if (params && params.isCanvas && nodes.length) {
      const { x, y } = params;
      let minX = nodes[0].x
      let minY = nodes[0].y
      nodes.forEach((node) => {
        if (node.x < minX) {
          minX = node.x
        }
        if (node.y < minY) {
          minY = node.y
        }
      })
      deltaX = x - minX + 59;
      deltaY = y - minY + 50;
    }

    nodes.forEach((node) => {
      node.x += deltaX
      node.y += deltaY
      selectState.nodes.push(node.id)
      graph.add('node', node);
    })

    edges.forEach((edge) => {
      selectState.edges.push(edge.id)
      graph.add('edge', edge);
    })


    setTimeout(() => {
      editor.updateSelected(selectState);
    }, 10);


    graph.paint()
    graph.setAutoPaint(autoPaint)
    // 清空可粘贴选项
    setPersist('editor-clipboard', { nodes: [], edges: [] }, true)
    graph.canPaste = false
  },
  back: snapShotBack,
  shortcutCodes: [
    ['metaKey', 'v'],
    ['ctrlKey', 'v']
  ],
  tips: '粘贴'
})

// 长按节点拖动新增边
Command.addCommand('clickNodeAddEdge', {
  enable(editor) {
    return true//hasItemSelected(editor)
  },
  method(editor) {
    const graph = editor.getGraph()
    const currentMode = graph.getCurrentMode()
    if (currentMode !== 'clickNodeAddEdge') {
      graph.setMode('clickNodeAddEdge')
    }
  },
  tips: '生成连线'
})

Command.addCommand('shorestPath', {
  enable() {
    return true
  },
  method(editor, params) {
    editor.emit(eventEnum.contextMenuItem, params)
  }
})

// 隐藏指定节点
Command.addCommand('hiddenNode', {
  enable() {
    return true
  },
  method(editor, params) {
    editor.emit(eventEnum.contextMenuItem, params)
  }
})

// 在当前图中查找数据
Command.addCommand('checkCycle', {
  enable() {
    return true
  },
  method(editor, params) {
    editor.emit(eventEnum.contextMenuItem, params)
  }
})

// 全量查找数据
Command.addCommand('checkCycleByNode', {
  enable() {
    return true
  },
  method(editor, params) {
    editor.emit(eventEnum.contextMenuItem, params)
  }
})

// 查询1-N度关系
for(let i = 1; i < 7; i++) {
  Command.addCommand(`degreeQuery${i}`, {
    enable(editor) {
      return hasItemSelected(editor)
    },
    method(editor, params) {
      editor.emit(eventEnum.contextMenuItem, params)
    }
  })
}

// 从localstorage获取值
export const getPersist = (key = '', defaultVal = null, needParse = false) => {
  const jsonStr = window.localStorage.getItem(key) || defaultVal;
  if (!needParse) return jsonStr;
  try {
    const val = JSON.parse(jsonStr);
    return val;
  } catch (ex) {
    return defaultVal;
  }
};

// 向localstorage更新值
export const setPersist = (key = '', val = '', needStringify = false) => {
  window.localStorage.setItem(key, needStringify ? JSON.stringify(val) : val);
};
