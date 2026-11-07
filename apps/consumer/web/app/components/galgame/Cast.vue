<script setup lang="ts">
  import { Button as HnButton, Inline } from '@hina-ui/vue'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'

  defineOptions({ name: 'GalgameCast' })
  defineProps<{ characters: GalgamePageData['characters'] }>()

  const COLLAPSED = 9
  const all = ref(false)
</script>

<template>
  <EntrySectionHead id="cast" title="出场角色" :count="characters.length">
    <template #actions>
      <HnButton
        v-if="characters.length > COLLAPSED"
        variant="ghost"
        tone="neutral"
        size="sm"
        class="hidden sm:inline-flex"
        @click="all = !all"
      >
        {{ all ? '收起' : '查看全部' }}
      </HnButton>
    </template>
  </EntrySectionHead>
  <Inline
    gap="sm"
    :wrap="false"
    class="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 xl:grid-cols-3"
  >
    <GalgameCastCard
      v-for="(item, index) in characters"
      :key="`${item.role}-${item.character.id}`"
      :item="item"
      :class="cn('w-(--card-cast) shrink-0 sm:w-auto', !all && index >= COLLAPSED && 'sm:hidden')"
    />
  </Inline>
</template>
