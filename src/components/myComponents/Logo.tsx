import { Sparkles } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

function Logo() {
    return (
        <Link href="/">
            <div className="flex items-end space-x-2 font-semibold">
                <span className="text-2xl text-gray-600">du-be-doos</span>
                <div className="relative flex items-center">
                    <span className="text-3xl font-bold text-gray-800">2.o</span>
                    <Sparkles
                        className="absolute -top-2 -right-4 text-yellow-400"
                        size={20}
                        strokeWidth={1.5}
                    />
                </div>
            </div>
        </Link>
    )
}

export default Logo