'use client'
import {useEffect, useState} from "react";
import {frontend} from "@/utils";

export default function Page() {
    const [s, update_s] = useState(null);
    useEffect(() => {
        frontend.get('/')
            .then(res => {
                if (res.ok) {
                    res.text().then(d => {
                        update_s(d)
                    })
                }
            })
            .catch(reason => {
                console.log(reason);
            })
    }, [])
    return (
        <div>
            admin-home{s}
        </div>
    )
}