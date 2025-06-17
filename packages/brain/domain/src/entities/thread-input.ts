import { z } from 'zod'

const ThreadBaseSchema = z.object({
  title: z.string().optional(),
})

export const ThreadCreateInputSchema = ThreadBaseSchema.extend({
  user: z.object({
    connect: z.object({
      id: z.string(),
    }),
  }),
  assistant: z.object({
    connect: z.object({
      id: z.string(),
    }),
  }),
  parent: z
    .object({
      connect: z.object({
        id: z.string(),
      }),
    })
    .optional(),
})

export const ThreadUpdateInputSchema = ThreadBaseSchema.partial().extend({
  assistant: z
    .object({
      connect: z.object({
        id: z.string(),
      }),
    })
    .optional(),
  parent: z
    .object({
      connect: z.object({
        id: z.string(),
      }),
    })
    .optional(),
})

export type ThreadCreateInput = z.infer<typeof ThreadCreateInputSchema>
export type ThreadUpdateInput = z.infer<typeof ThreadUpdateInputSchema>
