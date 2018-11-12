import http from 'http'
import https from 'https'
import url from 'url'
import { StringDecoder } from 'string_decoder'
import fs from 'fs'
import path from 'path'

import { config } from './config'
import { router } from './router'
import { error, log } from './lib'

const schema = process.env.NODE_ENV === 'production' ? [https, 'https'] : [http, 'http']
const httpsOpts = {
  key: fs.readFileSync(path.join(__dirname, 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert.pem'))
}

const server = schema[0].createServer(httpsOpts, (req, res) => {
  // @TODO parse is deprecated in 11
  const parsedUrl = url.parse(req.url, true)
  const path = parsedUrl.pathname
  const trimmedPath = path.replace(/^\/+|\/+$/g, '')
  const method = req.method.toLowerCase()
  const query = parsedUrl.query
  const headers = req.headers
  const decoder = new StringDecoder('utf-8')
  let buffer = ''

  req.on('data', (data) => {
    buffer += decoder.write(data)
  })

  req.on('end', () => {
    buffer += decoder.end()
    const handler = typeof router[trimmedPath] !== 'undefined' ? router[trimmedPath] : router.notFound

    const data = {
      method,
      headers,
      query,
      path: trimmedPath,
      payload: buffer
    }

    handler(data, (statusCode, payload) => {
      statusCode = typeof statusCode === 'number' ? statusCode : 200
      payload = typeof payload === 'object' ? payload : {}
      const payloadString = JSON.stringify(payload)
      res.setHeader('Content-Type', 'application/json')
      res.writeHead(statusCode)
      res.end(payloadString)

      const logObject = {
        method,
        headers,
        query,
        buffer,
        status: statusCode,
        pathname: trimmedPath
      }

      log(logObject)
    })
  })
})

const port = config[`${schema[1]}Port`]

server.on('error', (err) => {
  error(err)
})

server.listen(port, () => {
  log(`Server listens to ${port}`)
})
