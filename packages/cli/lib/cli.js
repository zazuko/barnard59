import { program } from 'commander'
import rdf from '@zazuko/env'
import ns from './namespaces.js'
import runAction from './cli/runAction.js'
import * as monitoringOptions from './cli/monitoringOptions.js'
import * as commonOptions from './cli/commonOptions.js'
import { discoverCommands } from './cli/dynamicCommands.js'
import discoverManifests from './discoverManifests.js'
import { parse } from './pipeline.js'

program
  .addOption(commonOptions.variable)
  .addOption(commonOptions.variableAll)
  .addOption(commonOptions.verbose)
  .addOption(commonOptions.quiet)
  .addOption(monitoringOptions.enableBufferMonitor)
  .addOption(monitoringOptions.debug)
  .addOption(monitoringOptions.metricsExporter)
  .addOption(monitoringOptions.metricsInterval)
  .addOption(monitoringOptions.tracesExporter)

const discoverOperations = async () => {
  const ops = rdf.termMap()
  for await (const { manifest } of discoverManifests()) {
    manifest
      .has(rdf.ns.rdf.type, ns.p.Operation)
      .forEach(x => { // distinguish EcmaScript and EcmaScriptModule?
        const link = x.out(ns.code.implementedBy).out(ns.code.link).term

        ops.set(x.term, link)
      })
  }

  return ops
}

export const desugarWith = context => ptr => {
  const { knownOperations } = context
  let n = 0
  for (const step of ptr.has(ns.rdf.type, ns.p.Pipeline)
    .out(ns.p.steps)
    .out(ns.p.stepList)
    .list()) {
    if (step.out(ns.code.implementedBy).terms.length === 0) {
      // when there is no implementation, we expect a known operation
      const [quad] = step.dataset.match(step.term)
      const knownStep = knownOperations.get(quad.predicate)
      if (knownStep) {
        const args = step.out(quad.predicate)
        step.deleteOut(quad.predicate)
        step.addOut(ns.code.arguments, args)
        step.addOut(ns.rdf.type, ns.p.Step)
        const moduleNode = ptr.blankNode(`impl_${n++}`)
        moduleNode.addOut(ns.rdf.type, ns.code.EcmaScriptModule)
        moduleNode.addOut(ns.code.link, knownStep)
        step.addOut(ns.code.implementedBy, moduleNode)
      }
    }
  }
  return ptr
}

const desugar = async ptr => {
  const knownOperations = await discoverOperations()
  return desugarWith({ knownOperations })(ptr)
}

const runCommand = program
  .command('run <filename>')
  .option('--output [filename]', 'output file', '-')
  .option('--pipeline [iri]', 'IRI of the pipeline description')
  .action(async (filename, options) => {
    const { basePath, ptr } = await parse(filename, options.pipeline)
    return runAction(await desugar(ptr), basePath, options)
  })

export default async function () {
  for await (const command of discoverCommands(discoverManifests())) {
    command
      .addOption(commonOptions.variable)
      .addOption(commonOptions.variableAll)
      .addOption(commonOptions.verbose)
  }

  runCommand
    .addOption(commonOptions.variable)
    .addOption(commonOptions.variableAll)
    .addOption(commonOptions.verbose)
    .addOption(commonOptions.quiet)

  await program.parseAsync(process.argv)
}
