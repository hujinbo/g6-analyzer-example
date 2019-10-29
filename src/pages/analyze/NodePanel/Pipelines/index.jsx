import React, { Fragment, Component } from 'react';
// import { connect, injectActions } from 'mickey'
import { Icon, Spin } from 'antd';
import PipelineItem from './Item'
import style from './index.less'


// @injectActions
// @connect(store => ({
//   ...store.intl.gui.pipeline,
//   detail: store.intl.global.workflow.detail,
// }))
class NodePanelContainer extends Component {

  state = {
    size: 'calc(100vh - 48px - 76px )',
    isOpen: false,
  }


  componentDidMount = () => {
    const maxSize = this.canvas ? this.canvas.splitPane.clientHeight - 76 : undefined
    this.setState({
      maxSize
    })
  }


  onMenuClick = (e, item) => {
    const { key } = e;
    const { actions } = this.props;
    // actions.intl.gui.deploy.set({
    //   visible: true,
    //   deployMode: key,
    //   pipeline: item
    // })
  }

  onAdd = () => {
    // const { actions } = this.props;
    // actions.intl.gui.pipeline.show();
  }



  onClick = ({ dagId }) => {
    const { actions, detail = {} } = this.props;
    const { id: workflowId } = detail
    // actions.intl.gui.pipeline.get({ workflowId, dagId });
  }


  renderEmpty = () => {
    return (
      <li className={`${style.item} ${style.empty}`}> 暂无数据  </li>
    )
  }

  render() {
    const { list = [], loading = false, active } = this.props;
    return (
      <Fragment>

        <div className={style.header}>
          <h3 className={style.headerTitle}> pipeline </h3>
          <span className={style.add} onClick={this.onAdd}>
            <Icon type="plus" />
          </span>
        </div>

        <div className={style.body}>
          <Spin spinning={loading}>
            <ul className={style.list}>
              {
                list.length > 0 ? list.map(item => (
                  <PipelineItem
                    data={item}
                    key={item.dagId}
                    active={active}
                    onMenuClick={this.onMenuClick}
                    onClick={this.onClick} />
                )) : this.renderEmpty()
              }
            </ul>
          </Spin>
        </div>

      </Fragment>
    );
  }
}

export default NodePanelContainer
