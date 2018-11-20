const dev = {
  httpPort: 3000,
  httpsPort: 6000,
  company: 'Uptime Bot Inc.',
  hashingSecret: 'hashingSecret',
  logging: true,
  maxURLs: 10,
  mobileProvider: 'twilio',
  emailProvider: 'mailgun',
  twilio: {
    from: '+37066802821',
    sid: 'ACee5172ba87656eaecaf92bb78ca91ae0',
    authToken: '9171c713df20b5947acc53725c7da281'
  },
  mailgun: {
    nameFrom: 'Test',
    domainName: 'sandbox734b3b772b774087a4688434a59e5257.mailgun.org',
    apiKey: 'key-1fc1f574b553b0ffdbaeb06333a2ea4d'
  },
  stripe: {
    pubKey: 'pk_test_QW761ZU6QldO17MLndGs46TV',
    secretKey: 'sk_test_9SMgdgX3gAyC2FJMgfsaIb5m'
  },
  currency: 'usd',
  chargeDescription: 'Pizza Order',
  jwt: {
    issuer: 'Uptime Bot Inc.',
    subject: 'info@uptimebot.com',
    audience: 'http://uptimebot.com'
  },
  workers: {
    tokenClean: 60,
    logRotate: 60,
    checkEvery: 60,
    certsRotate: 60 * 60 * 24,
    unconfirmedClean: 60 * 60 * 3
  },
  tokenExpiry: 60 * 60,
  privateKeySecret: 'rsasecret',
  mainConfirm: 'email',
  paymentProcessor: 'stripe'
}

const prod = {
  httpPort: 3000,
  httpsPort: 6000,
  company: 'Uptime Bot Inc.',
  hashingSecret: 'hashingSecret',
  logging: true,
  maxURLs: 10,
  checkEverySeconds: 60,
  mobileProvider: 'twilio',
  emailProvider: 'mailgun',
  twilio: {
    from: '+37066802821',
    sid: 'ACee5172ba87656eaecaf92bb78ca91ae0',
    authToken: '9171c713df20b5947acc53725c7da281'
  },
  mailgun: {
    nameFrom: 'Test',
    domainName: 'sandbox734b3b772b774087a4688434a59e5257.mailgun.org',
    apiKey: 'key-1fc1f574b553b0ffdbaeb06333a2ea4d'
  },
  stripe: {
    pubKey: 'pk_test_QW761ZU6QldO17MLndGs46TV',
    secretKey: 'sk_test_9SMgdgX3gAyC2FJMgfsaIb5m'
  },
  currency: 'usd',
  chargeDescription: 'Pizza Order',
  jwt: {
    issuer: 'Uptime Bot Inc.',
    subject: 'info@uptimebot.com',
    audience: 'http://uptimebot.com'
  },
  workers: {
    tokenClean: 60 * 5,
    logRotate: 60 * 5,
    checkEvery: 60,
    certsRotate: 60 * 60 * 24,
    unconfirmedClean: 60 * 60 * 3
  },
  tokenExpiry: 60 * 60,
  privateKeySecret: 'rsasecret',
  mainConfirm: 'email',
  paymentProcessor: 'stripe'
}

const configs = {
  dev,
  prod
}

const env = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : ''
const config = typeof configs[env] === 'object' ? configs[env] : configs['dev']

export {
  config
}
