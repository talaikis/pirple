import { sendSMS, log } from '../lib'

const tests = () => {
  let errors = false

  sendSMS('37061415694', 'Test!', (err) => {
    if (err.error) {
      errors = true
    }
    log(`Sending SMS error: ${err}`, 'FgRed')
  })
  return errors
}

export {
  tests
}
