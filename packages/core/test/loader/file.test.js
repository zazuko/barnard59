import * as url from 'url'
import * as os from 'os'
import { expect } from 'chai'
import $rdf from '@zazuko/env'
import loader from '../../lib/loader/file.js'
import ns from '../support/namespaces.js'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

describe('loader/file', () => {
  it('should load file contents from given path', async () => {
    // given
    const ptr = $rdf.clownface()
      .literal('file.txt', ns.p.FileContents)

    // when
    const contents = await loader(ptr, {
      basePath: __dirname,
      variables: new Map(),
    })

    // then
    expect(contents).to.eq('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum luctus neque ac tincidunt feugiat.\n')
  })

  it('should load file contents from path in variable', async () => {
    // given
    const ptr = $rdf.clownface().literal('PATH', ns.p.FileContents)
    const variables = new Map([
      ['PATH', 'file.txt'],
    ])

    // when
    const contents = await loader(ptr, {
      basePath: __dirname,
      variables,
    })

    // then
    expect(contents).to.eq('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum luctus neque ac tincidunt feugiat.\n')
  })

  it('should load file contents from HOME_DIR path', async () => {
    // given
    const ptr = $rdf.clownface()
      .literal('~/file.txt', ns.p.FileContents)

    try {
      // when
      await loader(ptr, {
        basePath: __dirname,
        variables: new Map(),
      })
    } catch (e) {
      // then
      expect(e.message).to.match(new RegExp(`ENOENT.+'${os.homedir()}/file\\.txt'`))
    }
  })
})
