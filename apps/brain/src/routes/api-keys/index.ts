import { mergeRouters } from '../../lib/trpc'
import { apiKeysMutations } from './mutations'
import { apiKeysQueries } from './queries'

export const apiKeysRouter = mergeRouters(apiKeysMutations, apiKeysQueries)
