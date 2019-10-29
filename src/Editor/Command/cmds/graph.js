/*
 * @Author: moyee
 * @Date: 2019-06-19 16:57:04
 * @LastEditors: moyee
 * @LastEditTime: 2019-08-15 11:58:20
 * @Description: file content
 */
import Command from '../../Command';
import G6 from '@antv/g6';
import _ from 'lodash';
import eventEnum from '../../EventCenter/constant'

import {
  snapShotBack,
  // snapShotexecute,
  changeModeEnable,
  changeModeExecute,
  changeModeBack,
  hasItemSelected,
} from './common';


Command.addCommand('common', {
  back: snapShotBack,
});




Command.addCommand('toBack', {
  enable: hasItemSelected,
  method: 'toBack',
  back: snapShotBack,
});

Command.addCommand('toFront', {
  enable: hasItemSelected,
  method: 'toFront',
  back: snapShotBack,
});


Command.addCommand('multiSelect', {
  enable: changeModeEnable,
  toMode: 'multiSelect',
  execute: changeModeExecute,
  back: changeModeBack,
});

Command.addCommand('move', {
  enable: changeModeEnable,
  toMode: 'move',
  execute: changeModeExecute,
  back: changeModeBack,
});


Command.addCommand('clear', {
  enable(editor) {
    const graph = editor.getGraph();
    const items = graph.getItems();
    return items.length > 0;
  },
  method: 'clear',
  back: snapShotBack,
});



// #TODO: 添加节点 添加边 更新节点参数






// 撤销
Command.addCommand('undo', {
  queue: false,
  enable(editor) {
    const cmdInstance = editor.getCmd();
    return cmdInstance.queueIdx > 0;
  },
  execute(editor) {
    const cmd = editor.getCmd();
    const { queue, queueIdx } = cmd;
    const command = queue[queueIdx - 1];
    command.executeTimes += 1;
    command.back(editor);
    cmd.queueIdx -= 1;
  },
  shortcutCodes: [
    ['metaKey', 'z'],
    ['ctrlKey', 'z']
  ]
});



Command.addCommand('redo', {
  queue: false,
  enable(editor) {
    const cmdInstance = editor.getCmd()
    const { queue, queueIdx } = cmdInstance
    return queueIdx < queue.length
  },
  execute(editor) {
    const cmd = editor.getCmd()
    const { queue, queueIdx } = cmd
    queue[queueIdx].execute(editor);
    // after redo
    const command = queue[queueIdx];
    command.executeTimes -= 1;
    cmd.queueIdx += 1;
    if (queue[cmd.queueIdx] && queue[cmd.queueIdx].selectNodes) {
      // TODO parse后，再执行redo会有问题
      setTimeout(() => {
        editor.setSelected(queue[cmd.queueIdx].selectNodes);
      }, 0);
    }
  },
  shortcutCodes: [
    ['metaKey', 'shiftKey', 'z'],
    ['ctrlKey', 'shiftKey', 'z']
  ]
})

Command.addCommand('update', {
  enable() {
    return this.itemId && this.updateModel;
  },
  execute(editor) {
    const graph = editor.getGraph();
    const item = graph.find(this.itemId);
    if (this.executeTimes === 1) {
      this.originModel = G6.Util.getContrast(item.getModel(), this.updateModel);
      this.graph = graph;
    }
    graph.update(item, this.updateModel);
  },
  back() {
    const graph = this.getGraph();
    const item = graph.find(this.itemId);
    graph.update(item, this.originModel);
  },
});

// 放大 zoom-in command
Command.addCommand('zoom-in', {
  enable(editor) {
    const graph = editor.getGraph()
    const maxZoom = graph.get('maxZoom')
    const currentZoom = graph.getZoom()
    return maxZoom - currentZoom.toFixed(1) < 1.5 ? false : true
  },
  method(editor) {
    const graph = editor.getGraph()
    graph.zoom(1.2)
    graph.paint()
  },
  tips: '放大'
})

// 缩小 zoom-out command
Command.addCommand('zoom-out', {
  enable(editor) {
    const graph = editor.getGraph()
    const minZoom = graph.get('minZoom')
    const currentZoom = graph.getZoom()

    // graph.getZoom()返回来的值类似 0.7873200000000001； 0.7085880000000001；0.7085880000000001；这种
    return currentZoom.toFixed(1) - minZoom < 0.5 ? false : true
  },
  method(editor) {
    const graph = editor.getGraph()
    graph.zoom(0.9)
    graph.paint()
  },
  tips: '缩小'
})

