import { merge, isString } from 'lodash'

export default class ItemGroup {
  getDefaultCfg() {
    return {
      rect: {
        lineWidth: 1,
        stroke: '#A3B1BF',
        radius: 10,
        lineDash: [5, 5],
        strokeOpacity: 0.92,
        fill: '#F3F9FF',
        fillOpacity: 0.8,
        opacity: 0.8,
        // 收起状态样式
        collapse: {
          width: 130,
          height: 31,
          lineDash: null,
          stroke: '#000'
        }
      },
      icon: 'https://gw.alipayobjects.com/zos/rmsportal/MXXetJAxlqrbisIuZxDO.svg',
      text: {
        text: '新建群组',
        stroke: "#444"
      },
      operatorBtn: {
        collapse: {
          img: 'https://gw.alipayobjects.com/zos/rmsportal/uZVdwjJGqDooqKLKtvGA.svg',
          width: 16,
          height: 16
        },
        expand: {
          width: 16,
          height: 16,
          img: 'https://gw.alipayobjects.com/zos/rmsportal/MXXetJAxlqrbisIuZxDO.svg'
        }
      },
      visible: false
    }
  }

  constructor(options = {}) {
    const { cfg = {}, editor } = options
    this.styles = merge(this.getDefaultCfg(), cfg)
    this.editor = editor
    // 创建的群组集合
    this.customGroup = {}
    // 群组初始位置集合
    this.groupOriginBBox = {}
    this.delegateInGroup = {}
  }

  /**
   * 生成群组
   *
   * @memberof ItemGroup
   */
  create(groupId) {
    const graph = this.editor.getGraph()
    const customGroup = graph.get('customGroup')
    const nodeGroup = customGroup.addGroup({
      id: groupId
    })

    const autoPaint = graph.get('autoPaint')
    graph.setAutoPaint(false)

    const { rect, icon, text, operatorBtn } = this.styles
    const nodes = this.editor.getSelected('node')

    // 计算群组左上角左边、宽度、高度及x轴方向上的最大值
    const { x, y, width, height, maxX } = this.calculationGroupPosition(nodes)

    // step 1：绘制群组外框
    const keyShape = nodeGroup.addShape('rect', {
      attrs: {
        ...rect,
        x,
        y,
        width,
        height
      },
      capture: true,
      zIndex: 0,
      groupId: groupId
    })

    nodeGroup.set('keyShape', keyShape)

    // 群组小图标
    nodeGroup.addShape('image', {
      attrs: {
        x: x + 8,
        y: y + 8,
        width: 16,
        height: 16,
        img: icon
      }
    })

    // 群组标题
    nodeGroup.addShape('text', {
      attrs: {
        ...text,
        x: x + 35,
        y: y + 21
      }
    })

    const { expand } = operatorBtn
    // 展开和收起群组的操作按钮，默认展示收起按钮
    nodeGroup.addShape('image', {
      attrs: {
        ...expand,
        x: maxX - 3,
        y: y + 8
      },
      btnType: 'collapse-group',
      imageType: 'operatorBtn'
    })

    // 更新群组及属性样式
    this.setDeletageGroupByRect(groupId, nodeGroup, { width, height, btnOffset: maxX - 3 })

    // step 2：给选中的节点添加groupID
    for (let id of nodes) {
      const current = graph.findById(id)
      graph.updateItem(current, {
        groupId: groupId
      })
    }

    // 生成群组以后，取消之前选中的节点的选中状态
    this.editor.clearSelect()
    
    graph.setAutoPaint(autoPaint)
    graph.paint()
  }

  /** 
   * 根据GroupID计算群组位置，包括左上角左边及宽度和高度
   *
   * @param {object} nodes 符合条件的node集合：选中的node或具有同一个groupID的node
   * @memberof ItemGroup
   */
  calculationGroupPosition(nodes) {
    const graph = this.editor.getGraph()

    const minx = []
    const maxx = []
    const miny = []
    const maxy = []

    // 获取已节点的所有最大最小x y值
    for (let id of nodes) {
      const element = isString(id) ? graph.findById(id) : id
      const bbox = element.getBBox()
      const { minX, minY, maxX, maxY } = bbox
      minx.push(minX)
      miny.push(minY)
      maxx.push(maxX)
      maxy.push(maxY)
    }

    // 从上一步获取的数组中，筛选出最小和最大值
    const minX = Math.floor(Math.min(...minx))
    const maxX = Math.floor(Math.max(...maxx))
    const minY = Math.floor(Math.min(...miny))
    const maxY = Math.floor(Math.max(...maxy))

    let x = minX - 20
    let y = minY - 30
    let width = maxX - minX + 40
    let height = maxY - minY + 40

    return {
      x,
      y,
      width,
      height,
      maxX
    }
  }

