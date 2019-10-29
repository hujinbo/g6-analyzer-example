
import { store as buildModel } from 'react-easy-state'
import { isString, merge } from 'lodash'

const initState = ({ menuItems = {}, nodeContextMenuMap = {} }) => {
  return {
    // 是否显示
    visible: false,
    // 全部的菜单项
    menuItems,
    // 不同类型节点上面可以进行的操作
    nodeContextMenuMap,
    // 右键菜单坐标位置
    x: 0,
    y: 0,
    // 每个具体node的ContextMenu
    nodeMenuItems: [],
    // node的model数据
    nodeModel: null
  }
}

const parseItemList = (menuItems, menuItemMap) => {
  return menuItems.map((item, idx) => {
    let key = item
    const base = {
      key: item
    }

    if (item === 'divider') {
      base.key = `divider-${idx}`;
      base.isDivider = true;
    }

    // 处理二级菜单
    if (!isString(key) && key['items']) {
      key = item.parent
      base.key = key
      base.children = parseItemList(item.items)
    }

    let menuConfig = menuItemMap[key]

    return merge(base, menuConfig)
  })
}

const generatorMenuItems = (nodeItems, menuItemMap) => {
  const { items: menuItems } = nodeItems
  return {
    menuItems: parseItemList(menuItems, menuItemMap)
  }
}

const createModel = (id, config, store) => {

  const self = buildModel({
    ...initState(config),

    show(model) {
      const { clientX, clientY, codeName } = model
      self.x = clientX
      self.y = clientY

      // 根据codeName获取items
      const nodeItems = self.nodeContextMenuMap[codeName] || self.nodeContextMenuMap['common']

      if (!nodeItems) {
        console.warn(codeName, self.nodeContextMenuMap)
        return
      }

      const { onShow } = nodeItems

      // 获取具体节点上可以显示的items
      const { menuItems } = generatorMenuItems(nodeItems, self.menuItems)
      // 显示之前调用接口查询是否展示菜单
      if (onShow) {
        onShow(model).then((visible) => {
          if (visible) {
            self.visible = true
          }
        })
      } else {
        // 没有设置onShow则直接显示 
        self.visible = true
      }

      self.nodeModel = model

      // 设置每个具体节点上可以显示的menuItems
      self.nodeMenuItems = menuItems
    },
    hide() {
      self.visible = false
      self.nodeMenuItems.length = 0
      self.nodeModel = null
    },

    // 这里再initStore时执行
    setupEvent(EventCenter) {

      const { eventEnum } = EventCenter

      EventCenter.addGroup({
        key: 'store:node-contextmenu',
        targetKey: 'store',
        eventMap: {
          [eventEnum.nodeContextMenu]: 'onNodeContextMenu',
          // [eventEnum.canvasContextMenu]: 'onNodeContextMenu'
        },
        handlers: {
          onNodeContextMenu(...args) {
            self.show(...args)
          },
        }
      });

    },
    // 这里在addInstance时会执行
    enableEvent(uuid, eventCenter) {
      eventCenter.enableGroup(uuid, 'store', [
        'store:node-contextmenu'
      ])
    },
    // 这里在destroyInstance时会执行
    disableEvent(uuid, eventCenter) {
      eventCenter.disableGroup(uuid, 'store', [
        'store:node-contextmenu'
      ])
    }
  })
  return self
}



export default createModel


