---
"barnard59-s3": minor
---

Allow `getObject` and `putObject` operations to be used inside a barnard59 pipeline, as they are now returning a stream.
They can be used at any place in the list of steps, as it will not change anything in the stream.

The `getStreamObject` operation is also now available, which returns a stream of a S3 object.
This can be used to create a stream, where you can then transform by using other barnard59 operations.

To upload a stream to S3, you will need to first write the stream to a file and then use `putObject` to upload the file to S3.
