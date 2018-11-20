import { dataLib, auth, finalizeRequest } from '../../lib'

const _menu = {}

const menu = (data, callback) => {
  const acceptableMethods = ['post']
  const acceptableActions = ['get', 'add']
  const action = data.payload && typeof data.payload.action === 'string' && acceptableActions.indexOf(data.payload.action) > -1 ? data.payload.action : false
  if (acceptableMethods.indexOf(data.method) > -1) {
    if (action) {
      _menu[action](data, callback)
    } else {
      callback(405)
    }
  } else {
    callback(405)
  }
}

_menu.get = (data, callback) => {
  auth(data, (tokenData) => {
    if (tokenData) {
      dataLib.read('products', 'menu', (err, data) => {
        if (!err && data) {
          callback(200, data)
        } else {
          callback(500, { error: 'Cannot read menu.' })
        }
      })
    } else {
      callback(403, { error: 'Unauthorized.' })
    }
  })
}

_menu.add = (data, callback) => {
  const name = typeof data.payload.name === 'string' && data.payload.name.trim().length > 0 ? data.payload.name.trim() : false
  const price = typeof data.payload.price === 'number' && data.payload.price > 0 ? data.payload.price : false

  if (name && price) {
    auth(data, (tokenData) => {
      if (tokenData) {
        if (tokenData.role === 'admin') {
          dataLib.read('products', 'menu', (err, data) => {
            if (!err && data) {
              // get last id
              const id = data.length
              const obj = {
                name,
                price
              }
              data[id] = obj
              finalizeRequest('products', 'menu', 'update', callback, data)
            } else {
              callback(500, { error: 'Cannot read menu.' })
            }
          })
        } else {
          callback(403, { error: 'Unauthorized role.' })
        }
      } else {
        callback(403, { error: 'Unauthorized.' })
      }
    })
  } else {
    callback(400, { error: 'Not all required data provided.' })
  }
}

export {
  menu
}
