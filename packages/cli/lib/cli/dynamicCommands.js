import module from 'node:module'
import rdf from 'barnard59-env'
import { program } from 'commander'
import { isNamedNode } from 'is-graph-pointer'
import { parse } from '../pipeline.js'
import runAction from './runAction.js'
import { combine } from './options.js'

const FALSE = rdf.literal('false', rdf.ns.xsd.boolean)
const require = module.createRequire(import.meta.url)

/**
 * @typedef {{
 *   name: string | undefined,
 *   manifest: import('clownface').AnyPointer,
 *   version: string,
 * }} Manifest
 */

/**
 * @param {AsyncIterable<Manifest>} manifests
 * @return {AsyncGenerator<import('commander').Command, void, *>}
 */
export async function * discoverCommands(manifests) {
  for await (const { name, manifest, version = '0.0.0' } of manifests) {
    const commands = manifest
      .has(rdf.ns.rdf.type, rdf.ns.b59.CliCommand)
      .toArray()

    if (!commands.length) {
      continue
    }

    const command = program.command(`${name}`).version(version)

    for (const commandPtr of commands) {
      const source = commandPtr.out(rdf.ns.b59.source)
      const pipeline = commandPtr.out(rdf.ns.b59.pipeline)
      const commandName = commandPtr.out(rdf.ns.b59.command).value
      const description = commandPtr.out(rdf.ns.rdfs.label).value

      if (!isNamedNode(source) || !commandName || !isNamedNode(pipeline)) {
        // eslint-disable-next-line no-console
        console.error(`WARN: Skipping command <${commandPtr.value}> because it is not valid`)
        continue
      }

      const { basePath, ptr } = await parse(require.resolve(source.value), pipeline.term)

      const pipelineSubCommand = command.command(commandName)
      if (description) {
        pipelineSubCommand.description(description)
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

/**
 * @param {import('clownface').GraphPointer} ptr
 * @returns {Array<{ name: string | undefined, description: string | undefined, required: boolean, defaultValue: string | undefined }>}
 */
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
