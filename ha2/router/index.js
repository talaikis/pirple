import { handlers } from '../handlers'

const router = {
  users: handlers.users,
  tokens: handlers.tokens,
  urls: handlers.urls,
  confirm: handlers.confirm,
  reset: handlers.reset,
  refer: handlers.refer,
  menu: handlers.menu,
  orders: handlers.orders,
  ping: handlers.ping,
  notFound: handlers.notFound
}

export {
  router
}
