<script setup lang="ts">
  import { Card, Inline, Link, Ripple, Stack, Text, VisuallyHidden } from '@hina-ui/vue'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import { ENTITY_FALLBACK_IMAGE } from '~/features/entity/entity'

  defineOptions({ name: 'GalgameAboutCharacterCard' })
  const props = defineProps<{ item: GalgamePageData['characters'][number] }>()

  const name = computed(() => props.item.character.trans_name || props.item.character.name)
  const actors = computed(() =>
    props.item.actors.map(actor => ({ id: actor.id, name: actor.trans_name || actor.name })),
  )
</script>

<template>
  <Card
    :padded="false"
    class="hn-state-layer flex h-20 hn-interactive items-center gap-3 rounded-xl px-3.5 py-3 hn-press-lg"
  >
    <Ripple />

    <HikariImage
      :src="item.character.image?.src"
      :alt="name"
      class="size-14 shrink-0 rounded-full"
      image-class="object-cover object-top"
      :processing="{ gravity: 'face' }"
      preset="thumbnail"
      :fallback-src="ENTITY_FALLBACK_IMAGE"
    >
      <template #error><VisuallyHidden /></template>
    </HikariImage>

    <Stack gap="xs" class="min-w-0 flex-1">
      <NuxtLink v-slot="{ href, navigate }" :to="`/characters/${item.character.id}`" custom>
        <Link
          :href="href ?? undefined"
          tone="neutral"
          :underline="false"
          class="truncate text-sm font-bold after:absolute after:inset-0"
          @click="navigate"
        >
          {{ name }}
        </Link>
      </NuxtLink>

      <Inline
        v-if="actors.length"
        gap="xs"
        align="center"
        :wrap="false"
        class="relative z-10 w-fit max-w-full"
      >
        <Text as="span" size="xs" tone="faint" class="shrink-0">CV</Text>
        <Text as="span" size="xs" tone="muted" truncate>
          <template v-for="(actor, index) in actors" :key="actor.id">
            <Text v-if="index" as="span" aria-hidden="true" class="px-1">/</Text>
            <NuxtLink v-slot="{ href, navigate }" :to="`/people/${actor.id}`" custom>
              <Link
                :href="href ?? undefined"
                tone="neutral"
                :underline="false"
                class="transition-colors hover:text-accent-text hover:underline"
                @click="navigate"
              >
                {{ actor.name }}
              </Link>
            </NuxtLink>
          </template>
        </Text>
      </Inline>
    </Stack>
  </Card>
</template>
