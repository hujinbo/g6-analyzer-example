

import React from 'react'
import style from './index.less'
import { Icon, Dropdown, Menu } from 'antd'


const getMenu = (onClick, item) => (
  <Menu onClick={(e) => { onClick(e, item) }}>
    <Menu.Item key="edit" disabled>
      <div className={style.menu}>
        <Icon type="edit" />  编辑
      </div>
    </Menu.Item>
  </Menu >
);


function DocumentItem({ data = {}, active, onClick, onMenuClick }) {
  const { dagId, name } = data;
  const { dagId: activeId } = active;
  const menu = getMenu(onMenuClick, data)
  const isActive = activeId === dagId;
  return (

    <li className={`${style.item} ${isActive ? style.active : ''}`}>
      <span className={`text-overflow ${style.name}`} onClick={() => onClick(data)}>
        {name}
      </span>
      <span className={`${style.right}`}>
        <Dropdown overlay={menu}>
          <span> ... </span>
        </Dropdown>
      </span>
    </li >

  )
}

export default DocumentItem
