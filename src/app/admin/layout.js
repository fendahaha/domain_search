'use client'
import React from 'react';
import {
    AppstoreOutlined,
    BarChartOutlined,
    CloudOutlined,
    ShopOutlined,
    TeamOutlined,
    UploadOutlined,
    UserOutlined,
    VideoCameraOutlined,
} from '@ant-design/icons';
import {Layout, Menu, theme} from 'antd';
import {useRouter} from "next/navigation";

const {Header, Content, Footer, Sider} = Layout;
// const items = [
//     UserOutlined,
//     VideoCameraOutlined,
//     UploadOutlined,
//     BarChartOutlined,
//     CloudOutlined,
//     AppstoreOutlined,
//     TeamOutlined,
//     ShopOutlined,
// ].map((icon, index) => ({
//     key: String(index + 1),
//     icon: React.createElement(icon),
//     label: `nav ${index + 1}`,
// }));

function getItem(key, label, icon, path, children, type) {
    return {
        key,
        icon,
        children,
        label,
        type,
        path
    };
}

const items = [
    {
        key: '1',
        icon: React.createElement(UserOutlined),
        label: `Home`,
        path: '/admin',
    },
    {
        key: '2',
        icon: React.createElement(VideoCameraOutlined),
        label: `cloudflare`,
        path: '/admin/cloudflare',
    },
    {
        key: '3',
        icon: React.createElement(UploadOutlined),
        label: `domain`,
        path: '/admin/domain',
    },
    {
        key: '4',
        icon: React.createElement(BarChartOutlined),
        label: `other`,
        path: '/',
    },
]

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
                <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']} items={items}
                      onClick={(data) => {
                          console.log(data);
                          go_to_page(data['key'], router)
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
                    Ant Design ©{new Date().getFullYear()} Created by Ant UED
                </Footer>
            </Layout>
        </Layout>
    );
};
export default App;