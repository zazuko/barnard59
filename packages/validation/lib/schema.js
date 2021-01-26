
const rules =
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
    },
    operationHasOperationProperty: {
      id: 8,
      dependsOn: [7],
      rule: "Operation has property 'Operation'",
      messageSuccess (operation) {
        return `Validated: operation ${operation} is of 'Operation' type.`
      },
      messageFailure (operation) {
        return `Invalid operation: ${operation} is not of 'Operation' type.`
      }
    },
    firstOperationIsReadable: {
      id: 9,
      dependsOn: [8],
      rule: 'If there exists more than one step, first step must be either Readable or ReadableObjectMode',
      messageSuccess (operation) {
        return `Validated operation ${operation}: first operation must be either Readable or ReadableObjectMode`
      },
      messageFailure (operation) {
        return `Invalid operation ${operation}: it is neither Readable or ReadableObjectMode`
      }
    },
    previousOperationHasMetadata: {
      id: 100,
      dependsOn: [8],
      rule: 'Previous operation should have metadata',
      messageSuccess (operation) {
        return `Validation can be performed for operation ${operation}: previous operation has metadata`
      },
      messageFailure (operation) {
        return `Cannot validate operation ${operation}: previous operation does not have metadata`
      }
    },
    readableBeforeWritable: {
      id: 10,
      dependsOn: [8, 100],
      rule: 'Writable operation must always be preceded by a readable operation',
      messageSuccess (operation) {
        return `Validated operation ${operation}: a writable operation must always be preceded by a readable operation`
      },
      messageFailure (operation) {
        return `Invalid operation ${operation}: previous operation is not Readable`
      }
    },
    readableObjectModeBeforeWritableObjectMode: {
      id: 11,
      dependsOn: [8, 100],
      rule: 'WritableObjectMode operation must always be preceded by a ReadableObjectMode operation',
      messageSuccess (operation) {
        return `Validated operation ${operation}: a writableObjectMode operation must always be preceded by a readableObjectMode operation`
      },
      messageFailure (operation) {
        return `Invalid operation ${operation}: previous operation is not readableObjectMode`
      }
    },
    writableAfterReadable: {
      id: 12,
      dependsOn: [8, 100],
      rule: 'Readable operation must always be followed by a writable operation',
      messageSuccess (operation) {
        return `Validated operation ${operation}: a readable operation must always be followed by a writable operation`
      },
      messageFailure (operation) {
        return `Invalid operation ${operation}: next operation is not writable`
      }
    },
    writableObjectModeAfterReadableObjectMode: {
      id: 13,
      dependsOn: [8, 100],
      rule: 'ReadableObjectMode operation must always be followed by a writableObjectMode operation',
      messageSuccess (operation) {
        return `Validated operation ${operation}: a readableObjectMode operation must always be followed by a writableObjectMode operation`
      },
      messageFailure (operation) {
        return `Invalid operation ${operation}: next operation is not writableObjectMode`
      }
    }
  }

module.exports = rules
