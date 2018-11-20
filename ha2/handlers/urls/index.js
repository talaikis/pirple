import { dataLib, uuidv4, tokenHeader, urlsObj, finalizeRequest, validURL, auth } from '../../lib'
import { config } from '../../config'

const urls = (data, callback) => {
  const acceptableMethods = ['get', 'post', 'put', 'delete']
  if (acceptableMethods.indexOf(data.method) > -1) {
    _urls[data.method](data, callback)
  } else {
    callback(405)
  }
}

const _urls = {}

_urls.get = (data, callback) => {
  const id = validURL(data)
  if (id) {
    dataLib.read('urls', id, (err, data) => {
      if (!err && data) {
        auth(data, (tokenData) => {
          if (tokenData) {
            callback(200, tokenData)
          } else {
            callback(403, { error: 'Unauthorized.' })
          }
        })
      } else {
        callback(404, { error: 'No such URL.' })
      }
    })
  } else {
    callback(400, { error: 'Missing required field.' })
  }
}

urls.existing = (urlIDs, callback) => {
  let existingURLs = []
  urlIDs.forEach((el) => {
    dataLib.read('urls', el, (err, urlData) => {
      if (!err && urlData) {
        existingURLs.push(urlData.url)

        if (existingURLs.length === urlIDs.length) {
          callback(existingURLs)
        }
      }
    })
  })
}

_urls.post = (data, callback) => {
  const co = urlsObj(data)

  if (co.protocol && co.url && co.method && co.successCodes && co.timeout) {
    const token = tokenHeader(data)
    if (token) {
      dataLib.read('tokens', token, (err, tokenData) => {
        if (!err && tokenData) {
          const phone = tokenData.phone
          dataLib.read('users', phone, (err, userData) => {
            if (!err && userData) {
              const urlIDs = typeof userData.urls === 'object' && Array.isArray(userData.urls) ? userData.urls : []
              if (urlIDs.length <= config.maxURLs) {
                urls.existing(urlIDs, (existingURLs) => {
                  if (!existingURLs.includes(co.url)) {
                    const urlId = uuidv4()
                    const newUrl = {
                      urlId,
                      phone,
                      state: 'unknown',
                      lastChecked: false,
                      method: co.method,
                      protocol: co.protocol,
                      successCodes: co.successCodes,
                      url: co.url,
                      timeout: co.timeout
                    }

                    dataLib.create('urls', urlId, newUrl, (err) => {
                      if (!err) {
                        userData.urls = urlIDs
                        userData.urls.push(urlId)
                        finalizeRequest('users', phone, 'update', callback, userData)
                      } else {
                        callback(500, { error: 'Cannot create URL.' })
                      }
                    })
                  } else {
                    callback(400, { error: 'This URL already exists.' })
                  }
                })
              } else {
                callback(400, { error: 'You have reached maximum capacity. Upgrade for more.' })
              }
            } else {
              callback(403, { error: 'Unauthorized.' })
            }
          })
        } else {
          callback(403, { error: 'Token is invalid or expired, please login again.' })
        }
      })
    } else {
      callback(403, { error: 'Wrong token.' })
    }
  } else {
    callback(400, { error: 'Not all required data is provided.' })
  }
}

_urls.put = (data, callback) => {
  const co = urlsObj(data)

  if (co.id) {
    if (co.protocol || co.url || co.method || co.successCodes || co.timeout) {
      dataLib.read('urls', co.id, (err, urlData) => {
        if (!err && urlData) {
          auth(data, (tokenData) => {
            if (tokenData) {
              if (co.protocol) {
                urlData.protocol = co.protocol
              }

              if (co.url) {
                urlData.url = co.url
              }

              if (co.method) {
                urlData.method = co.method
              }

              if (co.successCodes) {
                urlData.successCodes = co.successCodes
              }

              if (co.timeout) {
                urlData.timeout = co.timeout
              }
              finalizeRequest('urls', co.id, 'update', callback, urlData)
            } else {
              callback(403, { error: 'Token is invalid or expired' })
            }
          })
        } else {
          callback(400, { error: 'No such URL.' })
        }
      })
    }
  } else {
    callback(400, { error: 'Not all required fields are provided.' })
  }
}

_urls.delete = (data, callback) => {
  const id = validURL(data)
  if (id) {
    dataLib.read('urls', id, (err, urlData) => {
      if (!err && urlData) {
        auth(data, (tokenData) => {
          if (tokenData) {
            dataLib.read('users', urlData.phone, (err, userData) => {
              if (!err && userData) {
                const urls = typeof userData.urls === 'object' && Array.isArray(userData.urls) ? userData.urls : []
                const pos = urls.indexOf(id)
                if (pos > -1) {
                  urls.splice(pos, 1)
                  userData.urls = urls
                  dataLib.update('users', urlData.phone, userData, (err) => {
                    if (!err) {
                      finalizeRequest('urls', id, 'delete', callback)
                    } else {
                      callback(500, { error: 'Cannot update user.' })
                    }
                  })
                } else {
                  callback(500, { error: 'Cannot find that URL id' })
                }
              } else {
                callback(400, { error: 'No such user.' })
              }
            })
          } else {
            callback(403, { error: 'Unauthorized.' })
          }
        })
      } else {
        callback(400, { error: 'No such URL.' })
      }
    })
  } else {
    callback(400, { error: 'Not all required fields are provided.' })
  }
}

export {
  urls
}
