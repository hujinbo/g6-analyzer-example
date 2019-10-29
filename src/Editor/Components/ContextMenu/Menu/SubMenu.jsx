import React from 'react'
import { useState, useEffect, useMemo } from 'react';
import { Menu } from 'antd';
import Label from './Label'
import { isFunction, isBoolean } from 'lodash'


const SubMenu = Menu.SubMenu;


const getBool = (item, node) => {
  if (isFunction(item)) {
    return item(node)
  }

  if (isBoolean(item)) {
    return item
  }

  return true
}




function usePromise(service, node) {

  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);

  //  解决unmount后还setState的问题.
  let isMounted;

  useEffect(() => {
    isMounted = true;
    setLoading(true);
    setDisabled(true);
    // 异步调用
    service(node).then((result) => {
      if (isMounted) {
        setLoading(false);
        setDisabled(result);
      }
    });
    //  unmount 时调用,防止unmount后还setState
    return () => {
      isMounted = null;
    };

  }, [service, node]);  // service, node 变化时才调用

  return {
    disabled,
    loading
  };
}


function SmartSubMenu(props) {
  const { conf, node, children, ...rst } = props;

  // 处理异常
  if (!conf) {
    return null;
  }

  // 解构数据
  const { key, icon, label, visible: visibleFn, disabled: checkDisableFn } = conf;

  // 是否可见的逻辑是同步的,为了直接渲染出来.
  const visible = useMemo(() => getBool(visibleFn, node), [visibleFn, node]);

  if (!visible) {
    return null;
  }

  let disabled;
  let loading;

  if (isFunction(checkDisableFn)) {
    const ret = usePromise(checkDisableFn, node);
    disabled = ret.disabled
    loading = ret.loading
  }

  return (
    <SubMenu
      width="233"
      key={key}
      disabled={disabled}
      title={
        <Label icon={icon} label={label} disabled={disabled} loading={loading} />
      }
      {...rst}
    >
      {children}
    </SubMenu>
  )
}

export default SmartSubMenu




