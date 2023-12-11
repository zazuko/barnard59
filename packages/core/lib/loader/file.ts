import { resolve } from 'path'
import * as fs from 'fs'
import { isLiteral } from 'is-graph-pointer'
import untildify from 'untildify'
import type { GraphPointer } from 'clownface'
import LoaderRegistry from 'rdf-loaders-registry'
import type { Environment } from 'barnard59-env'
import { VariableMap } from '../VariableMap.js'

export default function loader(ptr: GraphPointer, { basePath, variables }: { basePath: string; variables: VariableMap }) {
  if (isLiteral(ptr)) {
    const { value } = ptr
    const path = untildify(variables.get(value, { allowMissing: true }) || value)

    return fs.readFileSync(resolve(basePath, path)).toString()
  }
}

loader.register = (registry: LoaderRegistry, rdf: Environment) => {
  registry.registerLiteralLoader(rdf.ns.p.FileContents, loader)
}
