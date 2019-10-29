

export default {
  demo: {
    key: 'demo',
    lable: '样例 中文',
    icon: 'example',
    visible: (item) => {
      // 同步返回bool值, 因为页面需要第一时间渲染出菜单
      // 没有配置时默认为显示
      return true
    },
    disabled: (item) => {
      // 为了支持后端异步结果决定是否可用, 这里返回一个 Promise. 
      // resolve之前 自动会转菊花, 
      // 这里面应该只有一个逻辑分支, 保证单一职责
      // 如果要写if else 请新写一个 key
      return new Promise((resovle, reject) => {
        resovle(true || false)
      })
    },
    onClick: (item, key) => {
      // 这里处理点击事件 
      // 建议触发事件, 再store监听处理
    }
  },



  // 重命名和注释
  edit: {
    label: '重命名和注释',
    icon: 'edit',
    visible: (item) => {
      // 同步返回bool值,没有配置时默认为显示
      return true
    },
    disabled: (item) => {
      return new Promise((resovle, reject) => {
        resovle(false)
      })
    },
    onClick: (item, action, key) => {
      // 这里处理点击事件 可以放到redux中统一处理.
    }
  },

  // 复制
  copy: {
    label: '复制',
    icon: 'copy',
    visible: (item) => {
      // 同步返回bool值,没有配置时默认为显示
      return true
    },
    disabled: (item) => {
      return new Promise((resovle, reject) => {
        resovle(false)
      })
    },
    onClick: (item, action, key) => {
      // 这里处理点击事件 可以放到redux中统一处理.
    }
  },

  // 删除
  delete: {
    key: 'delete',
    label: '删除',
    icon: 'delete',
    visible: (item) => {
      // 同步返回bool值,没有配置时默认为显示
      return true
    },
    disabled: (item) => {
      return new Promise((resovle, reject) => {
        resovle(false)
      })
    },
    onClick: (item, action, key) => {
      // 这里处理点击事件 可以放到redux中统一处理.
    }
  },

  // 执行该节点
  execute: {
    label: '执行该节点',
    icon: 'play-circle',
    visible: (item) => {
      // 同步返回bool值,没有配置时默认为显示
      return true
    },
    disabled: (item) => {
      return new Promise((resovle, reject) => {
        resovle(false)
      })
    },
    onClick: (item, action, key) => {
      // 这里处理点击事件 可以放到redux中统一处理.
    }
  },

  // 从该节点开始执行
  executeFrom: {
    label: '从此处开始执行(from)',
    icon: 'logout',
    visible: (item) => {
      // 同步返回bool值,没有配置时默认为显示
      return true
    },
    disabled: (item) => {
      return new Promise((resovle, reject) => {
        resovle(false)
      })
    },
    onClick: (item, action, key) => {
      // 这里处理点击事件 可以放到redux中统一处理.
    }
  },
  // 从该节点开始执行
  executeTo: {
    label: '执行到此处(to)',
    icon: 'login',
    visible: (item) => {
      // 同步返回bool值,没有配置时默认为显示
      return true
    },
    disabled: (item) => {
      return new Promise((resovle, reject) => {
        resovle(false)
      })
    },
    onClick: (item, action, key) => {
      // 这里处理点击事件 可以放到redux中统一处理.
    }
  },


  // 日志
  log: {
    label: '日志',
    icon: 'zoom-in',
    visible: (item) => {
      // 同步返回bool值,没有配置时默认为显示
      return true
    },
    disabled: (item) => {
      return new Promise((resovle, reject) => {
        resovle(false)
      })
    },
    onClick: (item, action, key) => {
      // 这里处理点击事件 可以放到redux中统一处理.
    }
  },



}