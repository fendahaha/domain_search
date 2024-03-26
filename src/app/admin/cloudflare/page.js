'use client'
import React, {useEffect, useState} from 'react';
import {Button, Flex, Input, message, Popconfirm, Space, Table, Tag} from 'antd';
import {frontend, frontend_util} from "@/utils";
import DnsRecords from "@/app/admin/cloudflare/dns_records";
import ZoneCreateButton from "@/app/admin/cloudflare/zone_create_button";
import ZoneDetail from "@/app/admin/cloudflare/zone_detail";

const columns = [
    {
        title: 'Name',
        dataIndex: 'name',
        // sorter: true,
        render: (_, record) => record?.zone?.name,
    },
    {
        title: 'cloudflare',
        dataIndex: 'account_name',
        render: (_, record) => record?.zone?.account_name,
    },
    {
        title: 'name_servers',
        dataIndex: 'name_servers',
        render: (_, record) => {
            let name_servers = record?.zone?.name_servers;
            if (Array.isArray(name_servers)) {
                return name_servers.map((v, i) => (<div key={v}>{v}</div>))
            } else {
                return name_servers
            }
        },
    },
    {
        title: 'status',
        dataIndex: 'status',
        width: 150,
        render: (_, record) => {
            const s = record?.zone?.status;
            let mm = {
                'active': <Tag bordered={true} color="success">active</Tag>,
                'moved': <Tag bordered={true} color="error">moved</Tag>,
                'initializing': <Tag bordered={true} color="orange">initializing</Tag>,
                'pending': <Tag bordered={true} color="processing">pending</Tag>,
            }
            return mm[s] || s
        },
    },
    {
        title: 'platform',
        dataIndex: 'platform',
        render: (_, record) => {
            if (record?.domain) {
                return <span>
                    {record.domain.platform}<br/>
                    ({record.domain.platformId})
                </span>
            }
        },
    },
    {
        title: 'expireDate',
        dataIndex: 'expireDate',
        render: (_, record) => record?.domain?.expireDate,
    },
];
const App = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState();
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 10,
        },
        searchParams: {'domain_name': ''},
    });
    const [editingKey, setEditingKey] = useState('');
    const isEditing = (record) => record.zone.id === editingKey;
    const edit = (record) => {
        setEditingKey(record.zone.id);
        setLoading(true);
        frontend.get('/polls/zone_purge_cached_content', {'zone_id': record.zone.id})
            .then(res => {
                if (res.ok) {
                    return res.json()
                }
                return Promise.resolve(false)
            })
            .then(d => {
                if (d) {
                    messageApi.success({content: 'success'});
                } else {
                    messageApi.error({content: 'fail'});
                }
            })
            .finally(() => {
                setEditingKey('');
                setLoading(false);
            })
    };
    const delete_zone = (record) => {
        setEditingKey(record.zone.id);
        setLoading(true);
        frontend_util.postForm('/polls/cloudflare_zone_delete/', {zone_id: record.zone.id}).then(r => {
            if (r) {
                messageApi.success({content: 'success'});
            } else {
                messageApi.error({content: 'fail'});
            }
        }).finally(() => {
            setEditingKey('');
            setLoading(false);
        })
    }
    const edit_column = {
        title: 'Action',
        key: 'action',
        render: (_, record) => (
            <Space size="middle">
                <Popconfirm title="Sure to clear?" onConfirm={() => edit(record)} disabled={editingKey !== ''}>
                    <Button type="primary" size={'small'}>Clear Cache</Button>
                </Popconfirm>
                {/*<Popconfirm title="Sure to delete?" onConfirm={() => delete_zone(record)} disabled={editingKey !== ''}>*/}
                {/*    <Button type="primary" size={'small'} danger>Delete</Button>*/}
                {/*</Popconfirm>*/}
                <ZoneDetail zone_id={record?.zone?.id}/>
            </Space>
        ),
    };
    const mergedColumns = [...columns, edit_column]
    const fetchData = () => {
        setLoading(true);
        frontend.get('/polls/zone_domain_list/', {...tableParams.pagination, ...tableParams.searchParams})
            .then(res => res.json())
            .then(({data, total}) => {
                setData(data);
                setLoading(false);
                setTableParams({
                    ...tableParams,
                    pagination: {
                        ...tableParams.pagination,
                        total: total,
                    },
                });
            })
    };
    useEffect(() => {
        fetchData();
    }, [JSON.stringify(tableParams)]);
    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            ...tableParams,
            filters,
            ...sorter,
            pagination,
        });
        // `dataSource` is useless since `pageSize` changed
        if (pagination.pageSize !== tableParams.pagination?.pageSize) {
            setData([]);
        }
    };
    const onSearch = (value) => {
        setTableParams({
            ...tableParams,
            searchParams: {
                ...tableParams.searchParams,
                ...{'domain_name': value.trim()},
            }
        });
    }
    return (
        <Space direction={'vertical'} size={'middle'} style={{'width': '100%'}}>
            {contextHolder}
            <Flex justify={'flex-start'} align={'center'} gap={'middle'}>
                <Input.Search
                    placeholder="domainName"
                    allowClear
                    enterButton="Search"
                    size="large"
                    style={{width: '50%', minWidth: 200}}
                    onSearch={onSearch}
                />
                <ZoneCreateButton/>
            </Flex>
            <Table
                sticky={{offsetHeader: 5,}}
                size={'small'}
                columns={mergedColumns}
                rowKey={(record) => record.zone.id}
                dataSource={data}
                pagination={tableParams.pagination}
                loading={loading}
                onChange={handleTableChange}
                expandable={{
                    rowExpandable: (record) => true,
                    expandedRowRender: (record) => {
                        return <DnsRecords zone_id={record.zone.id}/>
                    },
                }}
            />
        </Space>

    );
};
export default App;