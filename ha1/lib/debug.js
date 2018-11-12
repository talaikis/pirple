import { config } from '../config'

const log = (msg) => {
  if (config.logging) {
    console.log(msg)
  }
}

const error = (msg) => {
  if (config.logging) {
    console.error(msg)
  }
}

export {
  log,
  error
}
