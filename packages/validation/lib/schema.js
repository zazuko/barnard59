
const checks =
  {
    parser: {
      id: 1,
      rule: 'Pipeline file can be parsed',
      messageSuccess (file) {
        return `File ${file} parsed successfully`
      },
      messageFailure (file, error) {
        return `Cannot parse ${file}:\n  ${error.message} Line ${error.context.line}:\n  ${error.context.lineContent}`
      }
    },
    dependencies: {
      id: 2,
      rule: 'Each dependency must be installed',
      messageSuccess (module) {
        return `Package ${module} found successfully`
      },
      messageFailure (module, operations) {
        return `Missing package ${module}\n  The following operations cannot be validated:\n  * "${operations}"`
      }
    },
    operations: {
      id: 3,
      dependsOn: [2],
      rule: 'Metadata.ttl file exists and can be parsed',
      messageSuccess (module) {
        return `Metadata file for ${module} loaded successfully`
      },
      messageFailure (module, operations) {
        return `Missing metadata file for ${module}.\n  The following operations cannot be validated:\n  * "${operations}"`
      }
    },
    pipelinePropertiesExist: {
      id: 4,
      dependsOn: [1],
      rule: 'Pipeline has at least one property defined. Recognzed choices: readable, writable, readableObjectMode, writableObjectMode',
      messageSuccess (pipeline) {
        return `Validated: property for pipeline ${pipeline} is defined`
      },
      messageFailure (pipeline) {
        return `Cannot validate pipeline ${pipeline}: the pipeline mode (readable(ObjectMode)/writable(ObjectMode)) is not defined`
      }
    },
    pipelinePropertiesMatchFirst: {
      id: 5,
      dependsOn: [3, 4],
      rule: 'Pipeline should have the same type if its first stream is writable(ObjecMode)',
      messageFailure (pipeline) {
        return `The pipeline ${pipeline} must be of type Writable or WritableObjectMode`
      },
      messageSuccess (pipeline) {
        return `The pipeline mode for ${pipeline} matches first stream`
      }
    },
    pipelinePropertiesMatchLast: {
      id: 6,
      dependsOn: [3, 4],
      rule: 'Pipeline should have the same type if its last stream is readable(ObjecMode)',
      messageFailure (pipeline) {
        return `The pipeline ${pipeline} must be of type Readable or ReadableObjectMode`
      },
      messageSuccess (pipeline) {
        return `The pipeline mode for ${pipeline} matches last stream`
      }
    },
    operationPropertiesExist: {
      id: 7,
      dependsOn: [3],
      rule: 'Operation has at least one property defined. Recognzed choices: readable, writable, readableObjectMode, writableObjectMode',
      messageSuccess (operation) {
        return `Validated: properties for operation ${operation} are defined`
      },
      messageFailure (operation) {
        return `Cannot validate operation ${operation}: no metadata.`
      }
    }
  }

module.exports = checks
