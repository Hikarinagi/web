<script setup lang="ts">
  import { PrevNext, PrevNextLink } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { ReferenceEntry } from '~~/server/features/developer/reference'

  defineOptions({ name: 'DeveloperApiPrevNext' })
  defineProps<{ prev: ReferenceEntry | null; next: ReferenceEntry | null }>()
</script>

<template>
  <PrevNext>
    <PrevNextLink v-if="prev" :as="NuxtLink" :to="`/developers/api/${prev.id}`" direction="prev">
      {{ prev.summary ?? prev.id }}
    </PrevNextLink>
    <PrevNextLink v-if="next" :as="NuxtLink" :to="`/developers/api/${next.id}`" direction="next">
      {{ next.summary ?? next.id }}
    </PrevNextLink>
  </PrevNext>
</template>
