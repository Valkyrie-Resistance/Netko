import { mergeRouters } from '../../lib/trpc'
import { threadsMutations } from './mutations'
import { threadsQueries } from './queries'

export const threadsRouter = mergeRouters(threadsQueries, threadsMutations)
