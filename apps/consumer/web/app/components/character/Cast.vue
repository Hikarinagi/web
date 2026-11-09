<script setup lang="ts">
  import { IconButton, Inline, ScrollArea, Text } from '@hina-ui/vue'
  import { ChevronLeft, ChevronRight } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { CastMember } from '~/features/character/appearances'
  import { ENTITY_FALLBACK_IMAGE } from '~/features/entity/entity'

  defineOptions({ name: 'CharacterCast' })
  const props = defineProps<{ cast: CastMember[]; characterId: number }>()

  const at = computed(() => props.cast.findIndex(member => member.id === props.characterId))
  const prev = computed(() => (at.value > 0 ? props.cast[at.value - 1] : undefined))
  const next = computed(() => (at.value >= 0 ? props.cast[at.value + 1] : undefined))
</script>

<template>
  <Inline v-if="cast.length" gap="md" align="center" :wrap="false">
    <Text size="sm" tone="muted" class="hidden shrink-0 tabular-nums lg:block">
      同作角色 {{ cast.length }}
    </Text>
    <ScrollArea direction="horizontal" :wheel-redirect="false" class="min-w-0 flex-1">
      <Inline gap="xs" align="center" :wrap="false" class="w-max py-1 pr-1 pl-0.5">
        <NuxtLink
          v-for="member in cast"
          :key="member.id"
          v-tooltip="member.name"
          :to="`/characters/${member.id}`"
          class="block shrink-0 hn-interactive rounded-lg"
          :aria-current="member.id === characterId ? 'page' : undefined"
          :aria-label="member.name"
        >
          <HikariImage
            :src="member.image"
            :alt="member.name"
            :ratio="1"
            :processing="{ gravity: 'face' }"
            :fallback-src="ENTITY_FALLBACK_IMAGE"
            preset="thumbnail"
            image-class="object-cover object-top"
            :class="[
              'size-12 overflow-hidden rounded-lg bg-white ring-2 transition-[box-shadow,opacity] duration-(--hn-duration-fast)',
              member.id === characterId
                ? 'ring-accent'
                : 'opacity-75 ring-transparent hover:opacity-100',
            ]"
          />
        </NuxtLink>
      </Inline>
    </ScrollArea>
    <Inline gap="xs" :wrap="false" class="shrink-0">
      <IconButton
        :as="prev ? NuxtLink : undefined"
        :to="prev ? `/characters/${prev.id}` : undefined"
        :disabled="!prev"
        :label="prev ? `上一位：${prev.name}` : '没有上一位'"
        variant="ghost"
        tone="neutral"
        size="sm"
      >
        <ChevronLeft />
      </IconButton>
      <IconButton
        :as="next ? NuxtLink : undefined"
        :to="next ? `/characters/${next.id}` : undefined"
        :disabled="!next"
        :label="next ? `下一位：${next.name}` : '没有下一位'"
        variant="ghost"
        tone="neutral"
        size="sm"
      >
        <ChevronRight />
      </IconButton>
    </Inline>
  </Inline>
</template>
