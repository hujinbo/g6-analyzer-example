/*
 * @Author: moyee
 * @Date: 2019-01-31 13:44:46
 * @LastEditors: moyee
 * @LastEditTime: 2019-07-16 15:57:19
 * @Description: Editor组件的顶层容器
 */
import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd'
import _ from 'lodash';

import HTML5Backend from 'react-dnd-html5-backend'
import InstanceManager from '../../InstanceManager'
import RefContext from './Context'

import EditorToolTip from '../Tooltip'
import EditorConextMenu from '../ContextMenu'

const pluginsList = [
  { model: 'tooltip', Component: EditorToolTip },
  { model: 'contextMenu', Component: EditorConextMenu }
]

const defaultModes = {
  default: [
    'node-select',
    'node-hover',
    'node-drag',
    'edge-select',
    'anchor-drag-edge',
    'anchor-hover',
    'drag-canvas',
  ],
}

class G6EditorWrapper extends Component {
  constructor(props) {
    super(props);
    this.setCanvasRef = (ref) => {
      this.setState(state => ({
        mount: true,
        ref: ref
      }));
    };

    this.state = {
      ref: null,
      mount: false,
      setCanvasRef: this.setCanvasRef,
    };

    // 用于判断是否配置了tooltip和contextMen，如果配置了则渲染组件，否则不渲染
    const { id } = props;
    this.initPlugins(id)
  }

  initPlugins = (id) => {
    this.plugins = pluginsList.filter(({ model }) => {
      // 过滤掉没有声明Model的插件
      return !!InstanceManager.getModel(id, model)
    })
  }

  componentDidUpdate(prevProps, prevState) {

    if (prevState.mount === false && this.state.mount === true) {
      const {
        id, size, options, graphCfg,
        contextMenuCfg,
        modes = defaultModes,
        generateNode, generateEdge,
        getNodeParam,
        onResize,
        eventGroup,
      } = this.props;
      const { ref } = this.state
      // const { clientWidth, width, clientHeight, height } = ref
      const { width, height } = size.dag

      const conf = _.merge(
        {
          id,
          uuid: id,
          graphCfg: {
            container: ref,
            width: width,
            height: height,
            modes: modes,
            ...graphCfg,
          },
          eventGroup,
          contextMenuCfg
        },
        options
      )

      const instanceMap = InstanceManager.addEditorInstance(id, conf);
      const { editor } = instanceMap

      editor.getNodeParam = getNodeParam
      editor.generateNode = generateNode
      editor.generateEdge = generateEdge
      if (onResize) {
        window.addEventListener('smartResize', onResize)
      }
    }

  }



  componentWillUnmount() {
    const { id, onResize } = this.props;
    InstanceManager.destroyInstance(id);
    if (onResize) {
      window.removeEventListener('smartResize', onResize)
    }
  }

  renderPlugins = (id) => {
    return (
      this.plugins.map(({ Component, model }) => (
        <Component id={id} key={model} />
      ))
    )
  }

  render() {
    const { children, styles, id } = this.props
    return (
      <RefContext.Provider value={this.state}>
        <div style={styles}>
          {
            children
          }
        </div>
        {
          this.renderPlugins(id)
        }
      </RefContext.Provider>
    );
  }
}

export default DragDropContext(HTML5Backend)(G6EditorWrapper)