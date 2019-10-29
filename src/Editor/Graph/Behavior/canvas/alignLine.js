/*
 * @Author: moyee
 * @Date: 2019-05-31 16:27:53
 * @LastEditors: moyee
 * @LastEditTime: 2019-05-31 21:01:58
 * @Description: 控制网格线的Behavior
 */
import G6 from '@antv/g6';

G6.registerBehavior('drag-node-with-alignline', {
  getEvents() {
    return {
      'node:dragstart': 'onDragStart',
      'node:drag': 'onDrag',
      'node:dragend': 'onDragEnd'
    };
  },
  onDragStart() {
    const graph = this.graph
    const editor = graph.getEditor()
    const alignLine = editor.getAlignline()
    alignLine.initBoxLine()
  },
  onDrag(e) {
    const { item } = e
    // 计算辅助线位置,拖动过程中更新辅助线
    const graph = this.graph
    const editor = graph.getEditor()
    const alignLine = editor.getAlignline()
    const delegateShape = item.get('delegateShape')
    if(!delegateShape) {
      return false
    }
    const bbox = delegateShape.getBBox()
    const dx = e.x - bbox.x
    const dy = e.y - bbox.y

    alignLine.show({
      x: bbox.minX + dx,
      y: bbox.minY + dy
    }, {
      width: bbox.width,
      height: bbox.height
    })
  },
  onDragEnd() {
    const graph = this.graph
    const editor = graph.getEditor()

    // 拖动结束时候删除辅助线
    const alignLine = editor.getAlignline()
    alignLine.destory()
  }
})