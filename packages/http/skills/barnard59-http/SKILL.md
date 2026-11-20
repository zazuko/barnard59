---
name: barnard59-http
description: Use when reading HTTP responses or sending a streamed HTTP request body in a Barnard59 pipeline.
---

# HTTP steps

Declare `@prefix op: <https://barnard59.zazuko.com/operations/> .` and use shorthand such as `[ op:http\/get ("https://example.org/data.ttl") ]`. Both operations accept named `url` and fetch options, or positional `(url options)`. They stream response bodies without rejecting non-2xx status codes. Use an operation that checks the status when the pipeline depends on rejecting those responses.

## `get`

`<node:barnard59-http/get.js#default>` is a byte source. Pass the URL as the first positional argument for a simple GET, or supply named options to set headers or a different method. Send the body directly to a file sink for downloads or to a format parser for structured data. Use `barnard59-rdf`'s `open` if the source should select an RDF parser and emit quads.

## `post`

`<node:barnard59-http/post.js#default>` consumes request bytes and emits response bytes. The method defaults to POST. Set a `Content-Type` header that matches your serialized request. Keep the fetch `body` option unset when the upstream stream should supply the body. Connect the readable side to a parser or byte sink if the response data is needed.
