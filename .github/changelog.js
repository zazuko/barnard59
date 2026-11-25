import githubChangelog from '@changesets/changelog-github'

export default {
  getDependencyReleaseLine: githubChangelog.getDependencyReleaseLine,
  async getReleaseLine(changeset, type, options) {
    const excluded = new Set((options?.excludeFromThanks ?? []).map(username => username.toLowerCase()))
    if (!excluded.size) {
      return githubChangelog.getReleaseLine(changeset, type, options)
    }

    // Read the generated author links separately from the summary and its continuation.
    const line = await githubChangelog.getReleaseLine(changeset, type, {
      ...options,
      template: '{pull}\n{commit}\n{authors}\n{summary}',
    })
    const [pull, commit, authors, ...summary] = line.split('\n')
    const credited = authors.split(', ').filter((author) => {
      const username = author.match(/^\[@(.+?)\]\(/)?.[1]
      return !excluded.has(username?.toLowerCase())
    }).join(', ')

    const prefix = [pull, commit, credited && `Thanks ${credited}!`].filter(Boolean).join(' ')
    return `\n\n-${prefix ? ` ${prefix} -` : ''} ${summary.join('\n')}`
  },
}
