import G6 from '@antv/g6';
import { stopEvent } from '@/common/utils';


G6.registerBehavior('node-select', {
  getDefaultCfg() {
    return {
      multiple: true,
      keydown: false,
    };
  },
  getEvents() {
    return {
      'node:click': 'onClick',
      'keyup': 'onKeyUp',
      'keydown': 'onKeyDown'
    };
  },
  onClick(e) {
    console.log(e)
    const self = this;
    const item = e.item;
    const graph = self.graph;

    const autoPaint = graph.get('autoPaint');
    graph.setAutoPaint(false);

    // 多选
    if (!(self.keydown && self.multiple)) {
      graph.clearSelect()
    }



    const stateKey = graph.getStateKey('node', 'select');
    graph.setItemState(item, stateKey, true)


    stopEvent(e);
    graph.setAutoPaint(autoPaint);
    graph.paint();

  },
  onKeyDown(e) {
    const code = e.keyCode || e.which;
    if (code === 16) {
      this.keydown = true;
    }
  },
  onKeyUp(e) {
    const code = e.keyCode || e.which;
    if (code === 16) {
      this.keydown = false;
    }
  }
});
