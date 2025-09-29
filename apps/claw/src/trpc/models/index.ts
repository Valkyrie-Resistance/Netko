import { mergeRouters } from '../../integrations/trpc/init'
import { modelsMutations } from './mutations'
import { modelsQueries } from './queries'

export const modelsRouter = mergeRouters(modelsQueries, modelsMutations)
