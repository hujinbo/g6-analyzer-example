
import EventCenter from '../EventCenter'
import eventEnum from '../EventCenter/constant'

EventCenter.addGroup({
  key: 'store:dataChange',
  targetKey: 'store',
  eventMap: {
    [eventEnum.reloadDag]: 'onDagReload',
    [eventEnum.modifyNode]: 'onNodeModify',
    [eventEnum.batchUpdateItemStatus]: 'onBatchUpdateItemStatus'
  },
  handlers: {
    // 画布重新加载数据
    onDagReload(...args) {

      // dagChange 逻辑
      const { editor, eventCenter } = this;

      // 屏蔽dag监听事件
      eventCenter.disableGroup('graph', ['graph:dagChange'])

      // 更新数据
      editor.reloadData(...args, args[1])

      // 恢复dag监听事件
      eventCenter.enableGroup('graph', ['graph:dagChange'])
    },

    // 修改节点状态
    onNodeModify(...args) {
      const { editor } = this
      editor.updateNode(...args)
    },

    /**
     * 批量更新节点和边的状态
     * @param  {array} args 节点边的数据及样式
     */
    onBatchUpdateItemStatus(...args) {
      const { editor } = this
      editor.updateItemState(...args)
    }
  }
})


EventCenter.addGroup({
  key: 'store:dagStatusChange',
  targetKey: 'store',
  eventMap: {
    [eventEnum.updateStatus]: 'onStatusChange',
  },
  handlers: {
    // 画布执行状态改变
    onStatusChange(...args) {
      const { editor } = this;
      editor.updateStatus(...args)
    },
  }
})
