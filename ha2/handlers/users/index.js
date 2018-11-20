import { dataLib, hash, tokenHeader, userObj, validPhone, finalizeRequest, sendSMS, randomID,
  sendEmail, error, auth, log } from '../../lib'
import { tokens } from '../token'
import { config } from '../../config'

const users = (data, callback) => {
  const acceptableMethods = ['get', 'post', 'put', 'delete']
  if (acceptableMethods.indexOf(data.method) > -1) {
    _users[data.method](data, callback)
  } else {
    callback(405)
  }
}

users.sendEmailConfirmation = (email, phone, callback) => {
  randomID(32, (code) => {
    if (code) {
      const subject = 'Please confirm your account'
      const msg = `Your code for ${config.company} account: ${code}`
      const obj = {
        phone,
        token: code,
        type: config.mainConfirm,
        expiry: Date.now() + 1000 * 60 * 60
      }

      dataLib.create('confirms', code, obj, (err) => {
        if (!err) {
          sendEmail(email, subject, msg, (err) => {
            if (!err.error) {
              callback(false)
            } else {
              callback(err)
            }
          })
        } else {
          callback('Unable to save confirmation code.')
        }
      })
    } else {
      callback('Unable to generate confirmation code.')
    }
  })
}

users.sendPhoneConfirmation = (phone, callback) => {
  randomID(6, (code) => {
    if (code) {
      const msg = `Your code for ${config.company} account: ${code}`
      const obj = {
        phone,
        token: code,
        expiry: Date.now() + 1000 * 60 * 60
      }

      dataLib.create('confirms', code, obj, (err) => {
        if (!err) {
          sendSMS(phone, msg, (err) => {
            if (!err.error) {
              callback(false)
            } else {
              callback(err)
            }
          })
        } else {
          callback('Unable to save confirmation code.')
        }
      })
    } else {
      callback('Unable to generate confirmation code.')
    }
  })
}

const _users = {}

_users.get = (data, callback) => {
  const phone = validPhone(data)
  if (phone) {
    auth(data, (tokenData) => {
      if (tokenData) {
        dataLib.read('users', phone, (err, data) => {
          if (!err && data) {
            delete data.password
            callback(200, data)
          } else {
            callback(404, { error: 'No such user.' })
          }
        })
      } else {
        callback(403, { error: 'Unauthorized.' })
      }
    })
  } else {
    callback(400, { error: 'Missing required field.' })
  }
}

users.createUser = (obj, callback) => {
  const hashedPassword = hash(obj.password)
  if (hashedPassword) {
    const now = Date.now()
    const newObj = {
      firstName: obj.firstName,
      lastName: obj.lastName,
      phone: obj.phone,
      email: obj.email,
      tosAgreement: obj.tosAgreement,
      password: hashedPassword,
      referred: [],
      urls: [],
      orders: [],
      cart: [],
      address: obj.address,
      city: obj.city,
      country: obj.country,
      confirmed: {
        email: false,
        phone: false
      },
      registeredAt: now,
      updatedAt: now
    }

    dataLib.create('users', obj.phone, newObj, (err) => {
      if (!err) {
        if (config.mainConfirm === 'email') {
          users.sendEmailConfirmation(obj.email, obj.phone, (err) => {
            if (!err.error) {
              callback(false)
            } else {
              callback(`Could not send email: ${err.error}`)
            }
          })
        }

        if (config.mainConfirm === 'phone') {
          users.sendPhoneConfirmation(obj.phone, (err) => {
            if (!err.error) {
              callback(false)
            } else {
              callback(`Could not send SMS: ${err.error}`)
            }
          })
        }
      } else {
        callback('Could not create user.')
      }
    })
  } else {
    callback('Could not hash password.')
  }
}

_users.post = (data, callback) => {
  const uo = userObj(data)

  if (uo.firstName && uo.lastName && uo.phone && uo.email && uo.password && uo.tosAgreement) {
    // check if user exists
    dataLib.read('users', uo.phone, (err, _) => {
      if (err) {
        users.createUser(uo, (err) => {
          if (!err) {
            callback(200)
          } else {
            callback(500, { error: err })
          }
        })
      } else {
        callback(400, { error: 'User exists.' })
      }
    })
  } else {
    callback(400, { error: 'Missing required fields.' })
  }
}

_users.put = (data, callback) => {
  const uo = userObj(data)

  if (uo.phone) {
    if (uo.firstName || uo.lastName || uo.password || uo.email) {
      auth(data, (tokenData) => {
        if (tokenData) {
          dataLib.read('users', uo.phone, (err, data) => {
            if (!err && data) {
              if (data.confirmed.email || data.confirmed.phone) {
                if (uo.firstName !== data.firstName) {
                  data.firstName = uo.firstName
                }

                if (uo.address !== data.address) {
                  data.address = uo.address
                }

                if (uo.city !== data.city) {
                  data.city = uo.city
                }

                if (uo.country !== data.country) {
                  data.country = uo.country
                }

                if (uo.lastName !== data.lastName) {
                  data.lastName = uo.lastName
                }

                if (uo.email !== data.email) {
                  data.email = uo.email
                  users.sendEmailConfirmation(uo.email, uo.phone, (err) => {
                    if (!err) {
                      log('Email sent.', 'FgGreen')
                    } else {
                      error(err)
                    }
                  })
                }

                if (uo.password) {
                  data.password = hash(uo.password)
                }

                data.updatedAt = Date.now()

                finalizeRequest('users', uo.phone, 'update', callback, data)
              } else {
                callback(400, { error: 'Email or phone should be confirmed.' })
              }
            } else {
              callback(400, { error: 'Specified user doens not exist.' })
            }
          })
        } else {
          callback(403, { error: 'Unauthorized.' })
        }
      })
    } else {
      callback(400, { error: 'Missing reuired field(s).' })
    }
  } else {
    callback(400, { error: 'Missing reuired field.' })
  }
}

_users.delete = (data, callback) => {
  const phone = validPhone(data)
  if (phone) {
    auth(data, (tokenData) => {
      if (tokenData) {
        dataLib.read('users', phone, (err, userData) => {
          if (!err && userData) {
            const urls = typeof userData.urls === 'object' && Array.isArray(userData.urls) ? userData.urls : []
            dataLib.delete('users', phone, (err) => {
              if (!err) {
                const urlsToDelete = urls.length
                if (urlsToDelete > 0) {
                  let urlsDeleted = 0
                  let deletionErrors = false
                  urls.forEach((id) => {
                    dataLib.delete('urls', id, (err) => {
                      if (!err) {
                        urlsDeleted += 1
                      } else {
                        deletionErrors = true
                      }

                      if (urlsDeleted === urlsToDelete) {
                        if (!deletionErrors) {
                          callback(200)
                        } else {
                          callback(500, { error: 'Error occured when deleting some of user URLs.' })
                        }
                      }
                    })
                  })
                } else {
                  callback(200)
                }
              } else {
                callback(500, { error: 'Could not delete user.' })
              }
            })
          } else {
            callback(400, { error: 'No such user.' })
          }
        })
      } else {
        callback(403, { error: 'Unauthorized.' })
      }
    })
  } else {
    callback(400, { error: 'Missing required field.' })
  }
}

export {
  users,
  userObj
}
