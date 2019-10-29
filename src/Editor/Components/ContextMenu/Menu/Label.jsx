import React from 'react'
import { Icon } from 'antd';


const Label = ({ icon, label, disabled, loading }) => {

  const cls = `context-menu-content ${disabled ? 'disabled' : ''}`
  return (
    <div className={cls}>
      {loading ? <Icon type="loading" /> : <Icon type={icon} />}
      <span className="text-overflow contextmenu-item">
        {label}
      </span>

    </div>
  )
}

export default Label
