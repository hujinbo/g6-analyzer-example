import React, { Component } from 'react'
import { Menu } from 'antd'
import eventEnum from '../../../EventCenter/constant'
import MenuItem from './MenuItem'
import SubMenu from './SubMenu'
import InstanceManager from '../../../InstanceManager';

const Divider = Menu.Divider;

class ContextMenu extends Component {

  handleClick = (item, conf = {}) => {
    const { onClick } = conf;
    console.log(conf)
    const { target, actions, instanceId } = this.props;
    const editor = InstanceManager.getEditor(instanceId)
    if (onClick) {
      const instance = InstanceManager.getInstance(instanceId)
      onClick(instance, target)
    } else {
      editor.executeCommand(item.key, target)
      const graph = editor.getGraph()
      graph.emit(eventEnum.contextMenuItem, { key: item.key, item: target, option: conf })
    }
    actions.hide()
  }

  renderMenuItems = (menuItems = []) => {
    const { node } = this.props;

    return (
      menuItems.map((conf, idx) => {
        const { key } = conf
        // 二级目录
        if (conf.children) {
          return (
            <SubMenu
              node={node} conf={conf} key={key}
            >
              {this.renderMenuItems(conf.children)}
            </SubMenu>
          )
        }

        // 分割线
        if (conf.isDivider) {
          return (<Divider key={key} />)
        }

        // menu 子节点
        return (
          <MenuItem key={key} node={node} conf={conf}
            onClick={(item) => this.handleClick(item, conf)} />
        )

        // TODO: GroupMenu 
      })
    )
  }

  render = () => {
    const { items: menuItems = [] } = this.props;

    return (
      <Menu
        style={{ width: 200 }}
        mode="vertical"
      >
        {this.renderMenuItems(menuItems)}
      </Menu>
    )
  }
}

export default ContextMenu