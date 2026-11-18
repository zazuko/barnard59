---
name: barnard59-s3
description: Use when downloading files, reading object bodies as streams, or uploading files to S3 in a Barnard59 pipeline.
---

# S3 steps

With `@prefix op: <https://barnard59.zazuko.com/operations/> .`, use predicates such as `op:s3\/getObject\/stream`. Explicit module paths below are relative to `node:barnard59-s3/cmd/`. All three steps take named `bucket` and `key` and accept AWS SDK options such as `region`, `endpoint`, and `forcePathStyle`. Use the SDK credential provider chain or provide both `accessKeyId` and `secretAccessKey` through runtime configuration.

When writing or reviewing a pipeline, resolve `@aws-sdk/client-s3` from `barnard59-s3` in the target project. Follow the SDK package's `types` entry to `S3ClientConfigType` and trace any imported types needed to verify the option names and the JavaScript values the pipeline supplies after literal conversion or variable resolution. For example, use Turtle `true` for `forcePathStyle` to pass a boolean. If dependencies are unavailable locally, use the published declarations for the version resolved in the project's lockfile when available. Check the step implementation for supported inputs because these steps build the S3 command separately from the client configuration.

## `getObject/stream`

`getObjectStream.js#default` reads the object body and exposes it as a byte source. Connect it directly to a parser or `node:fs#createWriteStream` when the caller should control where the data flows. It takes only the object location and client settings.

## `getObject`

`getObject.js#default` downloads the object to the local `destinationPath` and creates its parent directory if needed. The transfer happens during pipeline initialization. The returned placeholder stream does not contain the downloaded data. Use `getObject/stream` to process the bytes in downstream steps.

## `putObject`

`putObject.js#default` uploads the existing local file at `sourcePath`. Its body comes from that file and the upload happens during initialization. To upload transformed data, finish a pipeline that writes the file before invoking this operation. Upstream chunks in the same invocation do not become the upload body.
