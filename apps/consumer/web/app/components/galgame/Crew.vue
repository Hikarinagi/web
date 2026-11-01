<script setup lang="ts">
  import { Grid, Heading, Link, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import { ORGANIZATION_ROLES, creditRoleLabel, titleText } from '~/features/entry/labels'

  defineOptions({ name: 'GalgameCrew' })
  const props = defineProps<{ galgameId: number; credits: GalgamePageData['credits'] }>()

  const organizations = computed(() => {
    const map = new Map<string, { name: string; producerId: number | null; roles: string[] }>()
    for (const group of props.credits.groups.filter(item => ORGANIZATION_ROLES.includes(item.code)))
      for (const credit of group.credits) {
        const key = `${credit.producer_id ?? ''}:${credit.text}`
        const entry = map.get(key) ?? {
          name: credit.text,
          producerId: credit.producer_id,
          roles: [],
        }
        entry.roles.push(creditRoleLabel(group.code))
        map.set(key, entry)
      }
    return [...map.values()]
  })
  const people = computed(() =>
    props.credits.groups.filter(item => !ORGANIZATION_ROLES.includes(item.code)),
  )
  const hasContent = computed(
    () => props.credits.groups.length > 0 || props.credits.translators.length > 0,
  )
</script>

<template>
  <WorkSection v-if="hasContent" title="制作信息">
    <template #action>
      <WorkEditButton resource-type="galgame" :resource-id="galgameId" />
    </template>
    <Text v-if="credits.product" size="sm" tone="muted">
      取自首发版
      <Link
        :as="NuxtLink"
        :to="{ query: { product: String(credits.product.id) } }"
        replace
        tone="accent"
      >
        {{ titleText(credits.product.title) }}</Link
      >，其他版本见各发行版本的详情。
    </Text>
    <Grid
      v-if="organizations.length"
      :cols="1"
      gap="none"
      class="gap-3 sm:grid-cols-2 lg:grid-cols-3"
    >
      <GalgameCrewProducerCard
        v-for="item in organizations"
        :key="`${item.producerId}-${item.name}`"
        :name="item.name"
        :producer-id="item.producerId"
        :roles="item.roles.join('、')"
      />
    </Grid>
    <GalgameCrewStaffCredits v-if="people.length" :groups="people" />
    <Stack v-if="credits.translators.length" gap="none" class="gap-3">
      <Heading :level="3" size="base">非官方翻译</Heading>
      <Grid :cols="1" gap="none" class="gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <GalgameCrewProducerCard
          v-for="(item, index) in credits.translators"
          :key="index"
          :name="item.text"
          :producer-id="item.producer_id"
          roles=""
        />
      </Grid>
    </Stack>
  </WorkSection>
</template>
