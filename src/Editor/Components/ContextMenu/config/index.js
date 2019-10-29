import { merge, isString } from 'lodash'

const delCodeNameVersion = (codeName = '') => {
  // CodeName后面会包含 _1,_2 这样的版本号, 需要去除掉后再对比.
  return codeName.replace(/_\d+$/, '').toLowerCase();
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

const getConfig = (item, algoMenuMap, menuItemMap) => {
  // TODO codeName -> shape 测试使用
  const { codeName: verisonedCodeName } = item;
  const codeName = delCodeNameVersion(verisonedCodeName)
  const config = algoMenuMap[codeName]
  if (config) {
    const { items: menuItems, onShow } = config
    return {
      items: parseItemList(menuItems, menuItemMap),
      onShow,
    }
  } else {
    return null
  }

}

export default getConfig