import { z } from 'zod'
import { MessageRoleEnum } from './message'

const MessageBaseSchema = z.object({
  content: z.string(),
  role: MessageRoleEnum,
  tokenCount: z.number().int().nonnegative().optional(),
  metadata: z.any().optional(),
})

export const MessageCreateInputSchema = MessageBaseSchema.extend({
  thread: z.object({
    connect: z.object({
      id: z.string(),
    }),
  }),
  user: z
    .object({
      connect: z.object({
        id: z.string(),
      }),
    })
    .optional(),
  assistant: z
    .object({
      connect: z.object({
        id: z.string(),
      }),
    })
    .optional(),
  model: z
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

export const MessageUpdateInputSchema = MessageBaseSchema.partial().extend({
  user: z
    .object({
      connect: z.object({
        id: z.string(),
      }),
    })
    .optional(),
  assistant: z
    .object({
      connect: z.object({
        id: z.string(),
      }),
    })
    .optional(),
  model: z
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

export type MessageCreateInput = z.infer<typeof MessageCreateInputSchema>
export type MessageUpdateInput = z.infer<typeof MessageUpdateInputSchema>
