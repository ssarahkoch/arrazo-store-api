/* eslint-disable camelcase */
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'

interface RequestParams {
  category: string
  title: string
  id: string
}

interface UpdateData {
  price?: number
  category?: string
  quantity?: number
  title?: string
  subtitle?: string
  image?: string
  description?: string
}

export async function productsRoutes(app: FastifyInstance) {
  // Rota para excluir um produto pelo ID
  app.delete<{ Params: RequestParams }>('/:id', async (request, reply) => {
    const productId = request.params.id

    const product = await knex('products').where({ id: productId }).first()
    if (!product) {
      return reply.status(404).send({ message: 'Produto não encontrado' })
    }

    await knex('products').where({ id: productId }).delete()

    return reply.status(200).send({ message: 'Produto excluído com sucesso' })
  })

  // Rota para buscar um produto pelo ID
  app.get<{ Params: RequestParams }>('/:id', async (request, reply) => {
    const productId = request.params.id

    const product = await knex('products').where({ id: productId }).first()
    if (!product) {
      return reply.status(404).send({ message: 'Produto não encontrado' })
    }

    return reply.status(200).send(product)
  })

  // Rota para buscar nome da categoria com remoção de acentos
  app.get<{ Params: RequestParams }>(
    '/category/name/:category',
    async (request, reply) => {
      const categoryInput = request.params.category.toLowerCase()

      const categoryProducts = await knex('products')
        .whereRaw('LOWER(REPLACE(category, "ó", "o")) = ?', categoryInput)
        .select('category')
        .distinct()

      if (categoryProducts.length === 0) {
        return reply
          .status(404)
          .send({ message: 'Nome da categoria não encontrada' })
      }

      return reply.status(200).send(categoryProducts)
    },
  )

  // Rota para buscar produtos por categoria
  app.get<{ Params: RequestParams }>(
    '/category/:category',
    async (request, reply) => {
      const categoryInput = request.params.category.toLowerCase()

      const categoryProducts = await knex('products')
        .whereRaw('LOWER(REPLACE(category, "ó", "o")) = ?', categoryInput)
        .select()

      if (categoryProducts.length === 0) {
        return reply
          .status(404)
          .send({ message: 'Categoria de produtos não encontrada' })
      }

      return reply.status(200).send(categoryProducts)
    },
  )

  // Rota para buscar todos os título/marca
  app.get<{ Params: RequestParams }>('/title', async (request, reply) => {
    const titleProducts = await knex('products')
      .select('title')
      .distinct('title')
      .orderBy('title', 'asc')
      .limit(11)

    if (titleProducts.length === 0) {
      return reply.status(404).send({ message: 'Nome da marca não encontrada' })
    }

    return reply.status(200).send(titleProducts)
  })

  // Rota para buscar produtos por título/marca
  app.get<{ Params: RequestParams }>(
    '/title/:title',
    async (request, reply) => {
      const title = request.params.title.replace(/\s+/g, '').toLowerCase()

      const titleProducts = await knex('products')
        .whereRaw('LOWER(REPLACE(title, " ", "")) = ?', title)
        .select()

      if (titleProducts.length === 0) {
        return reply
          .status(404)
          .send({ message: 'Categoria de marcas não encontrada' })
      }

      return reply.status(200).send(titleProducts)
    },
  )

  // Rota para atualizar informações de um produto
  app.patch<{ Params: RequestParams; Body: UpdateData }>(
    '/:id',
    async (request, reply) => {
      const { id } = request.params
      const { title, image, description, price, quantity, subtitle, category } =
        request.body

      const product = await knex('products').where({ id }).first()
      if (!product) {
        return reply.status(404).send({ message: 'Produto não encontrado' })
      }

      const updateData: UpdateData = {}

      if (price !== undefined) updateData.price = price
      if (category !== undefined) updateData.category = category
      if (quantity !== undefined) updateData.quantity = quantity
      if (title !== undefined) updateData.title = title
      if (subtitle !== undefined) updateData.subtitle = subtitle
      if (image !== undefined) updateData.image = image
      if (description !== undefined) updateData.description = description

      if (Object.keys(updateData).length > 0) {
        await knex('products').where({ id }).update(updateData)
      }

      return reply
        .status(200)
        .send({ message: 'Produto atualizado com sucesso' })
    },
  )

  // Rota para listar todos os produtos
  app.get('/', async (request, reply) => {
    const products = await knex('products').select()

    return reply.status(201).send(products)
  })

  // Rota para criar/adicionar novo produto
  app.post('/', async (request, reply) => {
    const createProductBodySchema = z.object({
      category: z.string(),
      title: z.string(),
      subtitle: z.string(),
      price: z.number(),
      image: z.string(),
      description: z.string(),
      quantity: z.number(),
    })
    const { title, price, image, description, quantity, category, subtitle } =
      createProductBodySchema.parse(request.body)

    await knex('products').insert({
      id: randomUUID(),

      category,
      title,
      subtitle,
      price,
      image,
      description,
      quantity,
    })

    return reply.status(201).send()
  })
}
