// 这里引入dom相关的
// export * from './domUtils';

// 这里引入纯函数
// export * from './fnUtils';

// 多层proxy
// export * from './proxy';

// 业务
// export * from './pai';

// 动态加载
// export * from './dynamicLoad';

// 数字转字符串,并添加千分位
export function addSeparator(num) {
  return (num || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g,'$1,');
}

// 停止冒泡
export const stopEvent = (e) => {
  if (e.preventDefault) {
    e.preventDefault();
    e.stopPropagation();
  } else {
    console.warn(e,'is not event');
  }
};

// 获取文字宽度
export function getTextRenderWidth(text) {
  const div = document.createElement('div');

  div.style.position = 'absolute';
  div.style.visibility = 'hidden';
  div.style.height = 'auto';
  div.style.width = 'auto';
  div.style['white-space'] = 'nowrap';

  document.body.appendChild(div);
  const textNode = document.createTextNode(text);
  div.appendChild(textNode);
  const width = div.offsetWidth || div.clientWidth;
  div.removeChild(textNode);
  document.body.removeChild(div);

  return width;
}

// 裁剪指定宽度的字符串
export const getFixedWidthText = (text,targetWidth) => {
  const createContainer = () => {
    const textContainer = document.createElement('div');
    textContainer.style.position = 'absolute';
    textContainer.style.visibility = 'hidden';
    textContainer.style.height = 'auto';
    textContainer.style.width = 'auto';
    textContainer.style['white-space'] = 'nowrap';
    document.body.appendChild(textContainer);
    return textContainer;
  };
  const createTextNode = (textContainer,str) => {
    const textNode = document.createTextNode(str);
    textContainer.appendChild(textNode);
    return textNode;
  };

  const getNodeWidth = node => (node.offsetWidth || node.clientWidth);

  const textContainer = createContainer();
  const textNode = createTextNode(textContainer,text);

  let str = text;
  // Todo: 使用二分查找来减少计算量
  while (str.length > 0) {
    const width = getNodeWidth(textContainer);
    if (width <= targetWidth) {
      break;
    } else {
      str = str.slice(0,-1);
      textNode.textContent = `${str}...`;
    }
  }

  document.body.removeChild(textContainer);
  return str.length < text.length ? `${str}...` : str;
};