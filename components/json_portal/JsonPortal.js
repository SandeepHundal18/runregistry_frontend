import React, { Component } from 'react';
import { Menu, Icon } from 'antd';

const { SubMenu } = Menu;

import JsonList from './jsonList/JsonList';

class JsonPortal extends Component {
  state = {
    selected_tab: 'my_jsons'
  };
  changeTab = ({ key }) => {
    this.setState({ selected_tab: key });
  };

  render() {
    const { selected_tab } = this.state;
    return (
      <div className="container">
        <Menu
          onClick={this.changeTab}
          selectedKeys={[selected_tab]}
          mode="horizontal"
        >
          <Menu.Item key="my_jsons">
            <Icon type="mail" />
            My JSONs
          </Menu.Item>
          <Menu.Item key="other_jsons">
            <Icon type="appstore" />
            Other JSONs
          </Menu.Item>
          <Menu.Item key="official_jsons">
            <Icon type="appstore" />
            Official JSONs
          </Menu.Item>
        </Menu>
        <br />
        <br />
        <JsonList category={selected_tab} />
        <style jsx>{`
          .container {
            padding: 10px;
            margin-top: 10px;
            margin-left: 30px;
            margin-right: 30px;
            background-color: white;
            border: 1px solid white;
            border-radius: 10px;
          }
        `}</style>
      </div>
    );
  }
}

export default JsonPortal;
