/*
 * @Author: moyee
 * @Date: 2019-06-01 15:50:36
 * @LastEditors: moyee
 * @LastEditTime: 2019-08-21 14:39:51
 * @Description: file content
 */
// 节点/边的类型对应的颜色
export const nodeColorMap = {
  Person: ['#ff9c6e', '#ff7a45', '#ffd8bf'],
  Enterprise: ['#ff7875', '#ff4d4f', '#ffccc7']
}

// 节点对于的中文名称
export const nodeZHMap = {
  Person: '自然人',
  Enterprise: '企业'
}

export const defaultNodeColors = ['#b37feb', '#9254de', '#efdbff']


// 除过中性色板外，其他都使用的是3-5颜色值
export const edgeTypeColorMap = {
  // Daybreak Blue / 拂晓蓝 人与人的社会关系 01
  'Person2Person#Social': ['#91d5ff', '#69c0ff', '#40a9ff'],
  // 
  'Person2Person#Benefit': ['#d9d9d9', '#bfbfbf', '#8c8c8c'],//['#87e8de', '#5cdbd3', '#36cfc9'],
  // Geek Blue / 极客蓝  人与人的借款关系 02 
  'Person2Person#Co_Borrower': ['#adc6ff', '#85a5ff', '#597ef7'],//['#ffbb96', '#ff9c6e', '#ff7a45'],
  // Cyan / 明青 人与人的关系 04 
  'Person2Person#Guarantee': ['#87e8de', '#5cdbd3', '#36cfc9'], //['#ffa39e', '#ff7875', '#ff4d4f'],
  // Golden Purple / 酱紫
  'Person2Person#Transfer': ['#d9d9d9', '#bfbfbf', '#8c8c8c'],//['#d3adf7', '#b37feb', '#9254de'],
  
  // Polar Green / 极光绿 人与企业的关系关系 03
  'Person2Enterprise#Guarantee': ['#95de64', '#73d13d', '#52c41a'],
  // Calendula Gold / 金盏花
  'Enterprise2Enterprise#Guarantee': ['#d9d9d9', '#bfbfbf', '#8c8c8c'], //['#ffe58f', '#ffd666', '#ffc53d'],
  // Sunrise Yellow / 日出
  'Person2Enterprise#Serve': ['#d9d9d9', '#bfbfbf', '#8c8c8c'],//['#fffb8f', '#fff566', '#ffec3d'],
  // Lime / 青柠 人与企业之间的投资 05 
  'Person2Enterprise#Investment': ['#d3adf7', '#b37feb', '#9254de'],//['#bae637', '#a0d911', '#7cb305'],
  // Polar Green / 极光绿
  'Enterprise2Enterprise#Investment': ['#d9d9d9', '#bfbfbf', '#8c8c8c'],//['#b7eb8f', '#95de64', '#73d13d'],
  // 
  'Enterprise2Enterprise#Level': ['#d9d9d9', '#bfbfbf', '#8c8c8c'], //['#adc6ff', '#85a5ff', '#597ef7'],
  // Magenta / 法式洋红
  'Person2Enterprise#Transfer': ['#d9d9d9', '#bfbfbf', '#8c8c8c'],//['#ffadd2', '#ff85c0', '#f759ab'],
  // 中性色板
  'Enterprise2Enterprise#Transfer': ['#d9d9d9', '#bfbfbf', '#8c8c8c'],
  // 临时关系类型
  'TmpLineType': ['#531dab', '#391085', '#391085']
}

// 最大线条宽度
export const maxLineWidth = 3

// 最小线条宽度
export const minLineWidth = 1

// 聚合的线条数，即有2条以上时，就显示宽体 临时使用5，因此mock数据中很多都是4条
export const aggNumber = 2