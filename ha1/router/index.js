import { handlers } from '../handlers'

const router = {
  hello: handlers.hello,
  notFound: handlers.notFound
}

export {
  router
}
