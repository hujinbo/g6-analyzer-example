import React, { Component } from 'react';
import { Button } from 'antd';

import style from './index.less'
import Link from 'umi/link';


class Index extends Component {

  render() {
    return (
      <div className={style.container}>
        <div>
          <p key="1">
            <Link to="/pai">
              <Button type="primary"> PAI</Button>
            </Link>
          </p>
          <p key="2">
            <Link to="/geabase">
              <Button type="primary"> geabase</Button>
            </Link>
          </p>
        </div>
      </div>

    );
  }
}


export default Index