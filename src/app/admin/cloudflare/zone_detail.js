import {
    Button,
    Divider,
    Empty,
    Form,
    Input,
    message,
    Modal,
    Popconfirm,
    Select,
    Space,
    Spin,
    Switch,
    Table,
    Tag,
    Typography
} from "antd";
import React, {useEffect, useMemo, useState} from "react";
import {frontend_util} from "@/utils";
import {MinusCircleOutlined, PlusOutlined} from "@ant-design/icons";
const RedirectRule = ({params}) => {
    const {key, name, restField, remove, record} = params
    return (
        <Space size={'small'} align={'baseline'} wrap={true} style={{'display': 'flex', 'justifyContent': 'center'}}>
            <Form.Item
                label="ruleName"
                {...restField}
                name={[name, 'description']}
                rules={[{required: true,},]}
            >
                <Input placeholder="" style={{width: '220px'}}/>
            </Form.Item>
            <Form.Item
                label="enabled"
                valuePropName="checked"
                {...restField}
                name={[name, 'enabled']}
                initialValue={true}
            >
                <Switch/>
            </Form.Item>
            <Form.Item
                label="expression"
                {...restField}
                name={[name, 'expression']}
                rules={[{required: true,},]}
                initialValue={'true'}
            >
                <Input placeholder="" disabled style={{width: '80px'}}/>
            </Form.Item>
            <Form.Item
                label="target_url"
                {...restField}
                name={[name, 'target_url']}
                rules={[{required: true,},]}
            >
                <Input style={{width: '240px'}}/>
            </Form.Item>
            <Form.Item
                label="preserve_query_string"
                {...restField}
                name={[name, 'preserve_query_string']}
                initialValue={false}
            >
                <Switch/>
            </Form.Item>
            <Form.Item
                label="status_code"
                {...restField}
                name={[name, 'status_code']}
                rules={[{required: true,},]}
                initialValue={'301'}
            >
                <Select style={{width: '70px'}}>
                    <Select.Option value='301'>301</Select.Option>
                    <Select.Option value='302'>302</Select.Option>
                    <Select.Option value='303'>303</Select.Option>
                    <Select.Option value='307'>307</Select.Option>
                    <Select.Option value='308'>308</Select.Option>
                </Select>
            </Form.Item>
            <MinusCircleOutlined onClick={() => remove(name)}/>
        </Space>
    )
}

const RedirectRules = ({zone_id}) => {
    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(false);
    const [ruleset_redirect, setRuleset_redirect] = useState([]);
    useEffect(() => {
        setLoading(true);
        frontend_util.get('/polls/zone_ruleset_get/', {
            zone_id: zone_id,
            phase: 'http_request_dynamic_redirect'
        }).then(r => {
            setRuleset_redirect(r);
        }).finally(() => setLoading(false))
    }, []);
    const rules = useMemo(() => {
        let rules = ruleset_redirect?.rules || []
        return rules.map(_ => {
            const from_value = _.action_parameters.from_value
            return {
                ..._,
                'preserve_query_string': from_value.preserve_query_string,
                'status_code': from_value.status_code,
                'target_url': from_value.target_url.value,
            }
        })
    }, [ruleset_redirect]);

    const [form] = Form.useForm();
    const [buttonDisable, setButtonDisable] = useState(true);
    const onReset = () => {
        form.setFieldValue('rules', rules);
    }
    useEffect(() => {
        form.setFieldValue('rules', rules);
    }, [rules])
    const onFinish = (values) => {
        setLoading(true);
        let ruleset_obj = {
            ...ruleset_redirect,
            rules: values['rules'],
        }
        frontend_util.postJson('/polls/zone_ruleset_update/', {
            'zone_id': zone_id,
            'ruleset_id': ruleset_redirect['id'],
            'ruleset_obj': ruleset_obj
        }).then(r => {
            if (r) {
                setRuleset_redirect(r);
                messageApi.success('success');
            } else {
                messageApi.error('fail');
            }
        }).finally(() => {
            setLoading(false);
        })
    }
    return (
        <Spin spinning={loading}>
            {contextHolder}
            <Form
                form={form}
                name="RedirectRules"
                onFinish={onFinish}
                autoComplete="off"
                onValuesChange={(changedValues, allValues) => setButtonDisable(false)}
            >
                <Form.List name="rules">
                    {(fields, {add, remove}) => {
                        return (
                            <>
                                {fields.map(({key, name, ...restField}) => {
                                    return <RedirectRule key={key} params={{
                                        key,
                                        name,
                                        restField,
                                        remove,
                                        record: rules[key]
                                    }}/>
                                })}
                                <Space size={'large'} style={{'display': 'flex', 'justifyContent': 'center'}}>
                                    <Form.Item>
                                        <Button type="dashed" onClick={() => add()} block={false} icon={<PlusOutlined/>}>
                                            Add field
                                        </Button>
                                    </Form.Item>
                                    <Form.Item>
                                        <Button type="default" onClick={onReset} disabled={buttonDisable}>
                                            Reset
                                        </Button>
                                    </Form.Item>
                                    <Form.Item>
                                        <Button type="default" htmlType="submit" disabled={buttonDisable}>
                                            Submit
                                        </Button>
                                    </Form.Item>
                                </Space>
                            </>
                        )
                    }}
                </Form.List>
            </Form>
        </Spin>
    )
}

