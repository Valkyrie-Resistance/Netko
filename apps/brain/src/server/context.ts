import type { Session } from '@chad-chat/brain-domain'
import { auth } from '@chad-chat/brain-service'

export interface Context {
  session: Session | null
}

export const createContext = async (req: Request): Promise<Context> => {
  const token = req.headers.get('authorization')?.split(' ')[1]
  if (!token) {
    return { session: null }
  }

  const session = await auth.api.getSession({
    headers: req.headers,
  })

  return {
    session: session
      ? {
          user: session.user,
        }
      : null,
  }
}

export type ContextType = Awaited<ReturnType<typeof createContext>>
