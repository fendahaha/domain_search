'use client'
import React, {useEffect, useState} from 'react';
import {AntCloudOutlined, BarChartOutlined, DownOutlined, GlobalOutlined, UserOutlined,} from '@ant-design/icons';
import {Avatar, Dropdown, Flex, Layout, Menu, Space, Spin, theme} from 'antd';
import {useRouter} from "next/navigation";
import {useUser, withPageAuthRequired} from '@auth0/nextjs-auth0/client';
import Loading from "@/components/Loading";

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
    {
        key: '4',
        icon: <BarChartOutlined/>,
        label: `accounts`,
        path: '/admin/account',
    },
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

const MyUser = () => {
    const {user, error, isLoading} = useUser();
    if (isLoading) {
        return <Spin/>;
    }
    if (error) {
        return <Avatar style={{color: 'red'}}>Error</Avatar>
    }
    return (
        <>
            {
                user && (
                    <Dropdown menu={{
                        items: [
                            {
                                key: '1',
                                label: <a href="/api/auth/logout">logout</a>,
                            }
                        ]
                    }} arrow={true}>
                        <a>
                            <Space>
                                <Avatar style={{backgroundColor: '#87d068',}} icon={<UserOutlined/>}
                                        size={'default'} src={user.picture}/>
                                {user.name}
                                <DownOutlined/>
                            </Space>
                        </a>
                    </Dropdown>
                )
            }
        </>
    )
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
            <Layout style={{marginLeft: 200,}}>
                <Header style={{padding: '0 10px', background: colorBgContainer}}>
                    <Flex align={'center'} justify={'space-between'}>
                        <div className={'left'}></div>
                        <div className={'right'} style={{padding: '0 20px'}}>
                            <MyUser/>
                        </div>
                    </Flex>
                </Header>
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
// export default App;
export default withPageAuthRequired(App, {
    onRedirecting: () => <Loading/>,
    onError: error => <div>{error.message}</div>
});
