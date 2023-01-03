import Transport from 'winston-transport'

export class InMemoryLogs extends Transport {
  constructor (opts) {
    super(opts)

    this.messages = []
  }

  log ({ message }, next) {
    this.messages.push(message)
    next()
  }
}
