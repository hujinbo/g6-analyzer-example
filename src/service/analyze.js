import request from '../common/utils/request'

/**
 * 根据类型和输入的值查询图数据结果
 */
export async function query(payload) {
  return request('/developer/visual/getNode', {
    method: 'GET',
    params: payload
  })
}

/**
 * 根据节点进行扩展
 * @param {object} payload 
 */
export async function queryEdgesById(payload) {
  return request('/developer/visual/expand', {
    method: 'GET',
    params: payload
  })
}

/**
 * 根据SRCID，DSTID，EdgeType及Timestamp，查询边属性信息。
 * @param {object} payload 
 */
export async function getEdgeDetail(payload) {
  return request('/developer/visual/edgeDetail', {
    method: 'GET',
    params: payload
  })
}

/**
 * 根据source、target、sourceType及targetType查询两个节点之间的最短路径
 * @param {object} payload 
 */
export async function getShortPath(payload) {
  return request('/developer/visual/shortestPath', {
    method: 'GET',
    params: payload
  })
}

/**
 * 根据nodeId及nodeType查询指定节点所在的环，支持通过一个节点或两个节点查询
 * @param {object} payload 
 */
export async function getCrycleByNode(payload) {
  return request('/developer/visual/getCycle', {
    method: 'GET',
    params: payload
  })
}

/**
 * 查询指定数据的详情
 */
export async function getCrycleDetail(payload) {
  return request('/developer/visual/getCycles', {
    method: 'GET',
    params: payload
  })
}

/**
 * 查询数据列表
 * @param {object} payload 
 */
export async function getCrycleList(payload) {
  return request('/developer/visual/getCycleList', {
    method: 'GET',
    params: payload
  })
}