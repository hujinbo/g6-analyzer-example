/*
 * @Author: moyee
 * @Date: 2019-01-28 10:11:38
 * @LastEditors: moyee
 * @LastEditTime: 2019-07-01 15:02:30
 * @Description: hover节点的behavior
 */
import G6 from '@antv/g6';

G6.registerBehavior('node-hover', {
  getEvents() {
    return {
      'node:mouseenter': 'onNodeHover',
      'node:mouseover': 'onNodeHover',
      'node:mouseout': 'onNodeUnHover',
      'node:mouseleave': 'onNodeUnHover',
    };
  },
  onNodeHover(e) {
    const { item } = e;
    const graph = this.graph;

    const stateKey = graph.getStateKey('node', 'hover');
    const selecteKey = graph.getStateKey('node', 'select')

    const hasSelected = item.hasState(selecteKey)
    if(!hasSelected) {
      graph.setItemState(item, stateKey, true)
    }

    this.graph.cursor('pointer')
  },
  onNodeUnHover(evt) {
    const { item } = evt
    const graph = this.graph;
    
    const stateKey = graph.getStateKey('node', 'hover');
    const selecteKey = graph.getStateKey('node', 'select')

    const hasSelected = item.hasState(selecteKey)
    if(!hasSelected) {
      graph.setItemState(item, stateKey, false)
    }

    this.graph.cursor()
  }
});
