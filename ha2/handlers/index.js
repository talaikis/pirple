import { users } from './users'
import { tokens } from './token'
import { urls } from './urls'
import { confirm } from './confirm'
import { reset } from './reset'
import { refer } from './refer'
import { menu } from './menu'
import { orders } from './orders'
import { ping, notFound } from './generics'

const handlers = {
  users,
  tokens,
  urls,
  confirm,
  reset,
  refer,
  menu,
  orders,
  ping,
  notFound
}

export {
  handlers
}
