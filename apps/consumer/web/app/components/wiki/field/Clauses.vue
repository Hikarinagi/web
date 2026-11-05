<script setup lang="ts">
  import { Link, Prose, Skeleton, Stack } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { currentPath, resourceKey } from '~/features/creator/tabs'
  import { rulePath } from '~/features/wiki/rules'
  import type { RulesPageData } from '~~/server/api/pages/create/wiki/rules.get'

  defineOptions({ name: 'WikiFieldClauses' })

  const props = defineProps<{ clauses: string[] }>()
  const nav = useTabNav()
  const { data } = useHikariApiData<RulesPageData>('/api/pages/create/wiki/rules', {
    key: 'wiki-rules',
    lazy: true,
    server: false,
    toast: false,
  })
  const quoted = computed(() =>
    props.clauses.flatMap(id => data.value?.clauses.find(item => item.id === id) ?? []),
  )
</script>

<template>
  <Stack gap="md">
    <Skeleton v-if="!data" class="h-20" />
    <Prose v-for="clause in quoted" :key="clause.id" as-child>
      <div v-html="clause.html" />
    </Prose>
    <Link
      v-if="clauses[0]"
      :as="NuxtLink"
      :to="rulePath(clauses[0])"
      class="self-start text-sm"
      @click.prevent="
        nav.openIn(tab => resourceKey(currentPath(tab)) === 'rules', rulePath(clauses[0]))
      "
    >
      在编辑规范中查看
    </Link>
  </Stack>
</template>
