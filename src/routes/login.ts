import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'

export async function productsRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    const products = await knex('products').select()

    return reply.status(201).send(products)
  })

  app.post('/', async (request, reply) => {
    const createProductBodySchema = z.object({
      title: z.string(),
      price: z.number(),
      image: z.string(),
      description: z.string(),
      quantity: z.number(),
    })
    const { title, price, image, description, quantity } =
      createProductBodySchema.parse(request.body)

    await knex('products').insert({
      id: randomUUID(),
      title,
      price,
      image,
      description,
      quantity,
    })
    return reply.status(201).send()
  })
}
