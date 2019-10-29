
import _ from 'lodash'
import { store as buildModel } from 'react-easy-state'

const defaultVisibleCommands = [
  'redo',
  'undo',
  'copy',
  'paste',
  'executeNode',
  'select',
  'stopNodeExecution',
  'delete',
  'zoom-in',
  'zoom-out',
  'zoom-real',
  'zoom-auto',
  'saveAll',
  'toogle-grid',
  'select',
  'addGroup',
  'unGroup',
  // 触发连接的command
  'clickNodeAddEdge',
  'download'
];


const initState = (config) => {
  const { visible = defaultVisibleCommands } = config;
  return {
    list: [],
    visible: visible.map((item = '') => _.lowerCase(item))
  }
}




const createModel = (id, config, store) => {

  const self = buildModel({
    ...initState(config),

    onFresh({ editor, cmds }) {
      const { visible = [] } = self
      self.list = cmds.filter((cmd) => {
        const { key = '' } = cmd;
        const key_ = _.lowerCase(key)
        return visible.includes(key_)
      }).map(cmd => {
        cmd.status = cmd.enable(editor)
        return cmd
      })
    },


    setupEvent(EventCenter) {

      const { eventEnum } = EventCenter

      EventCenter.addGroup({
        key: 'editor:plugin-toolbar',
        targetKey: 'store',
        eventMap: {
          [eventEnum.selectChange]: 'refreshToolbar',
          [eventEnum.editorReady]: 'refreshToolbar',
          [eventEnum.dagModify]: 'refreshToolbar',
          [eventEnum.canvasClick]: 'refreshToolbar',
          [eventEnum.groupClick]: 'refreshToolbar',
          [eventEnum.multiSelect]: 'refreshToolbar',
          [eventEnum.afterCmdExec]: 'refreshToolbar'
        },
        handlers: {
          refreshToolbar(...args) {
            const { editor } = this;
            if (!editor.destroyed) {
              const cmds = editor.getCmdConfig()
              self.onFresh({
                editor, cmds
              })
            }
          }
        }
      });
    },

    enableEvent(uuid, eventCenter) {
      eventCenter.enableGroup(uuid, 'store', [
        'editor:plugin-toolbar'
      ])
    },

    disableEvent(uuid, eventCenter) {
      eventCenter.disableGroup(uuid, 'store', [
        'editor:plugin-toolbar'
      ])
    },

  })
  return self
}



export default createModel


