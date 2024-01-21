import BaseEnv, { Environment as ZazukoEnv } from '@zazuko/env-node'
import NamespacesFactory from './lib/Namespaces.js'
import ConstantsFactory from './lib/Constants.js'

const env = new ZazukoEnv([NamespacesFactory, ConstantsFactory], { parent: BaseEnv })

export default env
export type Environment = typeof env
