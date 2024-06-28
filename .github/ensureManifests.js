import { findWorkspaces } from 'find-workspaces'
import { existsSync } from 'node:fs'

let result = 0

for (const workspace of findWorkspaces()) {
  if(workspace.package.private) {
    continue
  }

  if (!(existsSync(workspace.location + '/manifest.ttl'))) {
    console.log(`⚠️ ${workspace.package.name} - no manifest.ttl`)
    continue
  }

  if(!workspace.package.files) {
    console.log(`✅ ${workspace.package.name} - all files included in package`)
    continue
  }

  if(workspace.package.files.includes('manifest.ttl')) {
    console.log(`✅ ${workspace.package.name} - manifest.ttl file listed`)
    continue
  }

  console.error(`❌ ${workspace.package.name} - manifest.ttl file not listed`)
  result += 1
}

process.exit(result)