  /**
   * 拖动群组里面的节点，更新群组属性样式
   *
   * @param {string} groupId 群组ID
   * @returns
   * @memberof ItemGroup
   */
  updateGroupStyleByNode(groupId) {
    const graph = this.editor.getGraph()
    const customGroup = graph.get('customGroup')
    const groupChild = customGroup.get('children')
    const currentGroup = groupChild.filter(child => child.get('id') === groupId)

    const autoPaint = graph.get('autoPaint')
    graph.setAutoPaint(false)

    // 获取所有具有同一个groupID的节点，计算群组大小
    const nodes = graph.getNodes()
    const groupNodes = nodes.filter(node => {
      const currentModel = node.getModel()
      const gId = currentModel.groupId
      return gId === groupId
    })

    const { x, y, width, height, maxX } = this.calculationGroupPosition(groupNodes)

    const current = currentGroup[0]
    if(!current) {
      return false
    }

    // 更新rect属性样式
    const rect = current.getChildByIndex(0)
    rect.attr('x', x)
    rect.attr('y', y)
    rect.attr('width', width)
    rect.attr('height', height)

    // 更新群组图标属性样式
    const logoIcon = current.getChildByIndex(1)
    logoIcon.attr('x', x + 8)
    logoIcon.attr('y', y + 8)

    // 更新群组名称属性样式
    const text = current.getChildByIndex(2)
    text.attr('x', x + 35)
    text.attr('y', y + 21)

    // 更新收起和展开按钮属性样式
    const operatorBtn = current.getChildByIndex(3)
    operatorBtn.attr('x', maxX - 3)
    operatorBtn.attr('y', y + 8)

    // 更新群组及属性样式
    this.setDeletageGroupByRect(groupId, current, { width, height, btnOffset: maxX - 3 })

    // 更新群组初始位置的bbox
    this.setGroupOriginBBox(groupId, rect.getBBox())

    graph.setAutoPaint(autoPaint)
    graph.paint()
  }

  /**
   * 设置群组初始位置的bbox，使用rect模拟
   *
   * @param {*} groupId
   * @param {*} bbox
   * @memberof ItemGroup
   */
  setGroupOriginBBox(groupId, bbox) {
    this.groupOriginBBox[groupId] = bbox
  }

  /**
   * 获取群组初始位置及每次拖动后的位置
   *
   * @param {string} groupId 群组ID
   * @returns
   * @memberof ItemGroup
   */
  getGroupOriginBBox(groupId) {
    return this.groupOriginBBox[groupId]
  }

  /**
   * 设置群组对象及属性值
   *
   * @param {string} groupId 群组ID
   * @param {Group} deletage 群组元素
   * @param {object} property 属性值，里面包括width、height和maxX
   * @memberof ItemGroup
   */
  setDeletageGroupByRect(groupId, deletage, property) {
    const { width, height, btnOffset } = property
    const customGroupStyle = this.customGroup[groupId]
    if(!customGroupStyle) {
      // 首次赋值
      this.customGroup[groupId] = {
        nodeGroup: deletage,
        groupStyle: {
          width,
          height,
          btnOffset
        }
      }
    } else {
      // 更新时候merge配置项
      const { groupStyle } = customGroupStyle
      const styles = merge({}, groupStyle, property)
      console.log(styles, groupStyle, property)
      this.customGroup[groupId] = {
        nodeGroup: deletage,
        groupStyle: styles
      }
    }
  }

  /**
   * 根据群组ID获取群组及属性对象
   *
   * @param {*} groupId
   * @returns
   * @memberof ItemGroup
   */
  getDeletageGroupByRect(groupId) {
    return this.customGroup[groupId]
  }

