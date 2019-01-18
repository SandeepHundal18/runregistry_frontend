import React, { Component } from 'react';
import { connect } from 'react-redux';
import Link from 'next/link';
import { Layout, Menu, Breadcrumb, Icon } from 'antd';
import { root_url_prefix } from '../../../../config/config';
import config from '../../../../config/config';
const { Header, Content, Footer, Sider } = Layout;

class TopNav extends Component {
    state = {
        hello: 'string'
    };
    render() {
        const {
            router: {
                query: { type, section, workspace }
            },
            user
        } = this.props;
        console.log(user.displayname);
        return (
            <Header className="header">
                <Menu
                    theme="dark"
                    mode="horizontal"
                    defaultSelectedKeys={[type]}
                    style={{ lineHeight: '64px' }}
                >
                    <Menu.Item key="0">
                        <img
                            className="logo"
                            src={`${root_url_prefix}/static/images/cms_logo.png`}
                        />
                        <h4
                            style={{
                                display: 'inline-block',
                                color: 'white',
                                marginLeft: '10px',
                                marginBottom: 0
                            }}
                        >
                            Run Registry
                        </h4>
                    </Menu.Item>
                    <Menu.Item key="online">
                        <Link
                            as={`${root_url_prefix}/online/runs/all`}
                            href="/online?type=online&section=runs&workspace=all"
                        >
                            <a>ONLINE</a>
                        </Link>
                    </Menu.Item>
                    <Menu.Item key="offline">
                        <Link
                            as={`${root_url_prefix}/offline/workspaces/global`}
                            href="/offline?type=offline&section=workspaces&workspace=global"
                        >
                            <a>OFFLINE</a>
                        </Link>
                    </Menu.Item>
                    <Menu.Item
                        disabled
                        key="warning"
                        style={{ opacity: 1, color: 'red !important' }}
                    >
                        <span
                            onClick={() => {}}
                            style={{
                                color: 'red !important',
                                fontSize: '0.9em'
                            }}
                        >
                            USE OF BOTH RUN REGISTRIES IS MANDATORY
                        </span>
                    </Menu.Item>
                    {/* <Menu.Item key="user">
                        <Link href="/user/runs/all">
                            <a>USER</a>
                        </Link>
                    </Menu.Item> */}
                </Menu>
                <div>
                    <h3 className="user_name white">
                        {user.displayname || 'Fabio Alberto Espinosa Burbano'}
                    </h3>
                    {/* <br /> */}
                    <a
                        className="white"
                        href="https://cmsrunregistry.web.cern.ch/logout"
                    >
                        Log out
                    </a>
                </div>
                <style jsx global>{`
                    .logo {
                        width: 50px;
                    }

                    .header {
                        display: flex;
                        justify-content: space-between;
                    }
                    .white {
                        color: white;
                    }
                    .user_name {
                        display: inline-block;
                        margin-right: 20px;
                    }
                `}</style>
            </Header>
        );
    }
}

const mapStateToProps = state => {
    return {
        user: state.info
    };
};

export default connect(mapStateToProps)(TopNav);
