import http from 'http'
import https from 'https'
import { parse } from 'url'
import { StringDecoder } from 'string_decoder'
import { readFileSync } from 'fs'
import { join } from 'path'

import { config } from '../../config'
import { router } from '../../router'
import { stringToJson, log, error } from '../../lib'

const schema = process.env.NODE_ENV === 'production' ? [https, 'https'] : [http, 'http']
const httpsOpts = {
  key: readFileSync(join(__dirname, '../../certs', 'key.pem')),
  cert: readFileSync(join(__dirname, '../../certs', 'cert.pem'))
}

const server = schema[0].createServer(httpsOpts, (req, res) => {
  let { url, method, headers } = req
  method = method.toLowerCase()
  const parsedUrl = parse(url, true)
  const pathName = parsedUrl.pathname
  const trimmedPath = pathName.replace(/^\/+|\/+$/g, '')
  const decoder = new StringDecoder('utf-8')
  let buffer = ''

  req.on('data', (data) => {
    buffer += decoder.write(data)
  })

  req.on('error', (err) => {
    error(err)
  })

  req.on('end', () => {
    buffer += decoder.end()
    const handler = typeof router[trimmedPath] !== 'undefined' ? router[trimmedPath] : router.notFound
    const inPayload = stringToJson(buffer)

    const data = {
      method,
      headers,
      path: trimmedPath,
      payload: inPayload
    }

    handler(data, (statusCode, outPayload) => {
      statusCode = typeof statusCode === 'number' ? statusCode : 400
      outPayload = typeof outPayload === 'object' ? outPayload : {}
      const outString = JSON.stringify(outPayload)

      res.setHeader('Content-Type', 'application/json')
      res.writeHead(statusCode)
      res.end(outString)

      const logObject = {
        method,
        headers,
        in: inPayload,
        out: outPayload,
        status: statusCode,
        pathname: trimmedPath
      }

      const color = [200, 201].indexOf(statusCode) > -1 ? 'FgGreen' : 'FgRed'
      log(logObject, color)
    })
  })
})

server.on('error', (err) => {
  error(err)
})

const port = config[`${schema[1]}Port`]

server.init = () => {
  server.listen(port, () => {
    log(`Server listens to ${port}`, 'FgGreen')
  })
}

export {
  server
}
