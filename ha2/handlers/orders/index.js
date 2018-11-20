import { dataLib, auth, finalizeRequest, charge, uuidv4, sendEmail } from '../../lib'
import { config } from '../../config'

const _orders = {}

const orders = (data, callback) => {
  const acceptableMethods = ['post']
  const acceptableActions = ['get_order', 'get_orders', 'get_cart', 'add_cart', 'delete_cart', 'buy']
  const action = data.payload && typeof data.payload.action === 'string' && acceptableActions.indexOf(data.payload.action) > -1 ? data.payload.action : false
  if (acceptableMethods.indexOf(data.method) > -1) {
    if (action) {
      _orders[action](data, callback)
    } else {
      callback(405)
    }
  } else {
    callback(405)
  }
}

_orders.get_cart = (data, callback) => {
  auth(data, (tokenData) => {
    if (tokenData) {
      dataLib.read('users', tokenData.phone, (err, data) => {
        if (!err && data) {
          callback(200, data.cart)
        } else {
          callback(500, { error: 'Cannot read user cart.' })
        }
      })
    } else {
      callback(403, { error: 'Unauthorized.' })
    }
  })
}

_orders.get_orders = (data, callback) => {
  auth(data, (tokenData) => {
    if (tokenData) {
      dataLib.read('users', tokenData.phone, (err, data) => {
        if (!err && data) {
          callback(200, data.orders)
        } else {
          callback(500, { error: 'Cannot read user orders.' })
        }
      })
    } else {
      callback(403, { error: 'Unauthorized.' })
    }
  })
}

_orders.get_order = (data, callback) => {
  auth(data, (tokenData) => {
    if (tokenData) {
      const orderId = typeof data.payload.orderId === 'string' && data.payload.orderId.length === 36 ? data.payload.orderId : false
      if (orderId) {
        dataLib.read('orders', orderId, (err, data) => {
          if (!err && data) {
            callback(200, data)
          } else {
            callback(500, { error: 'Cannot read order.' })
          }
        })
      } else {
        callback(400, { error: 'Not all required fields provided.' })
      }
    } else {
      callback(403, { error: 'Unauthorized.' })
    }
  })
}

_orders.add_cart = (data, callback) => {
  auth(data, (tokenData) => {
    if (tokenData) {
      dataLib.read('users', tokenData.phone, (err, userData) => {
        if (!err && userData) {
          const items = typeof data.payload.items === 'object' && Array.isArray(data.payload.items) ? data.payload.items : false
          if (items) {
            userData.cart = items
            finalizeRequest('users', tokenData.phone, 'update', callback, userData)
          } else {
            callback(400, { error: 'No items provided to cart.' })
          }
        } else {
          callback(500, { error: 'Cannot read user.' })
        }
      })
    } else {
      callback(403, { error: 'Unauthorized.' })
    }
  })
}

orders.delete = (tokenData, callback) => {
  dataLib.read('users', tokenData.phone, (err, userData) => {
    if (!err && userData.cart.length > 0) {
      userData.cart = []
      dataLib.update('users', tokenData.phone, userData, (err) => {
        if (!err) {
          callback(false)
        } else {
          callback('Cannot update user cart.')
        }
      })
    } else {
      callback('Cannot read user or cart is empty.')
    }
  })
}

_orders.delete_cart = (data, callback) => {
  auth(data, (tokenData) => {
    if (tokenData) {
      orders.delete(tokenData, (err) => {
        console.log('err')
        console.log(err)
        if (!err) {
          callback(200)
        } else {
          callback(500, { error: err })
        }
      })
    } else {
      callback(403, { error: 'Unauthorized.' })
    }
  })
}

orders.sendOrderConfirmation = (email, orderId, callback) => {
  const subject = 'Your order'
  const msg = `Your prder on ${config.company} was successful: ${orderId}`

  sendEmail(email, subject, msg, (err) => {
    if (!err.error) {
      callback(false)
    } else {
      callback(err.error)
    }
  })
}

_orders.buy = (data, callback) => {
  auth(data, (tokenData) => {
    if (tokenData) {
      dataLib.read('users', tokenData.phone, (err, userData) => {
        if (!err && userData.cart.length > 0) {
          dataLib.read('products', 'menu', (err, menu) => {
            if (!err && menu) {
              let finalAmount = 0
              userData.cart.forEach((i) => {
                finalAmount += menu[i].price
              })

              const orderId = uuidv4()
              const token = undefined
              const obj = {
                orderId,
                phone: tokenData.phone,
                total: finalAmount,
                createdAt: Date.now(),
                paid: false,
                items: userData.cart
              }

              dataLib.create('orders', orderId, obj, (err) => {
                if (!err) {
                  userData.orders.push(orderId)
                  dataLib.update('users', tokenData.phone, userData, (err) => {
                    if (!err) {
                      charge(orderId, finalAmount, token, (err) => {
                        if (!err.error) {
                          orders.sendOrderConfirmation(userData.email, orderId, (err) => {
                            if (!err) {
                              orders.delete(tokenData, (err) => {
                                if (!err) {
                                  callback(200)
                                } else {
                                  callback(500, { error: err })
                                }
                              })
                            } else {
                              callback(500, { error: 'Cannot send email.' })
                            }
                          })
                        } else {
                          callback(400, { error: `Cannot charge user: ${err}` })
                        }
                      })
                    } else {
                      callback(400, { error: 'Cannot update user.' })
                    }
                  })
                } else {
                  callback(400, { error: 'Cannot create order.' })
                }
              })
            } else {
              callback(400, { error: 'Cannot read menu.' })
            }
          })
        } else {
          callback(400, { error: 'Cannot read user or cart is empty.' })
        }
      })
    } else {
      callback(403, { error: 'Unauthorized.' })
    }
  })
}

export {
  orders
}
