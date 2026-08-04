<script setup lang="ts">
  import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'
  import { ENTITY_FALLBACK_IMAGE } from '~/features/entity/entity'
  import { MANGA_STAFF_CATALOGS } from '~/features/manga/catalog'
  import { mangaStaffRoleLabel } from '~/features/manga/labels'

  defineOptions({ name: 'MangaAboutStaffCard' })

  const props = defineProps<{ item: MangaPageData['people'][number] }>()

  const name = computed(() => props.item.person.trans_name || props.item.person.name)
  const original = computed(() =>
    props.item.person.trans_name && props.item.person.trans_name !== props.item.person.name
      ? props.item.person.name
      : '',
  )
  const role = computed(() => props.item.note || mangaStaffRoleLabel(props.item.role))
  const to = computed(() => {
    const slug = Object.entries(MANGA_STAFF_CATALOGS).find(
      ([, catalog]) => catalog.role === props.item.role,
    )?.[0]
    return slug ? `/mangas/${slug}/${props.item.person.id}` : `/people/${props.item.person.id}`
  })
</script>

<template>
  <NuxtLink
    :to="to"
    class="group flex h-20 items-center gap-3 rounded-xl border border-surface-200 bg-surface-0 px-3.5 py-3 transition-colors hover:border-surface-300 dark:border-surface-800 dark:bg-surface-900 dark:hover:border-surface-700"
  >
    <HikariImage
      :src="item.person.image?.src"
      :alt="name"
      class="size-14 shrink-0 rounded-full"
      image-class="object-cover object-top"
      :processing="{ gravity: 'face' }"
      preset="thumbnail"
      :fallback-src="ENTITY_FALLBACK_IMAGE"
    />
    <div class="flex min-w-0 flex-1 flex-col gap-1">
      <p
        class="truncate text-sm font-bold text-surface-900 transition-colors group-hover:text-hikari-primary-600 dark:text-surface-0 dark:group-hover:text-hikari-primary-400"
      >
        {{ name }}
      </p>
      <p class="flex min-w-0 items-center gap-1.5 text-xs text-surface-500 dark:text-surface-400">
        <span v-if="original" class="min-w-0 truncate">{{ original }}</span>
        <span v-if="original" class="shrink-0">·</span>
        <span class="shrink-0">{{ role }}</span>
      </p>
    </div>
  </NuxtLink>
</template>
