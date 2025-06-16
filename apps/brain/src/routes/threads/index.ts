import { mergeRouters } from '../../lib/trpc'
import { threadsMutations } from './mutations'
import { threadsQueries } from './queries'
import { threadsSubscriptions } from './subscriptions'

export const threadsRouter = mergeRouters(threadsQueries, threadsMutations, threadsSubscriptions)
