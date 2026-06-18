import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const FAMILY_PASSWORD = process.env.FINANCE_PASSWORD || 'rosefamily2026'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Family Password',
      credentials: {
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (credentials?.password === FAMILY_PASSWORD) {
          return { id: '1', name: 'Rose Family', email: 'family@rosefamily.com' }
        }
        return null
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/finance/login',
    error: '/finance/login',
  },
})

export { handler as GET, handler as POST }
