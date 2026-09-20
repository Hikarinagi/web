<script setup lang="ts">
  import type { PageMeta } from '@hikarinagi/shared'
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
    meta?: PageMeta
    hasMore?: boolean
  }>()
  defineEmits<{ loadMore: [] }>()

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
  <div class="flex flex-col gap-6">
    <NuxtLink v-slot="{ href, navigate }" :to="backTo" custom>
      <a
        :href="href ?? undefined"
        class="inline-flex w-fit items-center gap-1.5 text-sm text-surface-500 transition-colors hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200"
        @click="onBack($event, navigate)"
      >
        <ArrowLeft class="size-3.5" />
        {{ backLabel }}
      </a>
    </NuxtLink>

    <div class="flex items-center gap-2.5">
      <h2 class="text-[22px] font-bold text-surface-900 dark:text-surface-0">{{ title }}</h2>
      <p class="text-[13px] text-surface-500 dark:text-surface-400">{{ metaText }}</p>
    </div>

    <div
      v-if="mode === 'work'"
      id="entity-relation-items"
      class="grid grid-cols-3 gap-x-4 gap-y-5 sm:grid-cols-4 lg:grid-cols-6"
    >
      <EntityWorkCard
        v-for="(item, index) in workItems"
        :key="`${item.to}-${index}`"
        :item="item"
      />
    </div>
    <div
      v-else
      id="entity-relation-items"
      class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <EntityVoiceCard v-for="item in voiceItems" :key="item.to" :item="item" />
    </div>

    <Paginator
      v-if="meta"
      :meta="meta"
      :loading="pending"
      route="push"
      align="center"
      scroll-target="#entity-relation-items"
    />

    <div v-else-if="hasMore" class="flex justify-center pt-2">
      <Button severity="secondary" outlined :loading="pending" @click="$emit('loadMore')">
        加载更多
      </Button>
    </div>
  </div>
</template>
