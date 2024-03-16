'use client'
import React, {useEffect, useState} from 'react';
import {Input, Space, Table} from 'antd';
import {frontend} from "@/utils";

const columns = [
    {
        title: 'Name',
        dataIndex: 'name',
        render: (name, record) => record?.domain?.domainName,
    },
    {
        title: 'platform',
        dataIndex: 'platform',
        render: (name, record) => record?.domain?.platform,
    },
    {
        title: 'locked',
        dataIndex: 'locked',
        render: (name, record) => {
            const locked = record?.domain?.locked;
            if (locked === true) {
                return 'Yes'
            } else if (locked === false) {
                return 'No'
            } else {
                return ''
            }
        },
    },
    {
        title: 'expireDate',
        dataIndex: 'expireDate',
        render: (name, record) => record?.domain?.expireDate,
    },
    {
        title: 'cloudflare',
        dataIndex: 'account_name',
        render: (name, record) => record?.zone?.account_name,
    },
];
const App = () => {
    const [data, setData] = useState();
    const [loading, setLoading] = useState(false);
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 10,
        },
        searchParams: {'domain_name': ''},
    });
    const fetchData = () => {
        setLoading(true);
        frontend.get('/polls/domain_zone_list/', {...tableParams.pagination, ...tableParams.searchParams})
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
            <Input.Search
                placeholder="domainName"
                allowClear
                enterButton="Search"
                size="large"
                onSearch={onSearch}
            />
            <Table
                columns={columns}
                rowKey={(record) => record.domain.domainName}
                dataSource={data}
                pagination={tableParams.pagination}
                loading={loading}
                onChange={handleTableChange}
            />
        </Space>
    );
};
export default App;