import { create } from '@zazuko/env-node'
import type { DefaultEnv, DerivedEnvironment } from '@zazuko/env'
import NamespacesFactory from './lib/Namespaces.js'
import ConstantsFactory from './lib/Constants.js'

export type Environment = DerivedEnvironment<DefaultEnv, ConstantsFactory>

export default create<typeof NamespacesFactory | typeof ConstantsFactory>(NamespacesFactory, ConstantsFactory)
