'use client'
import React, {useEffect, useState} from 'react';
import {Divider, List, Space, Spin, Typography} from 'antd';
import {frontend} from "@/utils";

export default function Page() {
    const [loading, setLoading] = useState(false);
    const [accounts, setAccounts] = useState({});
    const renderItem = (item) => (
        <List.Item>
            <Space size={"middle"}>
                <Typography.Text mark>[AccountName]</Typography.Text>
                <span>{item['id']}</span>
            </Space>
        </List.Item>
    )
    useEffect(() => {
        setLoading(true);
        frontend.get("/polls/account_list/").then(res => {
            if (res.ok) {
                return res.json()
            }
        }).then((data) => {
            if (data) {
                setAccounts(data)
            }
        }).catch(reason => {

        }).finally(() => {
            setLoading(false)
        })
    }, []);
    return (
        <Spin spinning={loading}>
            {Object.keys(accounts).map((key) => {
                return (
                    <div key={key}>
                        <Divider orientation="left">{key}</Divider>
                        <List bordered dataSource={accounts[key]} renderItem={renderItem}/>
                    </div>
                )
            })}
        </Spin>
    );
}