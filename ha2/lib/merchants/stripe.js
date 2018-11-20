import { config } from '../../config'
import { request } from '../utils'

const stripeCharge = (orderId, amount, token, callback) => {
  const validAmount = typeof amount === 'number' && amount > 0 ? amount * 100.0 : false
  const validOrderId = typeof orderId === 'string' && orderId.trim().length === 36 ? orderId : false
  token = typeof token === 'string' ? token : 'tok_visa' // @TODO more throurough testing

  if (validAmount && validOrderId) {
    const payload = {
      amount: validAmount,
      source: token,
      currency: config.currency,
      description: `${config.chargeDescription} ${orderId}`
    }

    const obj = {
      protocol: 'https:',
      hostname: 'api.stripe.com',
      method: 'POST',
      path: '/v1/charges',
      data: payload,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${config.stripe.secretKey}`
      }
    }

    request('https', obj, (err) => {
      if (!err) {
        callback(false)
      } else {
        callback(err)
      }
    })
  } else {
    callback('Parameters missing or are invalid.')
  }
}

export {
  stripeCharge
}
