
import GoogleProvider from "next-auth/providers/google"
import type { NextAuthOptions } from 'next-auth'
import { getServerSession } from 'next-auth'

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: '/login',
        // signIn: '/auth/signin',
    },
}

// In next-auth v4, prefer getServerSession for server usage
export const auth = () => getServerSession(authOptions)

// For client usage, import signIn/signOut from 'next-auth/react'
// export { signIn, signOut } from 'next-auth/react'
