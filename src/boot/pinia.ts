import { boot } from 'quasar/wrappers'
import { pinia } from '../router'

export default boot(({ app }) => {
  app.use(pinia)
})