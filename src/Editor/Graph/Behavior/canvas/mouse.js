/*
 * @Author: moyee
 * @Date: 2019-01-28 19:15:23
 * @LastEditors: moyee
 * @LastEditTime: 2019-01-28 19:20:39
 * @Description: Canvas画布上面mouseenter、mousemove、mouseover等事件的behavior
 */
import G6 from '@antv/g6'

G6.registerBehavior('focus-canvas', {
  getEvents() {
    return {
      'canvas:mouseenter': 'onFocusCanvas',
      'canvas:mouseover': 'onFocusCanvas',
      'nocanvasde:mousemove': 'onFocusCanvas'
    }
  },
  onFocusCanvas(evt) {
    const graph = this.get('graph')
    graph.attr('cursor', 'default')
  }
})