  /**
   * 收起群组
   *
   * @param {string} id 群组ID
   * @memberof ItemGroup
   */
  collapseGroup(id) {
    const customGroup = this.getDeletageGroupByRect(id)
    const { nodeGroup } = customGroup
    
    const bbox = nodeGroup.getBBox()
    // 收起群组后的默认样式
    const { rect: rectStyle, operatorBtn } = this.styles
    
    // 更新rect的宽高
    const { width, height } = rectStyle.collapse
    const rect = nodeGroup.getChildByIndex(0)
    rect.attr('width', width)
    rect.attr('height', height)

    // 更新最后一个操作按钮的图标
    const { collapse } = operatorBtn
    const btnImg = nodeGroup.getChildByIndex(3)
    btnImg.attr('img', collapse.img)
    btnImg.set('btnType', 'expand-group')
    btnImg.attr('x', bbox.minX + 110)

    // step1：收起群组后，临时生成一个节点，用于连接群组外部节点
    // step2：查找群组中source和target在群组外的Edge，分别记录source和target
    // step3：对于source在群组外的Edge，遍历更新source为临时生成的节点的ID
    // step4：对于target在群组外的Edge，遍历更新target为临时生成的节点的ID
    const graph = this.editor.getGraph()
    const nodes = graph.getNodes()
    // 获取所有群组中node的id
    const nodesInGroup = nodes.filter(node => {
      const model = node.getModel()
      return model.groupId === id
    }).map(node => {
      const model = node.getModel()
      return model.id
    })

    const edges = graph.getEdges()
    // 获取所有source在群组外，target在群组内的边
    const sourceOutTargetInEdges = edges.filter(edge => {
      const model = edge.getModel()
      return !nodesInGroup.includes(model.source) && nodesInGroup.includes(model.target)
    })

    // 获取所有source在群组外，target在群组内的边
    const sourceInTargetOutEdges = edges.filter(edge => {
      const model = edge.getModel()
      return nodesInGroup.includes(model.source) && !nodesInGroup.includes(model.target)
    })

    // 群组中存在source和target其中有一个在群组内，一个在群组外的情况
    if(sourceOutTargetInEdges.length > 0 || sourceInTargetOutEdges.length > 0) {
      const rectBBox = rect.getBBox()
      // TODO 这里初始化节点信息怎么传进来需要商榷一下
      const options = {
        groupId: id,
        id: `${id}-custom-node`,
        x: rectBBox.minX + width / 2,
        y: rectBBox.minY + height / 2,
        width,
        height,
        shape: 'dag-node',
        anchors: {
          input: [
            {
              shape: 'dag-anchor',
              id: 'custorm-anchor-input',
              xRatio: 0.5,
              yRatio: 0,
              description: '自定义输入锚点'
            }
          ],
          output: [
            {
              shape: 'dag-anchor',
              id: 'custorm-anchor-output',
              xRatio: 0.5,
              yRatio: 1,
              description: '自定义输出锚点'
            }
          ]
        }
      }
      const delegateNode = graph.add('node', options)
      // 这里不隐藏也OK
      delegateNode.hide()
      this.delegateInGroup[id] = {
        delegateNode
      }
  
      this.updateEdgeInGroupLinks(id, sourceOutTargetInEdges, sourceInTargetOutEdges)
    }
  }

  /**
   * 收起群组时生成临时的节点，用于连接群组外的节点
   *
   * @param {string} groupId 群组ID
   * @memberof ItemGroup
   */
  updateEdgeInGroupLinks(groupId,  sourceOutTargetInEdges, sourceInTargetOutEdges) {
    const graph = this.editor.getGraph()

    // 更新source在外的节点
    const edgesOuts = {}
    sourceOutTargetInEdges.map(edge => {
      const model = edge.getModel()
      const { id, target, targetAnchor } = model
      edgesOuts[id] = [target, targetAnchor]
      graph.updateItem(edge, {
        target: `${groupId}-custom-node`,
        targetAnchor: 'custorm-anchor-input'
      })
    })

    // 更新target在外的节点
    const edgesIn = {}
    sourceInTargetOutEdges.map(edge => {
      const model = edge.getModel()
      const { id, source, sourceAnchor } = model
      edgesIn[id] = [source, sourceAnchor]
      graph.updateItem(edge, {
        source: `${groupId}-custom-node`,
        sourceAnchor: 'custorm-anchor-out'
      })
    })

    // 缓存群组groupId下的edge和临时生成的node节点
    this.delegateInGroup[groupId] = merge({
      sourceOutTargetInEdges,
      sourceInTargetOutEdges,
      edgesOuts,
      edgesIn
    }, this.delegateInGroup[groupId])
  }

