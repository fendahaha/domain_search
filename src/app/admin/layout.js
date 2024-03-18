'use client'
import React, {useEffect, useState} from 'react';
import {AntCloudOutlined, BarChartOutlined, GlobalOutlined,} from '@ant-design/icons';
import {Layout, Menu, theme} from 'antd';
import {useRouter} from "next/navigation";

const {Header, Content, Footer, Sider} = Layout;


const items = [
    {
        key: '1',
        icon: <BarChartOutlined/>,
        label: `Dashboard`,
        path: '/admin',
    },
    {
        key: '2',
        icon: <AntCloudOutlined/>,
        label: `Cloudflare`,
        path: '/admin/cloudflare',
    },
    {
        key: '3',
        icon: <GlobalOutlined/>,
        label: `Domains`,
        path: '/admin/domain',
    },
    // {
    //     key: '4',
    //     icon: React.createElement(BarChartOutlined),
    //     label: `test`,
    //     path: '/admin/test',
    // },
]

function find_path_key(path) {
    let item = items.find((v, i) => {
        return v['path'] === path
    });
    return [item?.key]
}

function go_to_page(key, router) {
    let item = items.find((v, i) => {
        return v['key'] === key
    });
    router.push(item['path'])
}

const App = ({children}) => {
    const {
        token: {colorBgContainer, borderRadiusLG},
    } = theme.useToken();
    let router = useRouter();
    const [menu_selectedKeys, setMenu_selectedKeys] = useState(null);
    useEffect(() => {
        setMenu_selectedKeys(find_path_key(window.location.pathname))
    }, [])
    return (
        <Layout hasSider>
            <Sider
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                }}
            >
                <div className="demo-logo-vertical"/>
                <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}
                      selectedKeys={menu_selectedKeys}
                      items={items}
                      onClick={({item, key, keyPath, domEvent}) => {
                          setMenu_selectedKeys(keyPath);
                          go_to_page(key, router);
                      }}
                />
            </Sider>
            <Layout
                style={{
                    marginLeft: 200,
                }}
            >
                <Header
                    style={{
                        padding: 0,
                        background: colorBgContainer,
                    }}
                />
                <Content
                    style={{
                        margin: '24px 16px 0',
                        overflow: 'initial',
                    }}
                >
                    <div
                        style={{
                            padding: 24,
                            // textAlign: 'center',
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        {children}
                    </div>
                </Content>
                <Footer
                    style={{
                        textAlign: 'center',
                    }}
                >
                    Tools ©{new Date().getFullYear()} Created by FD
                </Footer>
            </Layout>
        </Layout>
    );
};
export default App;