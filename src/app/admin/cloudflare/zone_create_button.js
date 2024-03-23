import {Button, Flex, Form, Input, message, Modal, Select, Tag} from "antd";
import {useEffect, useState} from "react";
import {frontend_util} from "@/utils";

const customizeRequiredMark = (label, {required}) => (
    <>
        {required ? <Tag color="error">Required</Tag> : <Tag color="warning">optional</Tag>}
        {label}
    </>
);
export default function ZoneCreateButton() {
    const [messageApi, contextHolder] = message.useMessage();
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [accounts_options, setAccounts_options] = useState([]);
    const onCancel = () => {
        if (!loading) {
            setOpen(false)
        }
    }
    const onFinish = (values) => {
        setLoading(true);
        console.log(values);
        frontend_util.postForm('/polls/cloudflare_zone_create/', values).then(r => {
            if (r) {
                console.log(r);
                messageApi.success({content: 'success'});
                form.setFieldValue('name', '');
            } else {
                messageApi.error({content: 'fail'});
            }
        }).finally(() => {
            setLoading(false)
        })
    }
    useEffect(() => {
        setLoading(true);
        frontend_util.get('/polls/cloudflare_member_list/')
            .then(result => {
                if (result) {
                    const options = result.map(_ => ({value: _['account']['id'], label: _['account']['name']}));
                    setAccounts_options(options)
                }
            })
            .finally(() => setLoading(false))
    }, []);
    return (
        <div>
            {contextHolder}
            <Button type="primary" size={'large'} onClick={() => setOpen(true)}>Create</Button>
            <Modal
                title="Create Zone"
                centered
                destroyOnClose={true}
                open={open}
                onCancel={onCancel}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{}}
                    requiredMark={customizeRequiredMark}
                    onFinish={onFinish}
                >
                    <Form.Item label="DomainName" name='name' tooltip="This is required"
                               rules={[{required: true}]}>
                        <Input placeholder="example.com"/>
                    </Form.Item>
                    <Form.Item label="Account" name='account_id' tooltip='This is required'
                               rules={[{required: true}]}>
                        <Select options={accounts_options}/>
                    </Form.Item>
                    <Flex gap={'middle'} justify={'center'} align={'center'}>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Submit
                        </Button>
                        <Button htmlType="reset" disabled={loading}>reset</Button>
                    </Flex>
                </Form>
            </Modal>
        </div>
    );
}