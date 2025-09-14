import { mergeRouters } from '../../lib/trpc'
import { modelsMutations } from './mutations'
import { modelsQueries } from './queries'

export const modelsRouter = mergeRouters(modelsQueries, modelsMutations)
