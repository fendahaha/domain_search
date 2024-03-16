'use client'
import React, {useEffect, useState} from 'react';
import {MinusCircleOutlined, PlusOutlined} from '@ant-design/icons';
import {Button, Form, Input, message, Select, Space, Spin, Switch, Tag, Typography} from 'antd';
import {frontend} from "@/utils";

const dns_allowed_type = ['A', 'CNAME', 'MX', 'TXT'];
const proxied_type = ['A', 'CNAME']

function can_proxy(type) {
    return !(type && !proxied_type.includes(type));
}

function record_equal(r1, r2) {
    const fields = ['type', 'name', 'content', 'proxied'];
    let b = true;
    fields.forEach((_) => {
        if (r1[_] !== r2[_]) {
            b = false
        }
    })
    return b
}

const DNSRecord = ({params}) => {
    const {key, name, restField, remove, records} = params
    const [proxied, setProxied] = useState(can_proxy(records[key]?.type));
    const onSelectType = (value) => {
        setProxied(can_proxy(value))
    }
    return (
        <Space
            style={{
                display: 'flex',
                marginBottom: 8,
            }}
            align="baseline"
        >
            <Form.Item
                label="Type"
                {...restField}
                name={[name, 'type']}
                rules={[{required: true,},]}
                initialValue={'A'}
            >
                <Select style={{width: '100px',}} onChange={onSelectType}>
                    {dns_allowed_type.map((e) => {
                        return <Select.Option value={e} key={e}>{e}</Select.Option>
                    })}
                </Select>
            </Form.Item>
            <Form.Item
                label="Name"
                {...restField}
                name={[name, 'name']}
                rules={[{required: true,},]}
            >
                <Input placeholder="First Name"/>
            </Form.Item>
            <Form.Item
                label="Content"
                {...restField}
                name={[name, 'content']}
                rules={[{required: true,},]}
            >
                <Input placeholder="Last Name"/>
            </Form.Item>
            <Form.Item
                label="Proxied"
                valuePropName="checked"
                {...restField}
                name={[name, 'proxied']}
            >
                <Switch disabled={!proxied}/>
            </Form.Item>
            <MinusCircleOutlined onClick={() => remove(name)}/>
        </Space>
    )
}

export default function DnsRecords({zone_id}) {
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [buttonDisable, setButtonDisable] = useState(true);
    const load_data = () => {
        return frontend.get("/polls/dns_records_get", {'zone_id': zone_id})
            .then(res => res.ok ? res.json() : Promise.reject(false))
            .then(d => {
                // console.log(d);
                d = d.filter((_, idx) => dns_allowed_type.includes(_['type']))
                setRecords(d);
                form.setFieldsValue({records: d});
            })
    }
    useEffect(() => {
        setLoading(true);
        load_data().finally(() => {
            setLoading(false)
        })
    }, []);
    const onFinish = (values) => {
        setLoading(true);
        let new_records = values['records'];
        new_records.forEach((_) => {
            _['proxied'] = _['proxied'] ? true : false;
            _['name'] = _['name'].trim().toLowerCase()
        })
        let added_records = new_records.filter((_) => !_['id']);
        let arr1 = new_records.filter((_) => !!_['id']);
        let deleted_records = records.filter((_) => {
            let dns_record_id = _['id'];
            let result = arr1.find((_) => _['id'] === dns_record_id);
            return !result;
        });
        let arr2 = records.filter((_) => {
            let dns_record_id = _['id'];
            let result = arr1.find((_) => _['id'] === dns_record_id);
            return !!result;
        });
        let updated_records = arr2.map((_) => {
            let dns_record_id = _['id'];
            let result = new_records.find((_) => _['id'] === dns_record_id);
            if (!record_equal(_, result)) {
                return result
            } else {
                return null
            }
        }).filter((_) => !!_);
        [...added_records, ...updated_records].forEach((_) => {
            if (_['type'] === 'MX') {
                _['priority'] = _['priority'] ? _['priority'] : 0;
            }
        })

        const _post = (url, data) => {
            return frontend.postJson(url, data).then(res => {
                return res.ok ? res.json() : Promise.reject(false)
            }).then(r => r ? r : Promise.reject(false))
        }
        let added_records_results = added_records.map((_) => {
            let data = {zone_id, ..._}
            return _post("/polls/dns_records_create/", data);
        })
        let deleted_records_results = deleted_records.map((_) => {
            let data = {zone_id, id: _['id']}
            return _post("/polls/dns_records_delete/", data);
        })
        let updated_records_results = updated_records.map((_) => {
            let data = {zone_id, ..._}
            return _post("/polls/dns_records_update/", data);
        })
        Promise.allSettled([...added_records_results, ...deleted_records_results, ...updated_records_results])
            .then((results) => {
                let errors = results.filter((_) => _['status'] === 'rejected');
                if (errors.length) {
                    messageApi.error({content: 'fail'});
                } else {
                    messageApi.success({content: 'success'});
                }
                return load_data()
            })
            .finally(() => {
                setLoading(false);
            })
    };
    const onReset = () => {
        form.setFieldsValue({records: records});
    }
    return (
        <Spin spinning={loading}>
            {contextHolder}
            <Form
                form={form}
                name="dynamic_form_nest_item"
                style={{width: '100%'}}
                onFinish={onFinish}
                autoComplete="off"
                onValuesChange={(changedValues, allValues) => setButtonDisable(false)}
            >
                <Space direction={'vertical'} size={'small'}>
                    <div style={{textAlign: 'center'}}>
                        只显示&nbsp;{dns_allowed_type.map(e => <Tag color="orange" key={e}>{e}</Tag>)}类型
                    </div>
                    <Form.List name="records">
                        {(fields, {add, remove}) => {
                            return (
                                <>
                                    {fields.map(({key, name, ...restField}) => {
                                        let params = {key, name, restField, remove, records}
                                        return <DNSRecord key={key} params={params}/>
                                    })}
                                    <Form.Item>
                                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined/>}>
                                            Add field
                                        </Button>
                                    </Form.Item>
                                </>
                            )
                        }}
                    </Form.List>
                    <Space size={'large'} style={{'display': 'flex', 'justifyContent': 'center'}}>
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
                </Space>
            </Form>
        </Spin>
    );
}