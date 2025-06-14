import { prisma } from '@chad-chat/brain-repository'

export interface Context {
  session: {
    user: {
      id: string
      name: string
      email: string
      emailVerified: boolean
      image?: string | null
      role?: 'ADMIN' | 'USER'
    } | null
  } | null
}

export const createContext = async (req: Request): Promise<Context> => {
  const token = req.headers.get('authorization')?.split(' ')[1]
  if (!token) {
    return { session: null }
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: true,
    },
  })

  if (!session || session.expiresAt < new Date()) {
    return { session: null }
  }

  return {
    session: {
      user: session.user,
    },
  }
}

export type ContextType = Awaited<ReturnType<typeof createContext>>