  /**
   * 点击展示，恢复之前所有边的连线
   *
   * @param {string} groupId 群组ID
   * @returns
   * @memberof ItemGroup
   */
  resetEdgeInGroupLinks(groupId) {
    const graph = this.editor.getGraph()
    const autoPaint = graph.get('autoPaint')
    graph.setAutoPaint(false)

    const delegates = this.delegateInGroup[groupId]
    if(!delegates) {
      return false
    }
    const { sourceOutTargetInEdges,
      sourceInTargetOutEdges, 
      edgesOuts,
      edgesIn,
      delegateNode } = delegates
    
    // 恢复source在外的节点
    sourceOutTargetInEdges.map(edge => {
      const model = edge.getModel()
      const sourceOuts = edgesOuts[model.id]
      graph.updateItem(edge, {
        target: sourceOuts[0],
        targetAnchor: sourceOuts[1]
      })
    })

    // 恢复target在外的节点
    sourceInTargetOutEdges.map(edge => {
      const model = edge.getModel()
      const sourceIn = edgesIn[model.id]
      graph.updateItem(edge, {
        source: sourceIn[0],
        sourceAnchor: sourceIn[1]
      })
    })

    graph.remove(delegateNode)
    delete this.delegateInGroup[groupId]
    graph.setAutoPaint(autoPaint)
    graph.paint()
  }

  /**
   * 展开群组
   *
   * @param {string} id 群组ID
   * @memberof ItemGroup
   */
  expandGroup(id) {
    const customGroup = this.getDeletageGroupByRect(id)
    const { nodeGroup, groupStyle } = customGroup

    const bbox = nodeGroup.getBBox()

    const { width, height } = groupStyle

    const rect = nodeGroup.getChildByIndex(0)
    rect.attr('width', width)
    rect.attr('height', height)

    const { operatorBtn } = this.styles
    const { expand } = operatorBtn
    const btnImg = nodeGroup.getChildByIndex(3)
    btnImg.attr('img', expand.img)
    btnImg.set('btnType', 'collapse-group')
    // 根据群组bbox的x值及群组宽度设置操作按钮位置，常量23用于调节位置
    btnImg.attr('x', bbox.x + width - 23)

    this.resetEdgeInGroupLinks(id)
  }

  /**
   * 拆分群组
   *
   * @memberof ItemGroup
   */
  unGroup() {
    const graph = this.editor.getGraph()
    const group = graph.get('customGroup')
    const groupChild = group.get('children')
    const autoPaint = graph.get('autoPaint')
    graph.setAutoPaint(false)

    const currentGroup = groupChild.filter(child => child.get('selected'))
    if (currentGroup.length > 0) {
      const nodes = graph.getNodes()
      for (let current of currentGroup) {
        const id = current.get('id')
        // 删除原群组中node中的groupID
        nodes.forEach(node => {
          const model = node.getModel()
          const gId = model.groupId
          if(!gId) {
            return
          }
          if(id === gId) {
            delete model.groupId
            // 使用没有groupID的数据更新节点
            graph.updateItem(node, model)
          }
        })
        current.destroy()
      }
      graph.setAutoPaint(autoPaint)
      graph.paint()
    }
  }

  /**
   * 更新群组名称
   * @param {string} groupId 群组ID
   * @param {string} title 群组新名称
   *
   * @memberof ItemGroup
   */
  updateGroupName(groupId, title) {
    const graph = this.editor.getGraph()
    const customGroup = graph.get('customGroup')
    const groupChild = customGroup.get('children')
    const groups = groupChild.filter(child => child.get('id') === groupId)

    const autoPaint = graph.get('autoPaint')
    graph.setAutoPaint(false)

    const currentGroup = groups[0]
    const text = currentGroup.getChildByIndex(2)
    text.attr('text', title)

    graph.setAutoPaint(autoPaint)
    graph.paint()
  }
}