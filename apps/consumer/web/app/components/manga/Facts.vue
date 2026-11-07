<script setup lang="ts">
  import {
    Button as HnButton,
    DescriptionDetails,
    DescriptionList,
    DescriptionTerm,
    Link,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'
  import { dayText } from '~/features/entry/date'
  import {
    MANGA_AUDIENCE_LABELS,
    MANGA_READING_MODE_LABELS,
    mangaSerialStatusLabel,
    mangaStaffRoleLabel,
  } from '~/features/manga/labels'

  defineOptions({ name: 'MangaFacts' })
  const props = defineProps<{
    manga: MangaPageData['manga']
    people: MangaPageData['people']
    producers: MangaPageData['producers']
    volumes: MangaPageData['volumes']
  }>()

  const COLLAPSED = 3
  const volumesOpen = ref(false)
  const allAliases = ref(false)
  const aliases = computed(() =>
    allAliases.value ? props.manga.other_names : props.manga.other_names.slice(0, COLLAPSED),
  )
  const groups = computed(() => {
    const map = new Map<string, { id: number; name: string }[]>()
    for (const item of props.people) {
      const label = item.note || mangaStaffRoleLabel(item.role)
      map.set(label, [...(map.get(label) ?? []), item.person])
    }
    return [...map].map(([label, people]) => ({ label, people }))
  })
  const magazines = computed(() =>
    props.producers.filter(item => item.role === 'MAGAZINE').map(item => item.producer),
  )
  const publishers = computed(() =>
    props.producers.filter(item => item.role === 'PUBLISHER').map(item => item.producer),
  )
  const lastVolume = computed(() => props.volumes.findLast(volume => volume.publication_date))
  const book = computed(() =>
    [
      props.manga.pages ? `${props.manga.pages} 页` : '',
      props.manga.price_amount
        ? `${props.manga.price_currency ?? ''} ${props.manga.price_amount}`.trim()
        : '',
    ]
      .filter(Boolean)
      .join('，'),
  )
  const host = computed(() =>
    props.manga.homepage?.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''),
  )
</script>

<template>
  <DescriptionList
    orientation="horizontal"
    class="gap-x-4 gap-y-2 text-sm [&_dd]:text-fg [&_dt]:text-muted"
  >
    <template v-for="group in groups" :key="group.label">
      <DescriptionTerm>{{ group.label }}</DescriptionTerm>
      <DescriptionDetails>
        <Stack gap="none">
          <Link
            v-for="person in group.people"
            :key="person.id"
            :as="NuxtLink"
            :to="`/people/${person.id}`"
            tone="neutral"
            class="self-start"
            lang="ja"
          >
            {{ person.name }}
          </Link>
        </Stack>
      </DescriptionDetails>
    </template>
    <template v-if="magazines.length">
      <DescriptionTerm>连载</DescriptionTerm>
      <DescriptionDetails>
        <Stack gap="none">
          <Link
            v-for="magazine in magazines"
            :key="magazine.id"
            :as="NuxtLink"
            :to="`/mangas/magazine/${magazine.id}`"
            tone="neutral"
            class="self-start"
            lang="ja"
          >
            {{ magazine.name }}
          </Link>
        </Stack>
      </DescriptionDetails>
    </template>
    <template v-if="publishers.length">
      <DescriptionTerm>出版社</DescriptionTerm>
      <DescriptionDetails>
        <Stack gap="none">
          <Link
            v-for="publisher in publishers"
            :key="publisher.id"
            :as="NuxtLink"
            :to="`/producers/${publisher.id}`"
            tone="neutral"
            class="self-start"
            lang="ja"
          >
            {{ publisher.name }}
          </Link>
        </Stack>
      </DescriptionDetails>
    </template>
    <template v-if="manga.publication_date">
      <DescriptionTerm>{{ manga.publication_end_date ? '连载期间' : '开始连载' }}</DescriptionTerm>
      <DescriptionDetails class="tabular-nums">
        <Stack gap="none">
          <Text as="span" size="sm">{{ dayText(manga.publication_date) }}</Text>
          <Text v-if="manga.publication_end_date" as="span" size="sm">
            至 {{ dayText(manga.publication_end_date) }}
          </Text>
        </Stack>
      </DescriptionDetails>
    </template>
    <template v-if="manga.serial_status">
      <DescriptionTerm>状态</DescriptionTerm>
      <DescriptionDetails>{{ mangaSerialStatusLabel(manga.serial_status) }}</DescriptionDetails>
    </template>
    <template v-if="volumes.length">
      <DescriptionTerm>单行本</DescriptionTerm>
      <DescriptionDetails>
        <Stack gap="none">
          <HnButton variant="link" size="sm" class="self-start" @click="volumesOpen = true">
            {{ volumes.length }} 卷
          </HnButton>
          <Text v-if="lastVolume" as="span" size="sm" tone="muted" class="tabular-nums">
            最新一卷 {{ dayText(lastVolume.publication_date) }}
          </Text>
        </Stack>
        <MangaVolumeDrawer v-model:open="volumesOpen" :volumes="volumes" />
      </DescriptionDetails>
    </template>
    <template v-if="book">
      <DescriptionTerm>单册</DescriptionTerm>
      <DescriptionDetails>{{ book }}</DescriptionDetails>
    </template>
    <template v-if="manga.isbn">
      <DescriptionTerm>ISBN</DescriptionTerm>
      <DescriptionDetails class="tabular-nums">{{ manga.isbn }}</DescriptionDetails>
    </template>
    <template v-if="manga.audience">
      <DescriptionTerm>读者对象</DescriptionTerm>
      <DescriptionDetails>{{ MANGA_AUDIENCE_LABELS[manga.audience] }}</DescriptionDetails>
    </template>
    <template v-if="manga.reading_mode">
      <DescriptionTerm>阅读方向</DescriptionTerm>
      <DescriptionDetails>{{ MANGA_READING_MODE_LABELS[manga.reading_mode] }}</DescriptionDetails>
    </template>
    <template v-if="manga.homepage">
      <DescriptionTerm>官网</DescriptionTerm>
      <DescriptionDetails class="min-w-0">
        <Link
          as="a"
          :href="manga.homepage"
          target="_blank"
          rel="noopener noreferrer"
          tone="neutral"
          class="block truncate"
        >
          {{ host }}
        </Link>
      </DescriptionDetails>
    </template>
    <template v-if="manga.other_names.length">
      <DescriptionTerm>别名</DescriptionTerm>
      <DescriptionDetails class="wrap-anywhere">
        <Stack gap="none">
          <Text v-for="alias in aliases" :key="alias" as="span" size="sm">{{ alias }}</Text>
          <HnButton
            v-if="manga.other_names.length > COLLAPSED"
            variant="link"
            size="sm"
            class="self-start"
            @click="allAliases = !allAliases"
          >
            {{ allAliases ? '收起' : `另有 ${manga.other_names.length - COLLAPSED} 个` }}
          </HnButton>
        </Stack>
      </DescriptionDetails>
    </template>
  </DescriptionList>
</template>
