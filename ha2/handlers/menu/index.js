import { dataLib, auth } from '../../lib'

const _menu = {}

const menu = (data, callback) => {
  const acceptableMethods = ['post']
  const acceptableActions = ['get']
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

export {
  menu
}
