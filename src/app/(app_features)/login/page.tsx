"use client"

import { LoaderOne } from '@/components/ui/loader'
import { signIn } from 'next-auth/react'
import React, { useEffect, } from 'react'

function page() {
    useEffect(() => {
        signIn('google', { callbackUrl: '/workspace' })
    }, [])
    return (
        <div className='h-lvh w-lvw bg-background flex items-center justify-center'>
            <LoaderOne />
        </div>
    )
}

export default page