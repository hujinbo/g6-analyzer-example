
import _ from 'lodash'
import { store as buildModel } from 'react-easy-state'

const initState = (config) => {
  return {
    visible: false,
    text: '',
    x: 0,
    y: 0,
  }
}

const createModel = (id, config, store) => {
  const self = buildModel({
    ...initState(config),
    show({ clientX: x, clientY: y, description: text, side, label }) {
      self.x = x
      self.y = y
      self.text = text || label
      self.visible = true
      if (side === 'input') {
        self.placement = 'top'
      }
      if (side === 'output') {
        self.placement = 'bottom'
      }
    },
    hide() {
      self.visible = false
    },
    setupEvent(EventCenter) {
      const { eventEnum } = EventCenter
      EventCenter.addGroup({
        key: 'editor:plugin-tooltip',
        targetKey: 'store',
        eventMap: {
          [eventEnum.anchorMouseEnter]: 'onMouseEnter',
          [eventEnum.anchorMouseLeave]: 'onMouseLeave',
          [eventEnum.edgeMouseEnter]: 'onMouseEnter',
          [eventEnum.edgeMouseLeave]: 'onMouseLeave'
        },
        handlers: {
          onMouseEnter(...args) {
            self.show(...args)
          },
          onMouseLeave(...args) {
            self.hide(...args)
          },
        }
      });
    },

    enableEvent(uuid, eventCenter) {
      eventCenter.enableGroup(uuid, 'store', [
        'editor:plugin-tooltip'
      ])
    },

    disableEvent(uuid, eventCenter) {
      eventCenter.disableGroup(uuid, 'store', [
        'editor:plugin-tooltip'
      ])
    },

  })
  return self
}



export default createModel


