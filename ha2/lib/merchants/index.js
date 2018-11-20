import { stripeCharge } from './stripe'
import { config } from '../../config'

const charge = config.paymentProcessor === 'stripe' ? stripeCharge : {}

export {
  charge
}
