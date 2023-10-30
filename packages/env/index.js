import { create } from '@zazuko/env-node'
import NamespacesFactory from './lib/Namespaces.js'
import ConstantsFactory from './lib/Constants.js'

export default create(NamespacesFactory, ConstantsFactory)
