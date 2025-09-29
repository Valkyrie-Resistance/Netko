import { mergeRouters } from '../../integrations/trpc/init'
import { apiKeysMutations } from './mutations'
import { apiKeysQueries } from './queries'

export const apiKeysRouter = mergeRouters(apiKeysMutations, apiKeysQueries)
