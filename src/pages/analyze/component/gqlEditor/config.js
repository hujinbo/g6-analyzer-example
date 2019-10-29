/*
 * @Author: moyee
 * @LastEditors: moyee
 * @Description: Gql编辑器配置
 * @Date: 2019-05-06 15:29:50
 * @LastEditTime: 2019-06-05 11:02:35
 */
const gqlKeyWords = [
  ['Nav', 'custom-nav'],
  ['ShowSchema', 'custom-showschema'],
  ['GetEdgeProp', 'custom-get-edge-prop'],
  ['GetNodeProp', 'custom-get-node-prop'],
  ['Intersect', 'custom-intersect'],
  ['Union', 'custom-union'],
  ['Subtract', 'custom-subtract'],
  ['Combine', 'custom-combine'],
  ['Sort', 'custom-sort'],
  ['Limit', 'custom-limit'],
  ['Agg', 'custom-agg'],
  ['Transform', 'custom-transform'],
  ['For', 'custom-for'],
  ['GetDistance', 'custom-get-distance'],
  ['Expand', 'custom-expand']
]

// GQL 属性
const gqlProperties = [
  [':START', 'custom-start'],
]

export const gqlKeyWordsProperties = [...gqlKeyWords, ...gqlProperties]

/**
 * 根据关键词配置，生成关键词样式配置
 *
 * @export
 */
export function generatorKeyWordStyle() {
  const result = []
  // 关键词颜色
  for(let key of gqlKeyWords) {
    const value = key[1]
    result.push(
      {
        token: value,
        foreground: 'F64841',
        fontStyle: 'bold'
      }
    )
  }

  // 属性颜色
  for(let property of gqlProperties) {
    const pvalue = property[1]
    result.push({
      token: pvalue,
      foreground: 'B500A9',
      fontStyle: 'bold'
    })
  }
  return result
}

