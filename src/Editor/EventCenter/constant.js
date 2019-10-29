// import editorEnum from './events/editor'
// import reduxEnum from './events/redux'
// import graphEnum from './events/graph'


// command执行
export const commandEnum = {
  saveAll: 'cmd:saveAll',
  saveDag: 'cmd:saveDag',
  saveParams: 'cmd:saveParams',
  rename: 'cmd:renameNode',
  showLog: 'cmd:showNodeLog',

  executeTo: 'cmd:executeToNode',
  executeNode: 'cmd:executeNode',
  executeFrom: 'cmd:executeFromNode',
  executeAll: 'cmd:executeAll',
  stopNodeExecution: 'cmd:stopNodeExecution',

  // command执行后
  afterCmdExec: 'cmd:afterExec'
}

export const editorEnum = {
  afterEditorRender: 'editor:afterRender',
  beforeEditorRender: 'editor:beforeRender',

  editorReady: 'editor:ready',
  editorUnload: 'editor:destroy',
  editorDataReload: 'editor:dataChange',
  refreshToolbar: 'editor:refreshToolbar',
}


// 图上事件
export const graphEnum = {
  nodeClick: 'node:click',
  edgeClick: 'edge:click',
  nodeDbClick: 'node:dblclick',
  canvasClick: 'canvas:click',
  selectChange: 'graph:selectChange',
  dagModify: 'dag:modify',
  nodeAdd: 'dag:addNode',
  nodeDel: 'dag:delNode',
  edgeAdd: 'dag:addEdge',
  edgeDel: 'dag:delEdge',
  nodeModify: 'dag:nodeModify',
  anchorMouseEnter: 'anchor:mouseenter',
  anchorMouseLeave: 'anchor:mouseleave',
  // edge mouse
  edgeMouseEnter: 'edge:mouseenter',
  edgeMouseLeave: 'edge:mouseleave',
  // 群组select
  groupClick: 'group:click',
  multiSelect: 'node_edge:multi_select',
  nodeContextMenu: 'node:contextmenu',
  canvasContextMenu: 'canvas:contextmenu',
  contextMenuItem: 'contextmenuItem:click'
}

// G6事件
const g6Enum = {
  afterItemAdd: 'aftereadditem',
  afterItemRemove: 'afterremoveitem',
  beforeItemRemove: 'beforeremoveitem',
}



const storeEnum = {
  reloadDag: 'store:reloadData',
  modifyNode: 'store:modifyNode',
  updateStatus: 'store:dagStatusChange',
  batchUpdateItemStatus: 'store:batchUpdateItemStatus'
  // clearStatus: 'store:dagStatusClear',
}



export default new Proxy(
  {
    ...g6Enum,
    ...editorEnum,
    ...commandEnum,
    ...storeEnum,
    ...graphEnum,
  },
  {
    get: function (target, key) {
      // An extra property

      if (!target[key]) {
        console.error(`${key} is not define in enum, only above key is valid`)
        console.warn(JSON.stringify(Object.keys(target), null, 4))
        return '';
      }

      return target[key];
    }
  }
)


