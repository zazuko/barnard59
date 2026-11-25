import assert from 'node:assert/strict'
import { test } from 'node:test'
import githubChangelog from '@changesets/changelog-github'
import changelog from './changelog.js'
import config from '../.changeset/config.json' with { type: 'json' }

const [, options] = config.changelog
const repository = 'https://github.com/zazuko/barnard59'

process.env.GITHUB_SERVER_URL = 'https://github.com'
process.env.GITHUB_TOKEN = 'test'

test('omits an excluded GitHub author while retaining PR and commit links', async ({ mock }) => {
  const pullUrl = `${repository}/pull/123`
  const commitUrl = `${repository}/commit/abc1234`
  mock.method(globalThis, 'fetch', async () => Response.json({
    data: {
      repo__0: {
        pull__123: {
          url: pullUrl,
          author: { login: 'dependabot', url: 'https://github.com/apps/dependabot' },
          mergeCommit: { commitUrl, abbreviatedOid: 'abc1234' },
        },
      },
    },
  }))

  assert.equal(
    await changelog.getReleaseLine({ summary: 'pr: 123\nUpdate dependencies' }, 'patch', options),
    `\n\n- [#123](${pullUrl}) [\`abc1234\`](${commitUrl}) - Update dependencies\n`,
  )
})

test('filters explicit authors case-insensitively and retains the summary', async () => {
  const changeset = {
    summary: [
      'author: @TPlusCode',
      'author: @contributor',
      'author: @dependabot',
      'Fixes #123',
      'Thanks [@tpluscode](https://github.com/tpluscode)!',
    ].join('\n'),
  }

  assert.equal(
    await changelog.getReleaseLine(changeset, 'patch', options),
    `\n\n- Thanks [@contributor](https://github.com/contributor)! - Fixes [#123](${repository}/issues/123)\n  Thanks [@tpluscode](https://github.com/tpluscode)!`,
  )
})

test('omits the entire thanks and separator when there are no links or credited authors', async () => {
  const changeset = { summary: 'author: tpluscode\nFix the pipeline' }

  assert.equal(await changelog.getReleaseLine(changeset, 'patch', options), '\n\n- Fix the pipeline\n')
})

test('retains upstream formatting when the author is eligible', async () => {
  const changeset = { summary: 'author: contributor\nFix the pipeline\n\nMore detail.' }

  assert.equal(
    await changelog.getReleaseLine(changeset, 'patch', options),
    await githubChangelog.getReleaseLine(changeset, 'patch', options),
  )
})
