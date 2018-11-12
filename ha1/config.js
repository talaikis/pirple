const configs = {
  dev: {
    httpPort: 3000,
    httpsPort: 6000,
    logging: true
  },
  prod: {
    httpPort: 3000,
    httpsPort: 6000,
    logging: true
  }
}

const env = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : ''
const config = typeof configs[env] === 'object' ? configs[env] : configs['dev']

export {
  config
}
