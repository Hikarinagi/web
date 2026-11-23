<script setup lang="ts">
  import { AspectRatio, Center, Drawer, Inline, Stack, Text } from '@hina-ui/vue'
  import { BookImage } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { VolumeDrawerRow } from '~/features/volume-set/sets'

  defineOptions({ name: 'EntryVolumeDrawer' })

  defineProps<{ title: string; description: string; rows: VolumeDrawerRow[] }>()
  const open = defineModel<boolean>('open', { required: true })
</script>

<template>
  <Drawer v-model:open="open" :title="title" :description="description" size="md">
    <template #content>
      <Stack gap="none" class="-mx-(--hn-panel-p)">
        <Inline
          v-for="row in rows"
          :key="row.id"
          :as="NuxtLink"
          :to="row.to"
          gap="md"
          :wrap="false"
          class="hn-state-layer hn-interactive border-b border-line px-(--hn-panel-p) py-3"
        >
          <AspectRatio
            :ratio="7 / 10"
            class="w-12 shrink-0 overflow-hidden rounded-md ring-1 ring-line"
          >
            <HikariImage
              :src="row.cover"
              :alt="row.label"
              class="size-full"
              image-class="object-cover"
              :processing="{ width: 120, quality: 80, fit: 'cover' }"
            >
              <template #empty>
                <Center as="span" class="size-full bg-subtle text-faint">
                  <BookImage class="size-4" aria-hidden="true" />
                </Center>
              </template>
              <template #error>
                <Center as="span" class="size-full bg-subtle text-faint">
                  <BookImage class="size-4" aria-hidden="true" />
                </Center>
              </template>
            </HikariImage>
          </AspectRatio>
          <Stack gap="none" class="min-w-0 flex-1">
            <Text size="sm" weight="medium">{{ row.label }}</Text>
            <TruncatedText v-if="row.name" :text="row.name" size="sm" tone="muted" />
            <TruncatedText
              v-if="row.meta"
              :text="row.meta"
              size="xs"
              tone="faint"
              class="tabular-nums"
            />
          </Stack>
        </Inline>
      </Stack>
    </template>
  </Drawer>
</template>
