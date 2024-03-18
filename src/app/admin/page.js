'use client'
import {Button, Card, Col, message, Row, Space, Spin} from 'antd';
import {frontend} from "@/utils";
import React, {useEffect, useMemo, useRef, useState} from "react";
import * as echarts from 'echarts';
import dayjs from "dayjs";

const _get = (url, data = null) => {
    return frontend.get(url, data)
        .then(res => {
            return res.ok ? res.json() : Promise.reject(false)
        })
        .then(r => r ? r : Promise.reject(false))
        .catch(reason => Promise.reject(false))
}
const CacheCLearCard = ({url, title, children}) => {
    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(false);
    const clear_cache = () => {
        setLoading(true);
        _get(url)
            .then(r => {
                if (r) {
                    messageApi.success({content: 'success'});
                } else {
                    messageApi.error({content: 'fail'});
                }
            })
            .finally(() => setLoading(false))
    }
    return (
        <div>
            {contextHolder}
            <Card title={title} bordered={false} hoverable
                  extra={<Button onClick={clear_cache} loading={loading}>Clear</Button>}>
                {children}
            </Card>
        </div>
    )
}

function get_date_range(days = 15) {
    let now = dayjs();
    let end = dayjs().date(now.date() + days)
    let fmt = "YYYY-MM-DD";
    return [now.format(fmt), end.format(fmt)]
}

const DomainExpiresCharts = () => {
    const [loading, setLoading] = useState(false);
    const targetRef = useRef(null);
    const chartRef = useRef(null);
    const [x_data, set_x_data] = useState([]);
    const [y_data, set_y_data] = useState([]);
    const options = useMemo(() => {
        return {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: [
                {
                    type: 'category',
                    // data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    data: x_data,
                    axisTick: {
                        alignWithLabel: true
                    }
                }
            ],
            yAxis: [
                {
                    type: 'value'
                }
            ],
            series: [
                {
                    name: 'Direct',
                    type: 'bar',
                    barWidth: '60%',
                    // data: [10, 52, 200, 334, 390, 330, 220],
                    data: y_data
                }
            ]
        }
    }, [x_data, y_data]);

    useEffect(() => {
        if (!chartRef.current) {
            chartRef.current = echarts.init(targetRef.current, 'dark');
        }
        chartRef.current.setOption(options);
    }, [options]);
    useEffect(() => {
        setLoading(true);
        let expire_dates = get_date_range(15);
        _get('/polls/domain_expires/', {'expire_dates': JSON.stringify(expire_dates)}).then(d => {
            let x_data = d.map((_) => dayjs(_.start).format('YYYY/MM/DD'));
            let y_data = d.map((_) => _.domains);
            set_x_data(x_data);
            set_y_data(y_data);
        }).finally(() => {
            setLoading(false);
        })
    }, []);
    return (
        <div>
            <Spin spinning={loading}>
                <div ref={targetRef} style={{'height': '500px', 'width': '100%'}}></div>
            </Spin>
        </div>
    )
}
export default function Page() {
    return (
        <div>
            <Space size={"middle"} direction={"vertical"} style={{'width': '100%'}}>
                <Row gutter={16}>
                    <Col span={8}>
                        <CacheCLearCard title={'cloudflares cache'} url={'/polls/update_cache_zone_list/'}>
                            緩存每天會更新一次，也可執行此操作去獲取cloudflare中最新內容
                        </CacheCLearCard>
                    </Col>
                    <Col span={8}>
                        <CacheCLearCard title={'domains cache'} url={'/polls/update_cache_domain_list/'}>
                            緩存每天會更新一次，也可執行此操作去獲取域名平台中最新內容
                        </CacheCLearCard>
                    </Col>
                    <Col span={8}>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={24}>
                        <Card title={"未来15天即将过期域名分布图"} bordered={false} hoverable>
                            <DomainExpiresCharts/>
                        </Card>
                    </Col>
                </Row>
            </Space>
        </div>
    )
}