import React from 'react';

import { Tree, Input } from 'antd';
import AntvEditor from '@antv/g6-editor'
import { NodePanel, NodeItem } from '@antv/g6-editor/Components'


import NodeTitle from './Node'


import _ from 'lodash';

import style from './index.less'

const { InstanceManager, view } = AntvEditor
// const { NodeItem } = NodePanel

const { TreeNode, DirectoryTree } = Tree;
const Search = Input.Search;

// 遍历树节点的路径
const getParentKey = (key, tree) => {
  let parentKey;
  tree.some((node) => {
    const { children = [] } = node
    if (children.length) {
      if (children.some(item => item.key === key)) {
        parentKey = node.key;
        return true
      } else {
        let parentKey_ = getParentKey(key, children)
        if (parentKey_) {
          parentKey = parentKey_
        }
      }
    }
    return !!parentKey
  })
  return parentKey;
};

const stringHas = (str1 = '', str2 = '') => {
  return _.toLower(str1).includes(_.toLower(str2))
}


class AlgoList extends React.Component {

  constructor(props) {
    super(props)
    const { id } = props;
    const model = InstanceManager.getModel(id, 'algo')
    console.log('model', model)
    this.model = model
  }


  onExpand = (expandedKeys) => {
    this.model.expand({
      expandedKeys,
      autoExpandParent: false,
    })
  }


  onChange = (e) => {

    const { value = '' } = e.target;
    const { algoTree = [], list: algoList } = this.model
    const algoList_ = algoList.filter(node => node.status !== 4)


    let expandedKeys = [];

    if (value) {
      expandedKeys = algoList_.map((item) => {
        const { label = '', key } = item
        if (stringHas(label, value)) {
          const parentKey = getParentKey(key, algoTree);
          return parentKey
        }
        return null;
      }).filter((item, i, self) => (
        item && self.indexOf(item) === i
      ));
    }

    this.model.search({
      expandedKeys,
      searchKey: value,
      autoExpandParent: true,
    })

  }



  renderTree = (treeList = [], searchKey) => {
    return treeList.map((item) => {
      const { key, children, isFolder } = item;
      console.log(item)
      const title = (
        <NodeItem node={item}>
          <NodeTitle
            isLeaf={!isFolder}
            node={item}
            searchKey={searchKey}
          />
        </NodeItem>
      )

      if (children) {
        return (
          <TreeNode
            key={key}
            title={title}
            className={style.treeFolder}
          >
            {this.renderTree(children, searchKey)}
          </TreeNode>
        );
      }

      return (
        <TreeNode
          isLeaf
          key={key}
          title={title}
          className={style.treeNode}
        />
      );

    })
  }

  render() {
    const {
      algoTree = [], searchKey,
      expandedKeys, autoExpandParent
    } = this.model;
    const treeList = algoTree.filter(node => node.status !== 4)

    return (
      <NodePanel className={`${style.list} ${style.algoTree}`} >

        <Search
          className="M-b-8"
          placeholder="Search"
          onChange={this.onChange}
        />

        <DirectoryTree
          showIcon={false}
          onExpand={this.onExpand}
          expandedKeys={expandedKeys}
          autoExpandParent={autoExpandParent}
        >
          {this.renderTree(treeList, searchKey)}
        </DirectoryTree>

      </ NodePanel>
    );
  }
}

export default view(AlgoList)

