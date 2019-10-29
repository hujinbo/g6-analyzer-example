import React from 'react'
import { useState, useEffect, useMemo } from 'react';
import { Menu } from 'antd';
import Label from './Label'
import { isFunction, isBoolean } from '../../utils'




const getBool = (item, node) => {
  if (isFunction(item)) {
    return item(node)
  }
  if (isBoolean(item)) {
    return item
  }
  return true
}




function getPromise(service, node) {

  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);

  //  解决unmount后还setState的问题.
  let isMounted;

  useEffect(() => {
    isMounted = true;
    setLoading(true);

    service(node).then((result) => {
      if (isMounted) {
        setLoading(false);
        setDisabled(result);
      }
    });

    return () => {
      // unmount 时调用
      isMounted = null;
    };
    // service, node 变化时才调用
  }, [service, node]);

  return {
    disabled,
    loading
  };
}







function SmartMenuItem(props) {
  const { conf, node, ...rst } = props;
  if (!conf) {
    return null;
  }
  const { key, icon, label, visible: visibleFn, disabled: disableFn } = conf;
  // const [disabled, setDisabled] = useState(false);
  // const [loading, setLoading] = useState(false);

  // 是否可见的逻辑是同步的,为了直接渲染出来.
  const visible = useMemo(() => getBool(visibleFn, node), [visibleFn, node]);

  if (!visible) {
    return null;
  }

  // useEffect(() => {
  //   isMounted = true;
  //   // 是否取消disable
  //   if (isFunction(disableFn)) {
  //     setLoading(true)
  //     setDisabled(true)
  //     disableFn().then((bool) => {
  //       console.log(bool)
  //       setLoading&&setLoading(false)
  //       setDisabled&&setDisabled(bool)
  //     })
  //   }
  // },[node,conf]);
  let disabled;
  let loading;

  if (isFunction(disableFn)) {
    const ret = getPromise(disableFn, node);
    disabled = ret.disabled
    loading = ret.loading
  }


  return (
    <Menu.Item key={key} {...rst} disabled={disabled} >
      <Label icon={icon} label={label} disabled={disabled} loading={loading} />
    </Menu.Item>
  )
}

export default SmartMenuItem
