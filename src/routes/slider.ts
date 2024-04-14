import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'

interface RequestParams {
  id: string
}
const createProductBodySchema = z.object({
  // id: z.string(),
  image: z.string(),
  link: z.string(),
})
interface UpdateData {
  activeSlider?: boolean
}

export async function sliderRoutes(app: FastifyInstance) {
  app.post('/slider', async (request, reply) => {
    const { image, link } = createProductBodySchema.parse(request.body)

    try {
      await knex('slider').insert({
        id: randomUUID(),
        image,
        link,
      })
      return reply.status(201).send()
    } catch (error) {
      console.error(error)
      return reply
        .status(500)
        .send({ message: 'Erro ao inserir dados no banco' })
    }
  })
  app.get('/slider', async (request, reply) => {
    try {
      const slider = await knex('slider')
        .select('image', 'id', 'link', 'activeSlider')
        .orderBy('id', 'desc')

      return reply.status(200).send(slider)
    } catch (error) {
      console.error(error)
      return reply.status(500).send({ message: 'Internal Server Error' })
    }
  })

  app.delete<{ Params: RequestParams }>(
    '/slider/:id',
    async (request, reply) => {
      const { id: slideId } = request.params

      const slide = await knex('slider').where({ id: slideId }).first()
      if (!slide) {
        return reply.status(404).send({ message: 'Imagem não encontrada' })
      }

      await knex('slider').where({ id: slideId }).delete()

      return reply.status(200).send({ message: 'Imagem excluída com sucesso' })
    },
  )
  app.patch<{ Params: RequestParams; Body: UpdateData }>(
    '/slider/activeSlider/:id',
    async (request, reply) => {
      const { id: slideId } = request.params
      const { activeSlider } = request.body

      const slide = await knex('slider').where({ id: slideId }).first()
      if (!slide) {
        return reply.status(404).send({ message: 'Id não encontrado' })
      }

      const updateData: UpdateData = { activeSlider }

      try {
        await knex('slider').where({ id: slideId }).update(updateData)
        return reply.status(200).send({
          message: `Slider ${
            activeSlider ? 'ativado' : 'desativado'
          } com sucesso`,
        })
      } catch (error) {
        console.error('Erro ao atualizar o slider:', error)
        return reply.status(500).send({ message: 'Erro interno do servidor' })
      }
    },
  )
}
