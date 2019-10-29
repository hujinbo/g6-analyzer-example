

import EventCenter from '../EventCenter'
import eventEnum from '../EventCenter/constant'


// command 执行 
// 这里应该改为直接调用store的actions.
EventCenter.addGroup({
  key: 'editor:cmd',
  targetKey: 'editor',
  eventMap: {
    [eventEnum.executeNode]: 'emitToStore',
    [eventEnum.executeFrom]: 'emitToStore',
    [eventEnum.executeTo]: 'emitToStore',
    [eventEnum.stopNodeExecution]: 'emitToStore',
    [eventEnum.rename]: 'emitToStore',
    [eventEnum.saveAll]: 'emitToStore',

    [eventEnum.showLog]: 'emitToStore',
    [eventEnum.afterCmdExec]: 'emitToStore',
  },
  handlers: {
    emitToStore(...args) {
      // const eventName = this.eventName
      const { eventName, store } = this;
      store.emit(eventName, ...args)
    },
  }
})



// 画布节点边的增删

EventCenter.addGroup({
  key: 'editor:toolbarRefresh',
  targetKey: 'editor',
  eventMap: {
    [eventEnum.selectChange]: 'onSelectChange',

  },
  handlers: {
    onSelectChange(...args) {
      this.editor.emit('toolbar:refresh', ...args)
    },
  }
})




// command 执行
// 这里应该改为直接调用store的actions.
EventCenter.addGroup({
  key: 'editor:lifeCycle',
  targetKey: 'editor',
  eventMap: {
    [eventEnum.editorReady]: 'emitToStore',
    [eventEnum.editorUnload]: 'emitToStore',
    [eventEnum.editorDataReload]: 'emitToStore',
  },
  handlers: {
    emitToStore(...args) {
      const { eventName, store } = this;
      store.emit(eventName, ...args)
    },
  }
})


