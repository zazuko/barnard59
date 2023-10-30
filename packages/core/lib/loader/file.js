import { resolve } from 'path'
import * as fs from 'fs'
import { isLiteral } from 'is-graph-pointer'
import untildify from 'untildify'

export default function loader(ptr, { basePath, variables }) {
  if (isLiteral(ptr)) {
    const { value } = ptr
    const path = untildify(variables.get(value, { allowMissing: true }) || value)

    return fs.readFileSync(resolve(basePath, path)).toString()
  }
}

loader.register = (registry, rdf) => {
  registry.registerLiteralLoader(rdf.ns.p.FileContents, loader)
}
