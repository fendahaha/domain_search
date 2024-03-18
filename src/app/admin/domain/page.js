'use client'
import React, {useEffect, useState} from 'react';
import {Button, DatePicker, Form, Input, Space, Table} from 'antd';
import {frontend} from "@/utils";
import * as XLSX from 'xlsx';

const columns = [
    {
        title: 'Name',
        dataIndex: 'name',
        render: (name, record) => record?.domain?.domainName,
    },
    {
        title: 'platform',
        dataIndex: 'platform',
        render: (name, record) => {
            if (record?.domain) {
                return <span>
                    {record.domain.platform}<br/>
                    ({record.domain.platformId})
                </span>
            }
        },
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
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 10,
        },
        searchParams: {'domain_name': '', 'expire_dates': null},
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

    const [form] = Form.useForm();
    const onSearch = (values) => {
        values['domain_name'] = values['domain_name'] ? values['domain_name'].trim() : '';
        values['expire_dates'] = values['expire_dates'] ? values['expire_dates'].map((_) => _.format('YYYY-MM-DD 00:00:00')) : null;
        values['expire_dates'] = JSON.stringify(values['expire_dates']);
        setTableParams({
            ...tableParams,
            searchParams: {
                ...tableParams.searchParams,
                ...values,
            }
        });
    };
    const export_data = () => {
        setLoading(true);
        let rows = data.map((_) => {
            const domain = _['domain'];
            return {
                'domainName': domain['domainName'],
                'expireDate': domain['expireDate'],
                'createDate': domain['createDate'],
                'platform': `${domain['platform']}(${domain['platformId']})`,
            }
        })
        const header = ['domainName', 'expireDate', 'createDate', 'platform'];
        const worksheet = XLSX.utils.json_to_sheet(rows, {header: header});
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "域名");
        XLSX.utils.sheet_add_aoa(worksheet, [header], {origin: "A1"});
        const max_width = rows.reduce((w, r) => Math.max(w, r.platform.length), 10);
        worksheet["!cols"] = [{wch: max_width}, {wch: max_width}, {wch: max_width}, {wch: max_width}];
        XLSX.writeFile(workbook, "域名.xlsx");
        setLoading(false);
    }
    return (
        <Space direction={'vertical'} size={'large'} style={{'width': '100%'}}>
            <Form form={form} name="horizontal_login" layout="inline" onFinish={onSearch}>
                <Form.Item name="domain_name">
                    <Input placeholder="domainName"/>
                </Form.Item>
                <Form.Item name="expire_dates" label={'expireDate'}>
                    <DatePicker.RangePicker/>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" disabled={loading}>
                        Search
                    </Button>
                </Form.Item>
                <Form.Item>
                    <Button onClick={export_data} disabled={loading}>
                        Export
                    </Button>
                </Form.Item>
            </Form>
            <Table
                sticky={{offsetHeader: 5,}}
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