<script setup lang="ts">
  import { PrevNext, PrevNextLink } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { GuideNavItem } from '~/features/developer/useGuide'

  defineOptions({ name: 'DeveloperGuidePrevNext' })
  const props = defineProps<{ sections: GuideNavItem[]; section: string }>()

  const index = computed(() => props.sections.findIndex(item => item.section === props.section))
  const prev = computed(() => props.sections[index.value - 1])
  const next = computed(() => props.sections[index.value + 1])
</script>

<template>
  <PrevNext>
    <PrevNextLink v-if="prev" :as="NuxtLink" :to="prev.path" direction="prev">
      {{ prev.title }}
    </PrevNextLink>
    <PrevNextLink v-if="next" :as="NuxtLink" :to="next.path" direction="next">
      {{ next.title }}
    </PrevNextLink>
    <PrevNextLink v-else :as="NuxtLink" to="/developers/api" direction="next">
      端点参考
    </PrevNextLink>
  </PrevNext>
</template>
