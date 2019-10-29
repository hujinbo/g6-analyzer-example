import React from 'react'
import { useState, useEffect, useMemo } from 'react';
import { Menu } from 'antd';
import Label from './Label'
import { isFunction, isBoolean } from 'lodash'

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







function SmartMenuItem(props) {
  const { conf, node, ...rst } = props;
  if (!conf) {
    return null;
  }
  const { key, icon, label, visible: visibleFn, disabled: disableFn } = conf;

  // 是否可见的逻辑是同步的,为了直接渲染出来.
  // useMemo 在visibleFn, node变化时才重新计算.
  const visible = useMemo(() => getBool(visibleFn, node), [visibleFn, node]);

  if (!visible) {
    return null;
  }

  let disabled;
  let loading;

  if (isFunction(disableFn)) {
    const ret = usePromise(disableFn, node);
    disabled = ret.disabled
    loading = ret.loading
  }


  return (
    <Menu.Item key={key} {...rst} disabled={disabled} width="233" >
      <Label icon={icon} label={label} disabled={disabled} loading={loading} />
    </Menu.Item>
  )
}

export default SmartMenuItem
