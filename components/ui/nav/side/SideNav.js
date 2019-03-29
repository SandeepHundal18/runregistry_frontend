import React, { Component } from 'react';
import { connect } from 'react-redux';
import Router from 'next/router';
import { Layout, Menu, Icon, Badge } from 'antd';
import { offline_column_structure } from '../../../../config/config';

const { Sider } = Layout;
const SubMenu = Menu.SubMenu;

class SideNav extends Component {
    onRouteChangeHandler({ key, keyPath }) {
        const {
            router: {
                query: { type, section, workspace }
            }
        } = this.props;
        Router.push(
            `/offline?type=offline&section=${section}&workspace=${key}`,
            `/offline/${section}/${key}`
        );
    }

    displayWorkspace = workspace => {
        const {
            router: {
                query: { section }
            },
            cycles
        } = this.props;
        let workspace_status = 0;
        cycles.forEach(cycle => {
            for (const [key, val] of Object.entries(cycle.cycle_attributes)) {
                if (key.includes('_state')) {
                    const workspace_name = key.split('_state')[0];
                    if (workspace_name === workspace && val === 'pending') {
                        workspace_status += 1;
                    }
                }
            }
        });
        const backgroundColor = workspace_status === 0 ? '#52c41a' : '';
        return (
            <Menu.Item key={workspace.toUpperCase()}>
                <div>
                    {workspace.toUpperCase()}
                    {section === 'cycles' && (
                        <Badge
                            showZero
                            style={{
                                backgroundColor
                            }}
                            count={workspace_status}
                            offset={[10, 0]}
                        />
                    )}
                </div>
            </Menu.Item>
        );
    };

    render() {
        const {
            show_sidebar,
            workspaces,
            cycles,
            selected_cycle,
            router: {
                query: { type, section, workspace }
            }
        } = this.props;
        return (
            <Layout hasSider={true}>
                {show_sidebar && (
                    <Sider // collapsible
                        width={200}
                        style={{ background: '#fff' }}
                    >
                        <Menu
                            mode="inline"
                            onClick={this.onRouteChangeHandler.bind(this)}
                            defaultOpenKeys={['workspaces']}
                            defaultSelectedKeys={[workspace]}
                            style={{ height: '100%', borderRight: 0 }}
                        >
                            <SubMenu
                                key="workspaces"
                                title={
                                    <span>
                                        <Icon type="laptop" />
                                        <span>WORKSPACES</span>
                                    </span>
                                }
                            >
                                <Menu.Item key="global">GLOBAL</Menu.Item>
                                {workspaces.map(({ workspace }) =>
                                    this.displayWorkspace(workspace)
                                )}
                            </SubMenu>
                        </Menu>
                    </Sider>
                )}
                <Layout style={{ padding: '0 24px 24px' }}>
                    {this.props.children}
                </Layout>
            </Layout>
        );
    }
}

const mapStateToProps = state => {
    return {
        workspaces: state.offline.workspace.workspaces,
        cycles: state.offline.cycles.cycles,
        selected_cycle: state.offline.cycles.selected_cycle
    };
};

export default connect(mapStateToProps)(SideNav);