const PageRules = ({zone_id}) => {
    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(false);
    const [pageRules, setPageRules] = useState([])
    useEffect(() => {
        setLoading(true);
        frontend_util.get("/polls/zone_pagerules/", {zone_id}).then(r => {
            if (r) {
                setPageRules(r);
            }
        }).finally(() => setLoading(false))
    }, []);

    const [editingKey, setEditingKey] = useState('');
    const delete_pageRule = (record) => {
        setEditingKey(record.id);
        setLoading(true);
        frontend_util.postForm('/polls/zone_pagerule_delete/', {zone_id: zone_id, pagerule_id: record.id}).then(r => {
            if (r && r?.id) {
                let rules = pageRules.filter((_) => _.id !== r.id)
                setPageRules(rules);
                messageApi.success('success');
            } else {
                messageApi.error('fail');
            }
        }).finally(() => {
            setEditingKey('');
            setLoading(false);
        })
    }
    const columns = [
        {
            title: 'priority',
            dataIndex: 'priority',
            width: 80,
        },
        {
            title: 'Url',
            dataIndex: ['targets', 0, 'constraint', 'value'],
            width: 200,
            ellipsis: true,
        },
        {
            title: 'Action',
            dataIndex: ['actions', 0, 'id'],
            width: 150,
            ellipsis: true,
        },
        {
            title: 'Action Value',
            dataIndex: ['actions', 0, 'value'],
            render: (text, record) => {
                return JSON.stringify(record['actions'][0].value)
            },
            ellipsis: true,
        },
        {
            title: 'status',
            dataIndex: 'status',
            width: 80,
            render: (_, record) => {
                let mm = {
                    'active': <Tag bordered={true} color="success">active</Tag>,
                    'disabled': <Tag bordered={true} color="error">disabled</Tag>,
                }
                return mm[_] || _
            },
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Popconfirm title="Sure to delete?" onConfirm={() => delete_pageRule(record)}
                                disabled={editingKey !== ''}>
                        <Button type="primary" size={'small'} danger>Delete</Button>
                    </Popconfirm>
                </Space>
            ),
            width: 100,
        },
    ];
    return (
        <Spin spinning={loading}>
            {contextHolder}
            {pageRules.length ?
                <Table size='small' dataSource={pageRules} columns={columns}
                       rowKey={(record) => record.id}
                       pagination={false}/>
                : <Empty/>}
        </Spin>
    )
}
const allowed_setting = ["always_use_https", "automatic_https_rewrites", "development_mode", "ssl"];
const ZoneSettings = ({zone_id}) => {
    const [loading, setLoading] = useState(false);
    const [zone_settings, setZone_settings] = useState([]);
    useEffect(() => {
        setLoading(true);
        frontend_util.get('/polls/cloudflare_zone_settings/', {zone_id}).then(r => {
            console.log(r);
            r = r.filter(_ => _.editable)
            let r2 = r.filter(_ => allowed_setting.find(i => i === _.id));
            setZone_settings(r2);
        }).finally(() => setLoading(false))
    }, []);
    const columns = [
        {
            title: 'name',
            dataIndex: 'id',
            width: '30%',
        },
        {
            title: 'value',
            dataIndex: 'value',
            width: '30%',
        },
        {
            title: 'modified_on',
            dataIndex: 'modified_on',
            render: (text) => {
                if (text) {
                    const dateObj = new Date(text);
                    const formattedDate = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, "0")}-${dateObj.getDate().toString().padStart(2, "0")} ${dateObj.getHours().toString().padStart(2, "0")}:${dateObj.getMinutes().toString().padStart(2, "0")}:${dateObj.getSeconds().toString().padStart(2, "0")}`;
                    return formattedDate
                }
            }
        },
        // {
        //     title: 'editable',
        //     dataIndex: 'editable',
        //     width: '30%',
        //     render: (text) => {
        //         return text ? 'Yes' : 'No'
        //     }
        // },
    ]
    return (
        <Spin spinning={loading}>
            <Table size='small' dataSource={zone_settings} columns={columns}
                   rowKey={(record) => record.id}
                   pagination={false}/>
        </Spin>
    )
}
export default function ZoneDetail({zone_id}) {
    const [open, setOpen] = useState(false);
    return (
        <div>
            <Button type="primary" size={'small'} onClick={() => setOpen(true)}>Detail</Button>
            <Modal
                title=""
                centered
                destroyOnClose={false}
                open={open}
                onCancel={() => setOpen(false)}
                footer={null}
                width={1450}
            >
                <div>
                    <Divider orientation="left">
                        Redirect Rules
                    </Divider>
                    <RedirectRules zone_id={zone_id}/>
                    <Divider orientation="left">
                        Page Rules
                    </Divider>
                    <PageRules zone_id={zone_id}/>
                    <Divider orientation="left">
                        SSL Settings
                    </Divider>
                    <ZoneSettings zone_id={zone_id}/>
                </div>
            </Modal>
        </div>
    );
}