// 实际尺寸
Command.addCommand('zoom-real', {
  enable(editor) {
    const graph = editor.getGraph()
    const current = graph.getZoom()
    return current !== 1
  },
  method(editor) {
    const graph = editor.getGraph()
    const current = graph.getZoom()
    graph.zoom(1 / current)
    graph.paint()
  },
  tips: '实际像素展示'
})

// 自适应视口大小
Command.addCommand('zoom-auto', {
  enable() {

    return true
  },
  method(editor) {

    const graph = editor.getGraph()
    const nodes = graph.getNodes()

    if (nodes.length > 0) {
      const group = graph.get('group')
      const canvas = graph.get('canvas')
      const width = canvas.get('width')
      const height = canvas.get('height')
      const bbox = group.getBBox()

      // 画布比group bbox大， 即视口大小大于group的bbox
      // canvas的大小width/height和graph.get('width'), graph.get('height')值相等
      let padding = []
      if (width > bbox.width && height > bbox.height) {
        const deltaWidth = (width - bbox.width) / 2
        const deltaHeight = (height - bbox.height) / 2
        padding = [deltaHeight * 0.8, deltaWidth, deltaHeight * 1.2, deltaWidth]
      } else {
        padding = [20, 20]
      }
      graph.fitView(padding)
      graph.paint()
    }
  },
  tips: '自适应视口大小'
})

// 选中某个元素移动到画布中间
Command.addCommand('move-center', {
  enable(editor) {
    // 有选中元素时可用
    return hasItemSelected(editor)
  },
  method(editor) {
    const graph = editor.getGraph()
    const selectedNodes = editor.getSelected('node')
    selectedNodes.forEach(id => {
      const item = graph.findById(id)
      if (item) {
        graph.focusItem(item)
      }
    })
  },
  tips: '移动到画布中间'
})

// 切换网格显示状态
Command.addCommand('toogle-grid', {
  enable() {
    return true
  },
  method(editor) {
    const grid = editor.getEditorgrid()
    if (grid.gridConfig.visible) {
      grid.show()
    } else {
      grid.hide()
    }
  },
  tips: '显示/隐藏网格线'
})

// 框选
Command.addCommand('select', {
  enable(editor) {
    const graph = editor.getGraph()
    const nodes = graph.getNodes()
    // 当画布上有节点时候，框选可用
    return nodes.length > 0
  },
  method(editor) {
    const graph = editor.getGraph()
    const currentMode = graph.getCurrentMode()
    if (currentMode === 'multiSelect') {
      graph.setMode('default')
      graph.get('canvas').get('el').style.cursor = 'default'
    } else {
      graph.setMode('multiSelect')
    }
  },
  tips: '框选/取消框选'
})

// 新建群组
Command.addCommand('addGroup', {
  enable(editor) {
    const nodeIds = editor.getSelected('node')
    // 新建群组可用的条件：有选中的节点，且不是群组中的节点
    const graph = editor.getGraph()
    const nodes = graph.getNodes()
    let seleteds = []
    nodes.forEach(node => {
      const model = node.getModel()
      const nodeId = model.id
      if (!model.groupId && nodeIds.includes(nodeId)) {
        seleteds.push(nodeId)
      }
    })
    return seleteds.length > 0
  },
  method(editor) {
    if (!editor.generateGroupId) {
      const nodeGroup = editor.getNodegroup()
      const groupId = '23kd'//editor.generateGroupId()
      nodeGroup.create(groupId)
      const graph = editor.getGraph()
      graph.emit(eventEnum.canvasClick)
    } else {
      console.warn('请定义editor.generateGroupId')
    }
  },
  tips: '成组'
})

// 拆分群组
Command.addCommand('unGroup', {
  enable(editor) {
    const graph = editor.getGraph()
    const customGroup = graph.get('customGroup')
    const chidlren = customGroup.get('children')
    const isEnable = chidlren.filter(item => !item.get('destroyed') && item.get('selected')).length
    return isEnable
  },
  method(editor) {
    const nodeGroup = editor.getNodegroup()
    nodeGroup.unGroup()
  }
})

// 下载图片
Command.addCommand('download', {
  enable(editor) {
    const graph = editor.getGraph()
    const nodes = graph.getNodes()
    return nodes.length > 0
  },
  method(editor) {
    const graph = editor.getGraph()
    const fileName = new Date().getTime()
    graph.downloadImage(`graph-${fileName}`)
  }
})