import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    developerGuide: defineCollection({
      type: 'page',
      source: 'developers/guide/**.md',
      schema: z.object({
        section: z.string(),
        order: z.number(),
      }),
    }),
  },
})
