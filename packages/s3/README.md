# `barnard59-s3`

Add support for S3 to barnard59.

## `getObject`

Get an object from a S3 bucket into the file system.

| Option          | Type   | Required | Description                                                                                                               |
| --------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| bucket          | string | true     | The name of the S3 bucket                                                                                                 |
| key             | string | true     | The key of the object                                                                                                     |
| destinationPath | string | true     | The path where the object should be downloaded. If the directory that contains the path do not exist, it will be created. |
| accessKeyId     | string | false    | S3 Access Key ID                                                                                                          |
| secretAccessKey | string | false    | S3 Secret Access Key                                                                                                      |

And all options from [S3ClientConfigType](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-s3/TypeAlias/S3ClientConfigType/) of the AWS SDK, which includes those fields for example:

- `endpoint` (type: `string` ; configure a custom endpoint)
- `region` (type: `string` ; defaults to `us-east-1` if not specified)
- `forcePathStyle` (type: `boolean`; set to `true` if you want to use a custom endpoint)

## `putObject`

Put an object from the file system into a S3 bucket.

| Option          | Type   | Required | Description                                   |
| --------------- | ------ | -------- | --------------------------------------------- |
| bucket          | string | true     | The name of the S3 bucket                     |
| key             | string | true     | The key of the object                         |
| sourcePath      | string | true     | The path of the file on the local file system |
| accessKeyId     | string | false    | S3 Access Key ID                              |
| secretAccessKey | string | false    | S3 Secret Access Key                          |

And all options from [S3ClientConfigType](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-s3/TypeAlias/S3ClientConfigType/) of the AWS SDK, which includes those fields for example:

- `endpoint` (type: `string` ; configure a custom endpoint)
- `region` (type: `string` ; defaults to `us-east-1` if not specified)
- `forcePathStyle` (type: `boolean`; set to `true` if you want to use a custom endpoint)
