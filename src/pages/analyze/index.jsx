

import React, { Component } from 'react';
import EditorPanel from './Editor'
import NodeConfigPanel from './NodeConfigPanel'
import contextMenuCfg from './ContextMenu'

import Editor from '@antv/g6-editor';
import { EditorWrapper } from '@antv/g6-editor/Components'

import style from './index.less'
import '@/style/index.less'

// 注册Store
import './Store'

const { InstanceManager, view } = Editor

const modes = {
  default: [
    'canvas-click',
    'node-select',
    {
      type: 'drag-node',
      enableDelegate: false
    },
    'analyzer-node-hover',
    'edge-hover',
    'pai-edge-select',
    'drag-canvas',
    'node-contextmenu',
    'keyboard-select',
    'double-finger-drag-canvas'
  ]
}

export const getContainerSize = () => {
  const { clientWidth, clientHeight } = window.document.documentElement
  return {
    node: {
      width: 290,
      height: clientHeight
    },
    config: {
      width: 290,
      height: clientHeight
    },
    dag: {
      width: clientWidth,
      height: clientHeight - 105
    },
    window: {
      width: clientWidth,
      height: clientHeight
    }
  }
}

const toolbarItems = [
  'zoom-in', 
  'zoom-out', 
  'zoom-real',
  'zoom-auto'
]
class GeabaseEditor extends Component {

  constructor(props) {
    super(props);
    const { id = 'analyze' } = props;
    window.ins = InstanceManager
    this.store = InstanceManager.initStore(
      id, {
        // nodeItem: algoData,
        graphStore: {},
        toolbar: { visible: toolbarItems },
        // tooltip: {},
        contextMenu: contextMenuCfg
      }
    )

    this.model = InstanceManager.getModel(id, 'graphStore')
  }

  componentDidUpdate() {
    if(!this.editor) {
      const { id } = this.props
      this.editor = InstanceManager.getEditor(id)
      const initData = this.model.initData
      if(initData) {
        this.editor.render(initData)
      }
    }
  }

  generateNode = (modelData) => {
    let nodeData = modelData
    const { codeName } = nodeData

    const nodeId = codeName + Math.random().toString().slice(2)

    const newNode = {
      ...nodeData,
      id: nodeId,
      shape: 'circle-node',
      // anchors: {
      //   input: input.map((anchor, idx) => ({
      //     ...anchor,
      //     shape: 'dag-anchor',
      //     id: nodeId + '_input_' + idx
      //   })),
      //   output: output.map((anchor, idx) => ({
      //     ...anchor,
      //     shape: 'dag-anchor',
      //     id: nodeId + '_output_' + idx
      //   }))
      // }
    }
    return newNode
  }

  generateEdge = (target, source, targetAnchor = {}, sourceAnchor = {}) => {
    // model
    const edge = {
      id: `${source.id}_link_${target.id}`,
      source: `${source.id}`,
      sourceAnchor: `${sourceAnchor.id}`,
      sourceMeta: {
        codeName: source.codeName,
        sequence: sourceAnchor.sequence,
        resourceType: sourceAnchor.resourceType,
      },
      target: `${target.id}`,
      targetAnchor: `${targetAnchor.id}`,
      targetMeta: {
        codeName: target.codeName,
        sequence: targetAnchor.sequence,
        resourceType: targetAnchor.resourceType,
      },
      shape: 'pai-edge',
    };

    return edge
  }

  render() {

    const { viewDagId = 'analyze' } = this.props;
    // this.editor = InstanceManager.getEditor(viewDagId)
    // console.log(this.editor)
    const size = getContainerSize()
    const graphCfg = {
      linkCenter: false,
      animate: true
      // layout: {
      //   type: 'radial',
      //   center: [500, 300],
      //   maxIteration: 200,
      //   focusNode: null,
      //   unitRadius: 120,
      //   linkDistance: 100,
      //   preventOverlap: true,
      //   nodeSize: 20
      // },
    }
    return (
      <EditorWrapper
        size={size}
        modes={modes}
        id={viewDagId}
        graphCfg={graphCfg}
        generateNode={this.generateNode}
        generateEdge={this.generateEdge}
      >
        <div className={style.main}>
          {/* <div className={style.left}>
            <NodePanel
              id={viewDagId}
            />
          </div> */}
          <div className={style.dag}>
            <EditorPanel
              id={viewDagId}
              size={size}
            />
          </div>
          {/* <div className={style.right}>
            
          </div> */}
          <NodeConfigPanel
              id={viewDagId}
            />
        </div>

        {/* <DragLayer>
          <Node />
        </DragLayer> */}
      </EditorWrapper>
    );
  }
}


export default view(GeabaseEditor)