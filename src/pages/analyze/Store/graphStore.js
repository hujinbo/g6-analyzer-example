/*
 * @Author: moyee
 * @Date: 2019-08-06 20:58:02
 * @LastEditors: moyee
 * @LastEditTime: 2019-08-21 14:27:46
 * @Description: file content
 */
import Editor from '@antv/g6-editor'
import { message } from '@alipay/bigfish/antd'
import { getLegendData, aggregationEdges } from '@/common/utils/graphDB'
import { query, queryEdgesById, getEdgeDetail,
  getShortPath, getCrycleByNode, getCrycleList, getCrycleDetail } from '@/service/analyze'
import { transformData } from '../layout/utils/transformData'
import RadialLayout from '../layout'
const { buildModel, eventEnum } = Editor

function getEdgeOffset(edgeNum, range) {
  // if(edgeNum === 1) return [0]
  // if(edgeNum === 2) return [-20, 20]

  // if(edgeNum === 3) {
  //   return [range[0], 5, range[1]]
  // }
  const r = range[1] - range[0];
  const unit = r / edgeNum;
  const offsets = [range[0]];
  for (let i = 1; i < edgeNum - 1; i++) {
    offsets.push(range[0] + i * unit);
  }
  offsets.push(range[1])
  return offsets;
}

const initState = (config, self) => {
  const initialState = {
    // 当前点击的Item的数据
    currentModel: null,
    // 当前点击的Item
    currentItem: null,
    // 节点或边的详情抽屉是否显示
    visibleDetail: false,
    visibleEdgeDetail: false,
    type: '',
    // 点击边上的标签后，展示的内容和位置
    currentEdges: [],
    visibleLegend: false,
    // 首次进入页面不显示loading
    shouldLoading: false,
    legends: {
      nodes: [],
      edges: []
    },
    graphData: null,
    // 最短路径
    shorest: {
      visible: false,
      sourceNode: null
    },
    centerNode: null,
    graphCanvasWH: null,
    // 查找一个节点或两点所在的数据
    visiblePointPath: false,
    // 显示预判的弹框
    visiblePredict: false,
    isShowLabel: true,
    // 默认不显示全量环路的panel
    circleVisible: false,
    // 全量数据列表数据
    fullCircleList: [],
    // 全量数据分页信息
    circlePagination: {},
    visibleFilter: false
  };

  return initialState
}

