import module from 'node:module'
import rdf from 'barnard59-env'
import { Option, program } from 'commander'
import { isLiteral } from 'is-graph-pointer'
import { parse } from '../pipeline.js'
import runAction from './runAction.js'
import { combine } from './options.js'

const FALSE = rdf.literal('false', rdf.ns.xsd.boolean)
const TRUE = rdf.literal('true', rdf.ns.xsd.boolean)
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
export async function* discoverCommands(manifests) {
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

      if (!isLiteral(source) || !commandName) {
        // eslint-disable-next-line no-console
        console.error(`WARN: Skipping command <${commandPtr.value}> because it is not valid`)
        continue
      }

      const { basePath, ptr } = await parse(require.resolve(source.value), pipeline.value)

      const pipelineSubCommand = command.command(commandName)
      if (description) {
        pipelineSubCommand.description(description)
      }

      const options = getAnnotatedOptions(ptr)
      for (const { option } of options) {
        pipelineSubCommand.addOption(option)
      }

      yield pipelineSubCommand
        .action(async (actionParams) => {
          return runAction(ptr, basePath, combine({
            ...actionParams,
            variable: new Map([
              ...actionParams.variable,
              ...options
                .filter(({ option }) => actionParams[option.attributeName()] !== undefined)
                .map(({ name, option }) => [name, String(actionParams[option.attributeName()])]),
            ]),
          }))
        })
    }
  }
}

/**
 * @param {import('clownface').GraphPointer} ptr
 * @returns {Array<{ name: string | undefined, option: Option }>}
 */
function getAnnotatedOptions(ptr) {
  return ptr
    .out(rdf.ns.p.variables)
    .out(rdf.ns.p.variable)
    .toArray()
    .map((variable) => {
      const requiredLiteral = variable.out(rdf.ns.p.required).term
      const required = requiredLiteral ? !requiredLiteral.equals(FALSE) : true
      const flag = variable.out(rdf.ns.b59.flag).term?.equals(TRUE)
      const name = variable.out(rdf.ns.p.name).value
      const description = variable.out(rdf.ns.rdfs.label).value
      const option = new Option(flag ? `--${name}` : `--${name} <${name}>`, description)
        .makeOptionMandatory(required)

      if (!flag) {
        option.default(variable.out(rdf.ns.p.value).value)
      }

      return { name, option }
    })
}
