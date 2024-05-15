import { z } from 'zod'

export const postType = z.object({
    title: z.string(),
    url: z.string(),
})

export type postType = z.infer<typeof postType>
