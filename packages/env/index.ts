import { create, NodeEnv } from '@zazuko/env-node'
import type { DerivedEnvironment } from '@zazuko/env'
import NamespacesFactory from './lib/Namespaces.js'
import ConstantsFactory from './lib/Constants.js'

export type Environment = DerivedEnvironment<NodeEnv, ConstantsFactory>

export default create<typeof NamespacesFactory | typeof ConstantsFactory>(NamespacesFactory, ConstantsFactory)
