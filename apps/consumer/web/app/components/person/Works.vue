<script setup lang="ts">
  import {
    IconButton,
    LoadingOverlay,
    Stack,
    Tabs,
    TabsList,
    TabsTrigger,
    Text,
  } from '@hina-ui/vue'
  import { ArrowDownWideNarrow, ArrowUpNarrowWide } from '@lucide/vue'
  import type { PeoplePageData } from '~~/server/api/pages/people/[id].get'
  import type { PersonListState } from '~/features/person/results'
  import { personWorks, voiceRoles } from '~/features/person/works'

  defineOptions({ name: 'PersonWorks' })
  const props = defineProps<{
    roles: { code: string; label: string; count: number }[]
    total: number
    list: PeoplePageData['list']
    state: PersonListState
    pending: boolean
  }>()
  const emit = defineEmits<{ update: [partial: Partial<PersonListState>] }>()

  const tabs = computed(() => {
    const workRoles = props.roles.filter(role => role.code !== 'VOICE')
    return [
      ...props.roles.filter(role => role.code === 'VOICE'),
      ...(workRoles.length > 1 ? [{ code: 'ALL', label: '全部作品', count: props.total }] : []),
      ...workRoles,
    ]
  })
  const tab = computed({
    get: () => props.state.tab ?? 'ALL',
    set: value => emit('update', { tab: value }),
  })
  const meta = computed(() => props.list.works?.meta ?? props.list.voices?.meta ?? null)
</script>

<template>
  <Stack gap="md">
    <EntrySectionHead id="works" title="作品">
      <template #actions>
        <IconButton
          :label="state.order === 'new' ? '最新的在前' : '最早的在前'"
          variant="ghost"
          tone="neutral"
          size="sm"
          @click="emit('update', { order: state.order === 'new' ? 'old' : 'new' })"
        >
          <ArrowDownWideNarrow v-if="state.order === 'new'" />
          <ArrowUpNarrowWide v-else />
        </IconButton>
      </template>
    </EntrySectionHead>
    <Tabs v-model="tab">
      <TabsList label="按职务">
        <TabsTrigger v-for="item in tabs" :key="item.code" :value="item.code">
          {{ item.label }}
          <Text as="span" size="sm" tone="faint" class="tabular-nums">{{ item.count }}</Text>
        </TabsTrigger>
      </TabsList>
    </Tabs>
    <Stack gap="lg" class="relative">
      <PersonWorksVoices v-if="list.voices" :voices="voiceRoles(list.voices.items)" />
      <PersonWorksList v-else-if="list.works" :works="personWorks(list.works.items)" />
      <Paginator
        v-if="meta && meta.total_pages > 1"
        :meta="meta"
        :loading="pending"
        route="push"
        align="center"
        scroll-target="#works"
      />
      <LoadingOverlay :visible="pending" />
    </Stack>
  </Stack>
</template>
