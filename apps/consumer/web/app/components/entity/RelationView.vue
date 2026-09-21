<script setup lang="ts">
  import type { PageMeta } from '@hikarinagi/shared'
  import { Grid, Heading, Inline, Link, Stack, Text } from '@hina-ui/vue'
  import { ArrowLeft } from '@lucide/vue'
  import {
    mapVoiceItems,
    mapWorkItems,
    type RelationMode,
    type WorkVariant,
  } from '~/features/entity/relations'

  defineOptions({ name: 'EntityRelationView' })
  const props = defineProps<{
    backTo: string
    backLabel: string
    title: string
    total: number
    mode: RelationMode
    variant?: WorkVariant
    rawItems: readonly unknown[]
    pending: boolean
    meta: PageMeta
  }>()

  const router = useRouter()
  function onBack(e: MouseEvent, navigate: () => void) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    if (window.history.state?.back === props.backTo) router.back()
    else navigate()
  }

  const workItems = computed(() =>
    props.mode === 'work' && props.variant ? mapWorkItems(props.rawItems, props.variant) : [],
  )
  const voiceItems = computed(() => (props.mode === 'voice' ? mapVoiceItems(props.rawItems) : []))
  const metaText = computed(() =>
    props.mode === 'voice' ? `${props.total} 个角色` : `${props.total} 部`,
  )
</script>

<template>
  <Stack gap="lg">
    <NuxtLink v-slot="{ href, navigate }" :to="backTo" custom>
      <Link
        :href="href ?? undefined"
        tone="neutral"
        :underline="false"
        class="inline-flex w-fit items-center gap-1.5 text-sm text-muted hover:text-fg"
        @click="onBack($event, navigate)"
      >
        <ArrowLeft class="size-3.5" />
        {{ backLabel }}
      </Link>
    </NuxtLink>

    <Inline gap="sm" :wrap="false">
      <Heading :level="2">{{ title }}</Heading>
      <Text size="xs" tone="muted">{{ metaText }}</Text>
    </Inline>

    <Grid
      v-if="mode === 'work'"
      id="entity-relation-items"
      :cols="3"
      class="gap-x-4 gap-y-5 sm:grid-cols-4 lg:grid-cols-6"
    >
      <EntityWorkCard
        v-for="(item, index) in workItems"
        :key="`${item.to}-${index}`"
        :item="item"
      />
    </Grid>
    <Grid v-else id="entity-relation-items" :cols="1" class="gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <EntityVoiceCard v-for="item in voiceItems" :key="item.to" :item="item" />
    </Grid>

    <Paginator
      :meta="meta"
      :loading="pending"
      route="push"
      align="center"
      scroll-target="#entity-relation-items"
    />
  </Stack>
</template>