const createModel = (id, config, store) => {
  // const eventCenter = InstanceManager.getEventCenter(id);
  const self = buildModel({
    ...initState(config),

    /**
     * 点击节点
     *
     * @param {Node} item 节点实例
     */
    nodeClick(item) {
      self.currentModel = item
      self.currentItem = item.id
      self.visibleDetail = true
      self.visibleEdgeDetail = false
      self.circleVisible = false
      self.currentEdges = []
      self.type = 'node'
    },

    /**
     * 点击边
     *
     * @param {Event} evt 事件实例
     * @param {Graph} graph Graph实例
     */
    edgeClick(evt) {
      const { item } = evt
      self.currentItem = item
      const model = item.getModel()
      self.type = 'edge'
      console.log('点击边详情', model)
      if(model.edgeType === 'TmpLineType') {
        // 如果是临时关系关系，则不显示详情面板
        self.visibleEdgeDetail = false
        self.visibleDetail = false
        return false
      }

      // 点击边时候，如果存在聚合边，则展示边的list，否则展示边的详情
      if(model.data && model.data.aggEdges && model.data.aggEdges.length > 1) {
        const edgesData = model.data.aggEdges
        self.currentEdges = edgesData
        self.visibleEdgeDetail = false
        self.visibleDetail = true
      } else {
        // 这里不能直接 self.currentEdges.length = 0，否则会直接修改引用的值
        self.currentEdges = []
        const { srcId, dstId, edgeType, timestamp } = model.data || model
        if(model.edgeShapeType !== 'custom') {
          this.clickEdgeQueryDetail({ srcId, dstId, edgeType, timestamp })
        } else {
          self.currentModel = {
            data: model
          } 
        }
      }
      
      self.circleVisible = false
    },

    /**
     * 点击画布
     *
     */
    canvasClick() {
      self.currentModel = null
      self.visibleEdgeDetail = false
      self.visibleDetail = false
      self.circleVisible = false
      self.type = ''
      self.currentEdges = []
      self.labelX = 0
      self.labelY = 0
    },

    /**
     * 查询边的详情
     *
     * @param {object} payload
     * @returns
     */
    async clickEdgeQueryDetail(payload) {
      const result = await getEdgeDetail(payload)

      self.shouldLoading = true

      // result为null或undefined，则说明接口服务有问题
      if(!result) {
        return message.error('执行查询失败: 接口服务异常')
      }

      // 查询后，不显示loading
      self.shouldLoading = false

      const { data: edgeDetail, success, msg } = result

      if(!success) {
        // 请求失败，提示用户
        return message.error(`查询失败: ${msg}`)
      }

      const { edges } = edgeDetail

      if(edges && edges.length === 0) {
        self.visibleDetail = false
        return message.error('暂无边的详细信息')
      }
      self.currentModel = {
        // ...edges[0],
        data: edges[0]
      }

      if(self.currentEdges.length > 0) {
        self.visibleDetail = true
        self.visibleEdgeDetail = true
      } else {
        self.visibleDetail = true
        self.visibleEdgeDetail = false
      }
      // return edgeDetail
    },

    /**
     * 隐藏节点或边的详情面板
     *
     */
    hide() {
      // 如果此时模式长按拖动时候，则重置为default
      console.log(store)
      self.visibleEdgeDetail = false
      self.visibleDetail = false
      self.currentModel = null
      self.type = 0
    },

    /**
     * 显示Graph图例
     *
     */
    showLegend() {
      self.visibleLegend = true
    },

    /**
     * 隐藏Graph图例
     *
     */
    hideLegend() {
      self.visibleLegend = false
    },

    showPointPath() {
      self.visiblePointPath = true
    },

    hiddenPointPath() {
      self.visiblePointPath = false
    },

    showPredict() {
      self.visiblePredict = true
    },

    hiddenPredict() {
      self.visiblePredict = false
    },

    /**
     * 根据类型和输入的内容进行查询
     *
     * @param {string} type 查询类型
     * @param {string} value 查询关键词或GQL语句
     */
    async loadData(type, value) {
      self.shouldLoading = true
      self.visibleEdgeDetail = false
      self.visibleDetail = false
      self.visibleFilter = false
      const { graph } = self.graphCanvasWH
      graph.clearData()
      graph.clear()
      graph.paint()
      self.centerNode = null
      console.log('graph 数据', graph.save());
      const result = await query(type)
      self.isShowLabel = true

      // 查询之前，清空之前的数据
      self.graphData = null

      self.circleVisible = false


      // result为null或undefined，则说明接口服务有问题
      if(!result) {
        self.shouldLoading = false
        return message.error('执行查询失败: 接口服务异常')
      }

      // 查询后，不显示loading
      self.shouldLoading = false

      const { data: originData, success, msg } = result

      if(!success) {
        // 请求失败，提示用户
        return message.error(`查询失败: ${msg}`)
      }

      this.parseDataUpdateStore(originData, true)
      
    },

    /**
     * 扩展节点度数
     *
     * @param {object} payload
     * @returns
     */
    async queryDegree(payload) {
      self.shouldLoading = true
      self.visibleEdgeDetail = false
      self.visibleDetail = false
      const result = await queryEdgesById(payload)

      self.isShowLabel = true
      self.circleVisible = false

      if(!result) {
        return message.error('执行查询失败: 接口服务异常')
      }

      const { data: originData, success, msg } = result

      if(!success) {
        // 请求失败，提示用户
        return message.error(`查询失败: ${msg}`)
      }

      // 查询后，不显示loading
      self.shouldLoading = false

      const nodes = originData.nodes //.filter(node => node.id !== payload.id)

      this.parseDataUpdateStore({
        nodes,
        edges: originData.edges
      })
    },

    /**
     * 查询数据列表
     *
     * @param {object} payload
     * @returns
     */
    async queryCircleList(payload) {
      // 调用后端接口获取数据
      const result = await getCrycleList(payload)

      if(!result) {
        return message.error('执行查询失败: 接口服务异常')
      }

      const { data, pagination, success, msg } = result

      if(!success) {
        // 请求失败，提示用户
        return message.error(`查询失败: ${msg}`)
      }
      self.visibleDetail = false
      self.visibleEdgeDetail = false

      self.circleVisible = true
      self.fullCircleList = data
      self.circlePagination = pagination
    },

    async queryCrycleDetail(payload) {
      const result = await getCrycleDetail(payload)

      if(!result) {
        return message.error('执行查询失败: 接口服务异常')
      }

      const { data, success, msg } = result

      if(!success) {
        // 请求失败，提示用户
        return message.error(`查询失败: ${msg}`)
      }
      this.parseDataUpdateStore(data)
    },

     /**
     * 解析查询的结果，更新store中的节点、边的数据
     *
     * @param {object} originData 接口返回的数据，包括nodes和edges
     */
    parseDataUpdateStore(originData, isFirst = false) {
      const { nodes } = originData
      const { graph, width, height } = self.graphCanvasWH

      if(nodes && nodes.length === 0 && !isFirst) {
        message.warn('没有符合条件的数据')
        graph.clearData()
        graph.clear()
        graph.paint()
        self.graphData = null
        return false
      }

      // 过滤掉已经存在的节点，看返回的数据中是否存在新节点

      const graphNodes = graph.getNodes()
      const newNodeIds = []
      graphNodes.forEach(node => {
        const model = node.getModel()
        newNodeIds.push(model.id)
      })
      const newAddNodes = nodes.filter(node => !newNodeIds.includes(node.id))

      // 是否存在新边
      const graphEdges = graph.getEdges()
      const oldEdgesMap = {}
      graphEdges.map(edge => {
        const model = edge.getModel()
        const { source, target, edgeType } = model
        oldEdgesMap[`${source}-${target}-${edgeType}`] = true
      })

      const newEdgeArrs = []
      originData.edges.forEach(edge => {
        const { srcId, dstId, edgeType } = edge
        if(!oldEdgesMap[`${srcId}-${dstId}-${edgeType}`]) {
          newEdgeArrs.push(true)
        }
      })
      if(newAddNodes && newAddNodes.length === 0 && newEdgeArrs.length === 0) {
        return message.warn('没有符合条件的数据')
      }

      const shapeNodes = nodes.map(node => {
        return {
          shape: 'circle-node',
          ...node
        }
      })

      const data = {
        nodes: shapeNodes,
        edges: originData.edges
      }

      
      // 处理edge，节点之间只保留一条边，有多条边的时候进行聚合处理
      debugger
      const aggEdges = aggregationEdges(data.edges)
      
      data.edges = aggEdges
      
      let radialLayout = null
      const mainUnitRadius = 260
      let focusNode = null
      // 初始化
      if(!self.centerNode) {
        focusNode = self.centerNode
        radialLayout = new RadialLayout({
          center: [ width / 2, height / 2 - 50 ],
          maxIteration: 200,
          focusNode,
          unitRadius: mainUnitRadius,
          linkDistance: 260,
          nodeSize: 40
        })
      } else {
        focusNode = self.centerNode //centerNodes[centerNodes.length - 1]
        const foucsCenterNode = focusNode.centerNode
        // const preFocusNode = centerNodes[centerNodes.length - 2]
        if(foucsCenterNode) {
          // 通过已存在的节点进行扩展
          // the max degree about foces(clicked) node in the newly added data
          const maxDegree = focusNode.degree > 2 ? 2 : focusNode.degree;
          // the max degree about foces(clicked) node in the original data
          const oMaxDegree = foucsCenterNode.degree > 2 ? 2 : foucsCenterNode.degree;
          // re-place the clicked node far away the exisiting items
          // along the radius from center node to it
          const vx = focusNode.x - focusNode.centerNode.x;
          const vy = focusNode.y - focusNode.centerNode.y;
          let vlength = Math.sqrt(vx*vx+vy*vy);
          vlength = vlength === 0 ? 1 : vlength;
          const ideallength = mainUnitRadius * maxDegree + mainUnitRadius * oMaxDegree + 120;
          focusNode.x = ideallength * vx / vlength + focusNode.centerNode.x;
          focusNode.y = ideallength * vy / vlength + focusNode.centerNode.y;
  
          radialLayout = new RadialLayout({
            center: [ focusNode.x, focusNode.y ],
            maxIteration: 200,
            focusNode: focusNode,
            unitRadius: 200,
            linkDistance: 200,
            nodeSize: 40
          }); 
        } else {
          radialLayout = new RadialLayout({
            center: [ focusNode.x, focusNode.y ],
            maxIteration: 200,
            focusNode: focusNode,
            unitRadius: mainUnitRadius,
            linkDistance: 260,
            nodeSize: 40
          }); 
        }
      }

      radialLayout.initPlugin(graph)

      const originLayoutData = transformData(data)
      // 这个值去掉第一个计算的节点
      
      // 原来图中的数据
      const { nodes: originNodes, edges} = graph.save()

      const { nodes: newNodes, edges: newEdges } = originLayoutData

      const nodeIds = originNodes.map(node => node.id)

      // 过滤掉新节点中已经存在的节点，但不过滤当前操作的节点
      const filterNodes = newNodes.filter(node => {
        if(focusNode && focusNode.id === node.id) {
          return true
        }
        return !nodeIds.includes(node.id)
      })

      filterNodes.forEach(node => node.centerNode = self.centerNode)

      const allNodes = originNodes.concat(filterNodes)

      const allEdges = edges.concat(newEdges)

      radialLayout.layout({
        nodes: newNodes,
        edges: newEdges
      })

      
      const noDupEdges = {}

      allEdges.forEach(edge => {
        const { source, target, edgeType, timestamp } = edge
        const uid = `${source}-${target}-${edgeType}-${timestamp}`
        if(!noDupEdges[uid]) {
          noDupEdges[uid] = edge
        }
      })

      const noDupEdgeArrs = []

      for(let edge in noDupEdges) {
        noDupEdgeArrs.push(noDupEdges[edge])
      }

      // 计算两个节点之间所有边的个数，设置边的offset
      const nodesLen = allNodes.length
      const hasInMap = {}
      for(let i = 0; i < nodesLen; i++) {
        const srcNode = allNodes[i]
        for(let j = 1; j < nodesLen; j++) {
          const dstNode = allNodes[j]
          if(srcNode.id === dstNode.id) {
            continue
          }

          const srcDstId = `${srcNode.id}-${dstNode.id}`
          const dstSrcId = `${dstNode.id}-${srcNode.id}`
          if(hasInMap[srcDstId] || hasInMap[dstSrcId]) {
            continue
          }
          hasInMap[srcDstId] = true
          hasInMap[dstSrcId] = true
          let nodeEdgesCount = 0
          
          const noDupEdge = noDupEdgeArrs.filter(edge => {
            const { source, target } = edge
            return (source === srcNode.id && target === dstNode.id)
              || (source === dstNode.id && target === srcNode.id)
          })
          nodeEdgesCount = noDupEdge.length
          if(nodeEdgesCount === 2) {
            // 判断这两条边是否是同方向的
            const edge1 = noDupEdge[0]
            const edge2 = noDupEdge[1]
            if(edge1.source === edge2.source && edge1.target === edge2.target) {
              const edgeOffsets = [-30, 30]
              let count = 0

              noDupEdge.forEach(edge => {
                edge.shape = 'quadratic-label-edge'
                edge.edgeOffset = edgeOffsets[count]
                count++
              })
            } else {
              noDupEdge.forEach(edge => {
                edge.shape = 'quadratic-label-edge'
              })
            }
          } else if(nodeEdgesCount > 2) {
            const edgeOffsets = getEdgeOffset(nodeEdgesCount, [-15 * nodeEdgesCount, 25 * nodeEdgesCount])
            console.log(edgeOffsets)
            let count = 0
            noDupEdge.forEach(edge => {
                edge.shape = 'quadratic-label-edge'
                edge.edgeOffset = edgeOffsets[count]
                count++
            })
          }
        }
      }

      self.graphData = {
        nodes: allNodes,
        edges: noDupEdgeArrs
      }

      const { nodes: nodeLegends, edges: edgeLegends } = getLegendData(self.graphData)
      self.legends = {
        nodes: nodeLegends,
        edges: edgeLegends
      }

      store.emit(eventEnum.reloadDag, self.graphData, false)
    },

    /**
     * 是否显示边上的label标签
     * @param {boolean} checked 
     */
    toggleLabelVisible(graph, checked) {
      const graphData = graph.save()
      if(!graphData) {
        return;
      }

      const edges = graph.getEdges()
      if(!checked) {
        edges.forEach(edge => {
          const model = edge.getModel()
          const { style = {} } = model
          debugger
          graph.updateItem(edge, {
            style: {
              ...style,
              fillOpacity: 0,
              onlyHideText: true
            }
          })
        })
      } else {
        edges.forEach(edge => {
          const model = edge.getModel()
          const { style = {} } = model
          graph.updateItem(edge, {
            style: {
              // opacity: 1,
              ...style,
              fillOpacity: 1,
              onlyHideText: false
            }
          })
        })
      }
    },

    /**
     * 根据图例选中过滤数据
     *
     * @param {boolean} checked 选中情况
     * @param {string} label 节点或边的标签
     * @param {string} type 节点或边的类型
     */
    filterData(checked, label, type, graph) {
      const nodes = graph.getNodes()
      const edges = graph.getEdges()
      let hiddenNodes = []
      let hiddenEdges = []
      const autoPaint = graph.get('autoPaint')
      graph.setAutoPaint(false)

      if(type === 'node') {
        // 渲染完了以后去除重复数据
        const noDupNodes = {}
        nodes.forEach(node => {
          const model = node.getModel()
          if(!noDupNodes[model.id]) {
            noDupNodes[model.id] = node
          }
        })

        const noDupNodeArrs = []
        for(let node in noDupNodes) {
          noDupNodeArrs.push(noDupNodes[node])
        }

        // 根据图例过滤节点，同时要考虑与该节点相连的边的情况
        hiddenNodes = noDupNodeArrs.filter(node => {
          const model = node.getModel()
          return model.nodeType === label
        })

        hiddenNodes.forEach(node => {
          const isVisible = node.isVisible()
          const edges = node.getEdges()
  
          if(!isVisible && checked) {
            node.show()
            edges.forEach(edge => {
              const source = edge.getSource()
              const target = edge.getTarget()
              const sourceVisible = source.isVisible()
              const targetVisible = target.isVisible()
              
              if(sourceVisible && targetVisible) {
                edge.show()
              }
            })
          } else {
            node.hide()
            edges.forEach(edge => {
              edge.hide()
            })
          }
        })
      } else {
        // 过滤边，节点可保持不变
        hiddenEdges = edges.filter(edge => {
          const model = edge.getModel()
          if(model.label === label) {
            return edge
          }
        })

        hiddenEdges.forEach(edge => {
          const isVisible = edge.isVisible()
          if(!isVisible && checked) {
            const source = edge.getSource()
            const target = edge.getTarget()
            const sourceVisible = source.isVisible()
            const targetVisible = target.isVisible()
            
            if(sourceVisible && targetVisible) {
              edge.show()
            }
          } else {
            edge.hide()
          } 
        })
      }
      graph.paint()
      graph.setAutoPaint(autoPaint)
    },

    /**
     * 保存图数据
     * @param {Graph} graph 
     */
    saveGraph(graph) {
      const data = graph.save()
      console.log('图数据', data)
    },

    contextMenuItemClick(evt) {
      const { key, item, option } = evt
      const { degree } = option

      console.log(key)
      const { id: nodeId, nodeType } = item
      // 根据度数扩展
      if(key.includes('degreeQuery')) {
        self.centerNode = item
        self.centerNode.degree = degree

        // 查一度关系
        const param = {
          id: nodeId,
          nodeType,
          depth: degree,
          edgeType: '',
          direction: 'all'
        }
        this.queryDegree(param)
      }
    },

    /**
     * 查询指定节点所在的所有数据
     * @param {string} nodeId 节点ID
     * @param {string} nodeType 节点类型
     */
    async getCrycleByNode(param) {
      self.shouldLoading = true
      self.visibleEdgeDetail = false
      self.visibleDetail = false
      const result = await getCrycleByNode(param)

      if(!result) {
        return message.error('执行查询失败: 接口服务异常')
      }

      self.shouldLoading = false
      const { success, msg } = result
      if(!success) {
        return message.error(`输入的节点ID ${msg}`)
      }

      self.visiblePointPath = false
      console.log('指定节点所在的数据', result)

      const { data } = result
      const { nodes } = data

      if(!nodes || nodes.length === 0) {
        return message.error('不存在数据或路径')
      }
      
      this.parseDataUpdateStore(data, true)
    },

    /**
     * 根据输入的起始节点ID和目标节点ID查询最短路径
     * @param {string} sourceValue 起始节点ID
     * @param {string} targetValue 目标节点ID
     * @param {Graph} graph G6 Graph实例
     */
    async queryNodeShorestPath(sourceValue, targetValue, srcType, dstType, graph) {
      self.shouldLoading = true
      self.visibleEdgeDetail = false
      self.visibleDetail = false
      const result = await getShortPath({
        srcId: sourceValue,
        dstId: targetValue,
        srcType,
        dstType
      })
      console.log('最短路径值', result)

      if(!result) {
        return message.error('执行查询失败: 接口服务异常')
      }

      const { success, msg } = result
      if(!success) {
        return message.error('查询失败', msg)
      }

      self.shouldLoading = false
      self.visiblePredict = false

      const { data } = result
      const { nodes } = data

      if(!nodes || nodes.length === 0) {
        return message.error('不存在数据或路径')
      }
      
      this.parseDataUpdateStore(data, true)

      const autoPaint = graph.get('autoPaint')
      graph.setAutoPaint(false)

      const edges = graph.getEdges()
      const stEdges = edges.filter(edge => {
        const model = edge.getModel()
        const { srcId, dstId } = model
        return srcId === sourceValue && dstId === targetValue
      })
      if(stEdges.length > 1) {
        graph.addItem('edge', {
          source: sourceValue,
          target: targetValue,
          srcId: sourceValue,
          dstId: targetValue,
          edgeType: 'TmpLineType',
          label: '临时关系',
          shape: 'edge-width-rect',
          edgeShapeType: 'custom',
          style: {
            // stroke: '#531dab',
            lineWidth: 2,
            // 虚线样式
            lineDash: [5, 5]
          }
        })
      } else {
        graph.addItem('edge', {
          source: sourceValue,
          target: targetValue,
          srcId: sourceValue,
          dstId: targetValue,
          edgeType: 'TmpLineType',
          label: '临时关系',
          shape: 'quadratic-label-edge',
          edgeShapeType: 'custom',
          edgeOffset: 60,
          style: {
            // stroke: '#531dab',
            lineWidth: 2,
            // 虚线样式
            lineDash: [5, 5]
          }
        })
      }

      graph.setAutoPaint(autoPaint)
      graph.paint()
    },

    queryShorest(graph, paths) {
      self.shorest = {
        visible: false,
        sourceNode: null
      }
      console.log(paths)
      // 根据最短路径，获取节点的source
      // 根据source和target获取最短路径，然后更新graph
      const autoPaint = graph.get('autoPaint')
      graph.setAutoPaint(false)
      const nodes = graph.getNodes()
      // 过滤符合要求的节点
      const selectedNodes = {}
      const selectedEdges = []
      for(let path of paths) {
        for(let node of nodes) {
          if(path.from() !== node.get('id') && path.to() !== node.get('id')) {
            continue
          }
          selectedNodes[node.get('id')] = node
          // selectedNodes.push(node)
          const outEdges = node.getOutEdges()
          const edges = outEdges.filter(edge => {
            const model = edge.getModel()
            return model.target === path.to() && model.source === path.from()
          })
          selectedEdges.push(...edges)
        }
      }

      console.log(Object.values(selectedNodes), selectedEdges)
      Object.values(selectedNodes).forEach(node => {
        const stateKey = graph.getStateKey('node', 'select')
        graph.setItemState(node, stateKey, true)
      })
      selectedEdges.forEach(edge => {
        const stateKey = graph.getStateKey('edge', 'select')
        graph.setItemState(edge, stateKey, true)
      })
      graph.setAutoPaint(autoPaint)
      graph.paint()
    },

    hideShorest() {
      self.shorest = {
        visible: false,
        sourceNode: null
      }
    },

    setupEvent(EventCenter) {

      const { eventEnum } = EventCenter

      EventCenter.addGroup({
        key: 'node:nodeOperator',
        targetKey: 'store',
        eventMap: {
          [eventEnum.nodeClick]: 'onNodeClick',
          [eventEnum.canvasClick]: 'onCanvasClick',
          [eventEnum.edgeClick]: 'onEdgeClick',
          [eventEnum.contextMenuItem]: 'onContextMenuClick'
          // [eventEnum.editorReady]: 'loadData'
        },
        handlers: {
          onNodeClick(...args) {
            self.nodeClick(...args)
          },
          onCanvasClick(...args) {
            // const { graph } = this
            // graph.setMode('default')
            self.canvasClick(...args)
          },
          onEdgeClick(...args) {
            self.edgeClick(...args)
          },
          onContextMenuClick(...args) {
            self.contextMenuItemClick(...args)
          }
        }
      });

    },

    enableEvent(uuid, eventCenter) {
      eventCenter.enableGroup(uuid, 'store', [
        'node:nodeOperator'
      ])
    },

    disableEvent(uuid, eventCenter) {
      eventCenter.disableGroup(uuid, 'store', [
        'node:nodeOperator'
      ])
    }

  })
  return self
}


export default createModel

