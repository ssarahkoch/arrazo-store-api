import fastify from 'fastify'
import cors from '@fastify/cors'
import { env } from './env'
import { productsRoutes } from './routes/products'
import cookie from '@fastify/cookie'
import { sliderRoutes } from './routes/slider'
import { searchRoutes } from './routes/search'

const app = fastify()

app.register(cors, {
  origin: '*',
})
app.register(cookie)
app.register(searchRoutes)
app.register(sliderRoutes)
app.register(productsRoutes, { prefix: 'products' })

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP Server Running!')
  })
