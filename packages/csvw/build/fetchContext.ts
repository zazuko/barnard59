#!/usr/bin/env -S node --loader ts-node/esm/transpile-only --no-warnings
import { Writable } from 'node:stream'
import { createWriteStream, existsSync } from 'node:fs'
import { contextPath, contextUrl } from '../lib/jsonLdUtils.js'

;(async () => {
  if (existsSync(contextPath)) {
    return
  }

  const res = await fetch(contextUrl, {
    headers: {
      Accept: 'application/ld+json',
    },
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch CSVW context: ${res.statusText}`)
  }

  if (!res.body) {
    throw new Error('Failed to fetch CSVW context: got empty response')
  }

  const fileStream = createWriteStream(contextPath)
  await res.body.pipeTo(Writable.toWeb(fileStream))
})()
