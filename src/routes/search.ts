import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'

const searchQuerySchema = z.object({
  category: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
})
type SearchQuery = z.infer<typeof searchQuerySchema>

export async function searchRoutes(app: FastifyInstance) {
  app.get<{ Params: { search: string }; Querystring: SearchQuery }>(
    '/search/:search',
    async (request, reply) => {
      const { search } = request.params

      const validationResult = searchQuerySchema.safeParse(request.query)
      if (!validationResult.success) {
        return reply.status(400).send(validationResult.error)
      }

      let queryBuilder = knex('products').select('*')

      if (search) {
        queryBuilder = queryBuilder.where(function () {
          this.where('title', 'like', `%${search}%`)
            .orWhere('description', 'like', `%${search}%`)
            .orWhere('category', 'like', `%${search}%`)
            .orWhere('subtitle', 'like', `%${search}%`)
        })
      }

      try {
        const filteredProducts = await queryBuilder
        return reply.send(filteredProducts)
      } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: 'Erro ao buscar produtos' })
      }
    },
  )
}
