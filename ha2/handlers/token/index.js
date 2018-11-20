import { dataLib, hash, randomID, userObj, finalizeRequest } from '../../lib'
import { config } from '../../config'

const tokens = (data, callback) => {
  const acceptableMethods = ['get', 'post', 'put', 'delete']
  if (acceptableMethods.indexOf(data.method) > -1) {
    _tokens[data.method](data, callback)
  } else {
    callback(405)
  }
}

const _tokens = {}

_tokens.get = (data, callback) => {
  const id = typeof data.payload.tokenId === 'string' && data.payload.tokenId.trim().length === 36 ? data.payload.tokenId.trim() : false
  if (id) {
    dataLib.read('tokens', id, (err, data) => {
      if (!err && data) {
        callback(200, data)
      } else {
        callback(404, { error: `No such user, error: ${err.message}` })
      }
    })
  } else {
    callback(400, { error: 'Missing required field.' })
  }
}

_tokens.post = (data, callback) => {
  const uo = userObj(data)

  // phone and password as login
  if (uo.phone && uo.password) {
    dataLib.read('users', uo.phone, (err, data) => {
      if (!err) {
        if (data.confirmed.email || data.confirmed.phone) {
          if (hash(uo.password) === data.password) {
            randomID(32, (tokenId) => {
              if (tokenId) {
                const expiry = Date.now() + 1000 * config.tokenExpiry
                const tokenObj = {
                  expiry,
                  tokenId,
                  role: data.role,
                  phone: uo.phone
                }
                finalizeRequest('tokens', tokenId, 'create', callback, tokenObj)
              } else {
                callback(400, { error: 'Cannot get unique ID.' })
              }
            })
          } else {
            callback(401, { error: 'Invalid password.' })
          }
        } else {
          callback(400, { error: 'User\'s account is not confirmed.' })
        }
      } else {
        callback(400, { error: 'Cannot find specified user.' })
      }
    })
  } else {
    callback(400, { error: 'Missing required fields.' })
  }
}

_tokens.put = (data, callback) => {
  const id = typeof data.payload.tokenId === 'string' && data.payload.tokenId.trim().length === 36 ? data.payload.tokenId.trim() : false
  const extend = typeof data.payload.extend === 'boolean' && data.payload.extend === true ? data.payload.extend : false
  if (id && extend) {
    dataLib.read('tokens', id, (err, data) => {
      if (!err && data) {
        if (data.expiry > Date.now()) {
          data.expiry = Date.now() + 1000 * 60 * 60
          finalizeRequest('tokens', id, 'update', callback, data)
        } else {
          callback(400, { error: 'Token is expired, please login again.' })
        }
      } else {
        callback(400, { error: 'Token doesn\'t exist.' })
      }
    })
  } else {
    callback(400, { error: 'Missing required fields or invalid.' })
  }
}

_tokens.delete = (data, callback) => {
  const token = typeof data.payload.tokenId === 'string' && data.payload.tokenId.trim().length === 36 ? data.payload.tokenId.trim() : false
  if (token) {
    dataLib.read('tokens', token, (err, data) => {
      if (!err && data) {
        finalizeRequest('tokens', token, 'delete', callback)
      } else {
        callback(404, { error: 'No such token.' })
      }
    })
  } else {
    callback(400, { error: 'Missing required field.' })
  }
}

export {
  tokens
}
