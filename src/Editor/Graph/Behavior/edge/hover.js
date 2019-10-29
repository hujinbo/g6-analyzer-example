/*
 * @Author: moyee
 * @Date: 2019-02-15 14:23:41
 * @LastEditors: moyee
 * @LastEditTime: 2019-07-18 11:43:52
 * @Description: edge的hover behavior行为
 */
import G6 from '@antv/g6'
import _ from 'lodash';


G6.registerBehavior('edge-hover', {
  getEvents() {
    return {
      'edge:mouseenter': 'onMouseEnter',
      'edge:mouseout': 'onMouseOut'
    };
  },
  /**
   * 鼠标hover到线上的效果
   *
   * @param {object} e
   */
  onMouseEnter(e) {
    const { item } = e
    const graph = this.graph
    const autoPaint = graph.get('autoPaint')
    graph.setAutoPaint(false)

    const hoverKey = graph.getStateKey('edge', 'hover')
    graph.setItemState(item, hoverKey, true)

    graph.paint()
    graph.setAutoPaint(autoPaint)
    graph.cursor('pointer')

  },
  /**
   * 鼠标移出去以后，取消hover效果
   */
  onMouseOut(evt) {
    const { item } = evt
    const graph = this.graph
    const autoPaint = graph.get('autoPaint')
    graph.setAutoPaint(false)

    const hoverKey = graph.getStateKey('edge', 'hover')
    graph.setItemState(item, hoverKey, false)

    const stateKey = graph.getStateKey('edge', 'select')

    const hasSelected = item.hasState(stateKey)
    if(!hasSelected) {
      graph.setItemState(item, stateKey, false)
    }

    graph.cursor('default')
    graph.paint()
    graph.setAutoPaint(autoPaint)
  }
});