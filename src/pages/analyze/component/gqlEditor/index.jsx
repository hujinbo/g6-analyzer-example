/*
 * @Author: moyee
 * @Date: 2019-06-04 11:41:05
 * @LastEditors: moyee
 * @LastEditTime: 2019-06-05 11:02:00
 * @Description: GQL编辑器组件
 */
import React, { Component } from '@alipay/bigfish/react'
import 'monaco-editor'
import { monacoSqlAutocomplete } from '@alife/gql-parser'
import { gqlKeyWordsProperties, generatorKeyWordStyle } from './config'
import styles from './index.less'

const monaco = window.monaco

class GQLEditor extends Component {
  static getValue() {
    return this.gqlEditor && this.gqlEditor.getValue()
  }
  constructor(props) {
    super(props)
    this.gqlRef = React.createRef() 
    this.gqlEditor = null
  }
  componentDidMount() {

    // GQL 编辑器
    monaco.languages.register({ id: 'gql'})

    monaco.languages.setMonarchTokensProvider('gql', {
      // 忽略关键词大小写
      ignoreCase: true,
      tokenizer: {
        root: gqlKeyWordsProperties
      }
    })

    monaco.editor.defineTheme('gql-theme', {
      // base: 'hc-black',
      base: 'vs',
      inherit: true,
      rules: generatorKeyWordStyle()
    })

    const node = this.gqlRef.current
    const editor = monaco.editor.create(node, {
      theme: 'gql-theme',
      value: [
        ''
      ].join('\n'),
      language: 'gql'
    })

    window.gqlEditor = editor

    monaco.editor.setTheme('gql-theme')

    monacoSqlAutocomplete(monaco, editor)

    editor.layout({
      width: node.getBoundingClientRect().width - 2,
      height: 80
    })
  }

  componentWillUnmount() {
    delete window.gqlEditor
    window.gqlEditor = null
  }

  render() {
    return (
      <div className={styles.gqlEditor} ref={this.gqlRef}></div>
    )
  }
}

export default GQLEditor