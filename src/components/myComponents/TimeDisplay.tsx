'use client'
import React, { useEffect, useState } from 'react'


function TimeDisplay({ timestamp }: { timestamp: number }) {
    const [formattedTime, setFormattedTime] = useState('')

    useEffect(() => {
        const date = new Date(timestamp)
        const timeStr = date.toTimeString().split(" ")[0].slice(0, 5)
        const dateStr = date.toDateString().slice(4, 15)
        setFormattedTime(`${timeStr}, ${dateStr}`)
    }, [timestamp])

    return <span>{formattedTime}</span>
}

export default TimeDisplay