import G6 from '@antv/g6';
import { stopEvent } from '@/common/utils';

G6.registerBehavior('node-contextmenu', {
  getEvents() {
    return {
      'node:contextmenu': 'onClick'
    };
  },

  onClick(e) {
    stopEvent(e)
    const graph = this.graph;

    const autoPaint = graph.get('autoPaint');
    graph.setAutoPaint(false);


    graph.clearSelect()
    const stateKey = graph.getStateKey('node', 'select')
    graph.setItemState(e.item, 'selected', true)

    graph.setAutoPaint(autoPaint);
    graph.paint();
    return false;
  }
});
