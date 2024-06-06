import { strictEqual, ok } from 'assert'
import { expect } from 'chai'
import shell from 'shelljs'

const support = (new URL('./support', import.meta.url)).pathname
const cwd = new URL('..', import.meta.url).pathname

describe('cube validation pipeline', function () {
  this.timeout(10000)

  it('should run check-cube-observations pipeline without error', () => {
    const constraintFile = `${support}/constraint01.ttl`
    const command = `cat ${support}/observations01.ttl | barnard59 cube check-observations --constraint ${constraintFile}`

    const result = shell.exec(command, { silent: true, cwd })

    strictEqual(result.stderr, '')
    ok(result.stdout.includes('_:report <http://www.w3.org/ns/shacl#conforms> "true"^^<http://www.w3.org/2001/XMLSchema#boolean>'))
    strictEqual(result.code, 0)
  })

  it('should run check-cube-observations pipeline with error', () => {
    const constraintFile = `${support}/constraint01.ttl`
    const command = `cat ${support}/observations02.ttl | barnard59 cube check-observations --constraint ${constraintFile} --maxViolations 1`

    const result = shell.exec(command, { silent: true, cwd })

    strictEqual(result.code, 1)
    expect(result.stderr).to.match(/1 violations found/)
    ok(result.stdout.includes('_:report <http://www.w3.org/ns/shacl#conforms> "false"^^<http://www.w3.org/2001/XMLSchema#boolean>'))
  })

  it('should run check-cube-observations pipeline with warning', () => {
    const constraintFile = `${support}/constraint01.ttl`
    const command = `cat ${support}/observations03.ttl | barnard59 cube check-observations --constraint ${constraintFile}`

    const result = shell.exec(command, { silent: true, cwd })

    strictEqual(result.code, 0) // successful because there are no reults with severity sh:Violation
    expect(result.stderr).to.match(/1 results with severity http:\/\/www.w3.org\/ns\/shacl#Warning/)
    // sh:conforms is false because of the warning
    strictEqual(true, result.stdout.includes('_:report <http://www.w3.org/ns/shacl#conforms> "false"^^<http://www.w3.org/2001/XMLSchema#boolean>'))
    strictEqual(false, result.stdout.includes('_:report <http://www.w3.org/ns/shacl#conforms> "true"^^<http://www.w3.org/2001/XMLSchema#boolean>'))
  })

  it('should run check-cube-observations when maxViolations is not exceeded', () => {
    const constraintFile = `${support}/constraint01.ttl`
    const command = `cat ${support}/observations02.ttl | barnard59 cube check-observations --constraint ${constraintFile}`

    const result = shell.exec(command, { silent: true, cwd })

    strictEqual(result.code, 1)
    expect(result.stderr).to.match(/1 violations found/)
    ok(result.stdout.includes('_:report <http://www.w3.org/ns/shacl#conforms> "false"^^<http://www.w3.org/2001/XMLSchema#boolean>'))
  })

  it('should run check-cube-observations pipeline with options', () => {
    const constraintFile = `${support}/constraint01.ttl`
    const command = `cat ${support}/observations01.ttl | barnard59 cube check-observations --constraint ${constraintFile} --maxViolations 1 --batchSize 1 --sortChunkSize 1`

    const result = shell.exec(command, { silent: true, cwd })

    strictEqual(result.stderr, '')
    ok(result.stdout.includes('_:report <http://www.w3.org/ns/shacl#conforms> "true"^^<http://www.w3.org/2001/XMLSchema#boolean>'))
    strictEqual(result.code, 0)
  })

  it('should run check-cube-observations pipeline with error for cube.link examples', () => {
    const constraintFile = `${support}/constraint.ttl`
    // sh:class constraint fails because of batching
    const command = `cat ${support}/cube.ttl | barnard59 cube check-observations --constraint ${constraintFile} --batchSize 10`

    const result = shell.exec(command, { silent: true, cwd })

    strictEqual(result.code, 1)
    ok(result.stdout.includes('_:report <http://www.w3.org/ns/shacl#conforms> "false"^^<http://www.w3.org/2001/XMLSchema#boolean>'))
  })

  it('should run check-cube-observations pipeline with cube.link examples', () => {
    const constraintFile = `${support}/constraint.ttl`
    // disabling batching makes all data available when checking the sh:class constraint
    const command = `cat ${support}/cube.ttl | barnard59 cube check-observations --constraint ${constraintFile} --batchSize 0`

    const result = shell.exec(command, { silent: true, cwd })

    strictEqual(result.stderr, '')
    expect(result.stdout)
      .to.include('_:report <http://www.w3.org/ns/shacl#conforms> "true"^^<http://www.w3.org/2001/XMLSchema#boolean>')
    strictEqual(result.code, 0)
  })
})
