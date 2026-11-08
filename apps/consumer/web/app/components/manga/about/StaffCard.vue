<script setup lang="ts">
  import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'
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
  <WorkEntityCard
    :to="to"
    :name="name"
    :original="original"
    :meta="role"
    :image="item.person.image?.src"
  />
</template>
