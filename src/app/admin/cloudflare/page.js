'use client'
import React, {useEffect, useState} from 'react';
import {Button, message, Popconfirm, Space, Table, Input} from 'antd';
import {frontend} from "@/utils";
import DnsRecords from "@/app/admin/cloudflare/dns_records";

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
    const edit_column = {
        title: 'Action',
        key: 'action',
        render: (_, record) => (
            <Space size="middle">
                <Popconfirm title="Sure to clear?" onConfirm={() => edit(record)} disabled={editingKey !== ''}>
                    <Button type="primary" danger>Clear Cache</Button>
                </Popconfirm>
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
        <Space direction={'vertical'} size={'large'} style={{'width': '100%'}}>
            {contextHolder}
            <Input.Search
                placeholder="domainName"
                allowClear
                enterButton="Search"
                size="large"
                onSearch={onSearch}
            />
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
                        // return <p style={{margin: 0,}}>{record.zone.name}</p>
                    },
                }}
            />
        </Space>

    );
};
export default App;