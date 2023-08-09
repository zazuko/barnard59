import module from 'module'
import rdf from '@zazuko/env'
import { program } from 'commander'
import discoverManifests from '../discoverManifests.js'
import { parse } from '../pipeline.js'
import ns from '../namespaces.js'
import runAction from './runAction.js'

const FALSE = rdf.literal('false', rdf.ns.xsd.boolean)
const require = module.createRequire(import.meta.url)
const b59 = rdf.namespace('https://barnard59.zazuko.com/vocab#')

export async function * discoverCommands() {
  for await (const { name, manifest, version } of discoverManifests()) {
    const commands = manifest
      .has(rdf.ns.rdf.type, b59.CliCommand)
      .has(b59.command)
      .toArray()

    if (!commands.length) {
      continue
    }

    const command = program.command(`${name}`).version(version)

    for (const commandPtr of commands) {
      const source = commandPtr.out(b59.source).value
      const pipeline = commandPtr.out(b59.pipeline).value
      const { basePath, ptr } = await parse(require.resolve(source), pipeline)

      const pipelineSubCommand = command
        .command(commandPtr.out(b59.command).value)
        .description(commandPtr.out(rdf.ns.rdfs.label).value)

      const variables = getAnnotatedVariables(ptr)
      for (const { name, description, required } of variables) {
        const option = `--${name} <${name}>`
        if (required) {
          pipelineSubCommand.requiredOption(option, description)
        } else {
          pipelineSubCommand.option(option, description)
        }
      }

      yield pipelineSubCommand
        .action(async (options) => {
          return runAction(ptr, basePath, {
            ...options,
            variable: new Map([
              ...options.variable,
              ...Object.entries(options).filter(([key]) => variables.some(v => v.name === key)),
            ]),
          })
        })
    }
  }
}

function getAnnotatedVariables(ptr) {
  return ptr
    .out(ns.p.variables)
    .out(ns.p.variable)
    .toArray()
    .map(variable => {
      const requiredLiteral = variable.out(ns.p.required).term
      const required = requiredLiteral ? !requiredLiteral.equals(FALSE) : true

      return {
        required,
        name: variable.out(ns.p.name).value,
        description: variable.out(rdf.ns.rdfs.label).value,
      }
    })
}
