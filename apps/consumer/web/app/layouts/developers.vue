<script setup lang="ts">
  import { useGuideNav } from '~/features/developer/useGuide'
  import type { DevelopersApiIndexPageData } from '~~/server/api/pages/developers/api/index.get'
  import type { ReferenceNavGroup } from '~~/server/features/developer/reference'

  const { data } = await useHikariApiData<DevelopersApiIndexPageData>('/api/pages/developers/api', {
    key: 'developers-nav',
    watch: false,
  })

  const { data: sections } = await useGuideNav()

  const groups = computed<ReferenceNavGroup[]>(() => {
    const byTag = new Map<string, ReferenceNavGroup>()
    for (const entry of data.value?.entries ?? []) {
      const group = byTag.get(entry.tag) ?? {
        tag: entry.tag,
        title: entry.groupTitle,
        auth: entry.auth,
        operations: [],
      }
      group.operations.push({
        id: entry.id,
        method: entry.method,
        path: entry.path,
        summary: entry.summary,
        scopes: entry.scopes,
      })
      byTag.set(entry.tag, group)
    }
    return [...byTag.values()]
  })
</script>

<template>
  <NuxtLayout name="default">
    <DeveloperDocsShell :groups="groups" :sections="sections ?? []">
      <slot />
    </DeveloperDocsShell>
  </NuxtLayout>
</template>
