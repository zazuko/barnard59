import module from 'module'
import rdf from 'barnard59-env'
import { program } from 'commander'
import { parse } from '../pipeline.js'
import runAction from './runAction.js'
import { combine } from './options.js'

const FALSE = rdf.literal('false', rdf.ns.xsd.boolean)
const require = module.createRequire(import.meta.url)

export async function * discoverCommands(manifests) {
  for await (const { name, manifest, version } of manifests) {
    const commands = manifest
      .has(rdf.ns.rdf.type, rdf.ns.b59.CliCommand)
      .has(rdf.ns.b59.command)
      .toArray()

    if (!commands.length) {
      continue
    }

    const command = program.command(`${name}`).version(version)

    for (const commandPtr of commands) {
      const source = commandPtr.out(rdf.ns.b59.source).value
      const pipeline = commandPtr.out(rdf.ns.b59.pipeline).value
      const { basePath, ptr } = await parse(require.resolve(source), pipeline)

      const pipelineSubCommand = command
        .command(commandPtr.out(rdf.ns.b59.command).value)
      if (commandPtr.out(rdf.ns.rdfs.label).value) {
        pipelineSubCommand.description(commandPtr.out(rdf.ns.rdfs.label).value)
      }

      const variables = getAnnotatedVariables(ptr)
      for (const { name, description, required, defaultValue } of variables) {
        const option = `--${name} <${name}>`
        if (required) {
          pipelineSubCommand.requiredOption(option, description, defaultValue)
        } else {
          pipelineSubCommand.option(option, description, defaultValue)
        }
      }

      yield pipelineSubCommand
        .action(async (options) => {
          return runAction(ptr, basePath, combine({
            ...options,
            variable: new Map([
              ...options.variable,
              ...Object.entries(options).filter(([key]) => variables.some(v => v.name === key)),
            ]),
          }))
        })
    }
  }
}

function getAnnotatedVariables(ptr) {
  return ptr
    .out(rdf.ns.p.variables)
    .out(rdf.ns.p.variable)
    .toArray()
    .map(variable => {
      const requiredLiteral = variable.out(rdf.ns.p.required).term
      const required = requiredLiteral ? !requiredLiteral.equals(FALSE) : true

      return {
        required,
        name: variable.out(rdf.ns.p.name).value,
        defaultValue: variable.out(rdf.ns.p.value).value,
        description: variable.out(rdf.ns.rdfs.label).value,
      }
    })
}
