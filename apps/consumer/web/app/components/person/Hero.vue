<script setup lang="ts">
  import {
    Button as HnButton,
    Heading,
    Inline,
    LineClamp,
    Link,
    Section,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { ExternalLink } from '@lucide/vue'
  import type { PeoplePageData } from '~~/server/api/pages/people/[id].get'
  import type { KnownItem } from '~/features/person/works'
  import { websiteLabel } from '~/features/person/site'

  defineOptions({ name: 'PersonHero' })
  const props = defineProps<{
    person: PeoplePageData['person']
    roles: { code: string; label: string; count: number }[]
    known: KnownItem[]
    voiced: boolean
  }>()
  defineEmits<{ role: [code: string] }>()

  const intro = computed(() => props.person.trans_intro || props.person.intro)
  const original = computed(() => !props.person.trans_intro && Boolean(props.person.intro))
  const avatar = computed(() => (props.voiced ? null : props.person.image))
</script>

<template>
  <Section class="bg-(--tone-soft) transition-colors duration-500 dark:bg-(--tone-deep-2)">
    <Stack
      gap="xl"
      class="mx-auto w-full max-w-(--entry-container) px-4 pt-[calc(var(--app-header-height)+1.5rem)] pb-10 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-14 lg:px-6 lg:pt-[calc(var(--app-header-height)+2.5rem)]"
    >
      <Stack gap="lg" class="min-w-0">
        <Inline gap="lg" align="center" :wrap="false">
          <HikariImage
            v-if="avatar"
            :src="avatar"
            :alt="`${person.name}的头像`"
            :ratio="1"
            preset="thumbnail"
            image-class="object-cover"
            class="w-16 shrink-0 overflow-hidden rounded-full shadow-md ring-1 ring-black/5 lg:w-20"
          />
          <Stack gap="sm" class="min-w-0">
            <Heading :level="1" lang="ja" class="text-3xl leading-tight font-semibold lg:text-4xl">
              {{ person.name }}
            </Heading>
            <Inline v-if="person.gender" gap="xs" align="baseline" :wrap="false">
              <Text as="span" size="sm" tone="muted">性别</Text>
              <Text as="span" size="sm">{{ person.gender }}</Text>
            </Inline>
          </Stack>
        </Inline>

        <Inline gap="none" class="gap-x-5 gap-y-2">
          <Link
            v-for="role in roles"
            :key="role.code"
            as="button"
            type="button"
            tone="neutral"
            class="inline-flex items-baseline gap-1.5 text-sm"
            @click="$emit('role', role.code)"
          >
            <Text as="span" size="sm">{{ role.label }}</Text>
            <Text as="span" size="sm" weight="semibold" class="tabular-nums">{{ role.count }}</Text>
          </Link>
        </Inline>

        <LineClamp
          v-if="intro"
          :lines="3"
          expand-label="展开"
          collapse-label="收起"
          class="max-w-2xl"
        >
          <Text
            size="sm"
            tone="muted"
            class="leading-relaxed whitespace-pre-line"
            :lang="original ? 'ja' : undefined"
          >
            {{ intro }}
          </Text>
        </LineClamp>

        <Inline gap="sm" align="center">
          <HnButton
            v-for="site in person.websites"
            :key="site.url"
            as="a"
            :href="site.url"
            target="_blank"
            rel="noopener noreferrer"
            variant="soft"
            tone="neutral"
            size="sm"
          >
            <template #icon><ExternalLink /></template>
            {{ websiteLabel(site.code) }}
          </HnButton>
          <ShareButton :to="`/people/${person.id}`" tooltip="分享" size="sm" />
        </Inline>
      </Stack>

      <PersonKnown :items="known" />
    </Stack>
  </Section>
</template>
