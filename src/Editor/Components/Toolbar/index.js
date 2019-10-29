import React, { Component } from 'react'

import { Icon, Tooltip } from 'antd'
import { view } from 'react-easy-state'
import _ from 'lodash'

import InstanceManager from '../../InstanceManager';
import styles from './index.less'
import selectIcon from './icons/group'
import originRatio from './icons/originRatio'
import autoScaleIcon from './icons/scale'

const iconMap = {
  // 执行相关
  executeNode: 'play-circle',
  executeFromNode: 'logout',
  executeToNode: 'login',
  stopNodeExecution: 'pause-circle',
  // 群组
  addGroup: 'usergroup-add',
  unGroup: 'usergroup-delete',
  // 保存

  saveAll: 'save',
  // 缩放
  'zoom-auto': autoScaleIcon,
  'zoom-real': originRatio,
  'toogle-grid': 'border-inner',
  'select': selectIcon,

};

const parseIcon = (item) => {
  const { key } = item;
  if (key === 'paste') {
    return 'diff'
  }
  return iconMap[key] || key
};

const fontStyle = {
  fontSize: '14px',
  color: 'rgba(0,0,0, .65)',
}

const SvgIcon = ({ type }) => {
  if (_.isString(type)) {
    return <Icon type={type} />
  }
  return <Icon component={type} style={{ fontStyle }} />
}


class Toolbar extends Component {
  constructor(props) {
    super(props);
    const { id } = props;
    this.model = InstanceManager.getModel(id, 'toolbar')
    this.actions = InstanceManager.getActions(id)
  }


  handleClick = (evt, item) => {
    const { id } = this.props;
    const editor = InstanceManager.getEditor(id)
    const graph = editor.getGraph()
    const nodes = graph.getSelect('node', true);
    const node = nodes.length ? nodes[0] : undefined
    if (editor) {
      const model = node ? node.get('model'):null
      editor.executeCommand(item.command, model)
    }
  };


  render() {
    const { list: cmds = [] } = this.model

    return (
      <div className={`${styles.toolbar} g6-editor-toolbar`} tabIndex="0">
        {
          cmds.map(cmd => {
            const clz = `
              ${styles.command}
              ${cmd.status ? '' : styles.disable}
            `;

            return (

              <span
                className={clz}
                key={cmd.key}
                onClick={(evt) => (
                  cmd.status && this.handleClick(evt, cmd)
                )}
              >
                <Tooltip title={cmd.tips} placement="bottom">
                  <span className={styles.icon}>
                    <SvgIcon type={parseIcon(cmd)} />
                  </span>
                </Tooltip>
              </span>
            )
          })
        }
      </div >
    )
  }
}

export default view(Toolbar)
