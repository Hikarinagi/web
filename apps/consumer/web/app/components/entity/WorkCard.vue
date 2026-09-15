<script setup lang="ts">
  import { Card, Stack, Tag, Text } from '@hina-ui/vue'
  import { cn } from '~/utils/cn'
  import type { WorkCardItem } from '~/features/entity/entity'

  defineOptions({ name: 'EntityWorkCard' })
  const props = defineProps<{ item: WorkCardItem }>()

  const ratio = computed(() =>
    props.item.aspect === 'light_novel'
      ? 'aspect-7/10'
      : props.item.aspect === 'manga'
        ? 'aspect-2/3'
        : 'aspect-3/4',
  )
</script>

<template>
  <Stack gap="none" class="group relative min-w-0 gap-2">
    <Card :padded="false" :class="cn('relative bg-subtle shadow-none', ratio)">
      <HikariImage
        :src="item.cover"
        :alt="item.title"
        class="size-full"
        image-class="object-cover object-top"
        :processing="{ quality: 82 }"
      />
      <Tag
        v-if="item.rolePill"
        variant="solid"
        tone="neutral"
        size="sm"
        truncate
        class="absolute top-1.5 left-1.5 max-w-[calc(100%-0.75rem)] backdrop-blur-sm"
      >
        {{ item.rolePill }}
      </Tag>
    </Card>
    <Stack gap="none" class="gap-0.5">
      <NuxtLink
        :to="item.to"
        class="truncate text-sm font-medium text-fg transition-colors group-hover:text-accent-text after:absolute after:inset-0"
      >
        {{ item.title }}
      </NuxtLink>
      <Text v-if="item.cv?.length" size="xs" tone="muted" truncate class="relative z-10">
        <template v-for="(actor, index) in item.cv" :key="actor.id">
          <Text v-if="index" as="span" size="xs" tone="muted" aria-hidden="true" class="px-1">
            /
          </Text>
          <NuxtLink
            :to="`/people/${actor.id}`"
            class="transition-colors hover:text-accent-text hover:underline"
          >
            {{ actor.name }}
          </NuxtLink>
        </template>
      </Text>
      <Text v-else-if="item.subtitle" size="xs" tone="muted" truncate>{{ item.subtitle }}</Text>
      <Text v-else-if="item.year" size="xs" tone="muted">{{ item.year }}</Text>
    </Stack>
  </Stack>
</template>
