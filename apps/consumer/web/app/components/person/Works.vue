<script setup lang="ts">
  import { IconButton, Stack, Tabs, TabsContent, TabsList, TabsTrigger, Text } from '@hina-ui/vue'
  import { ArrowDownWideNarrow, ArrowUpNarrowWide } from '@lucide/vue'
  import type { PersonWork, VoiceRole } from '~/features/person/works'

  defineOptions({ name: 'PersonWorks' })
  const props = defineProps<{
    works: PersonWork[]
    voices: VoiceRole[]
    roles: { code: string; label: string; count: number }[]
  }>()
  const tab = defineModel<string>({ required: true })
  const descending = ref(true)

  const tabs = computed(() => {
    const workRoles = props.roles.filter(role => role.code !== 'VOICE')
    return [
      ...props.roles.filter(role => role.code === 'VOICE'),
      ...(workRoles.length > 1
        ? [{ code: 'ALL', label: '全部作品', count: props.works.length }]
        : []),
      ...workRoles,
    ]
  })
  const listed = computed(() => {
    const works =
      tab.value === 'ALL' ? props.works : props.works.filter(work => work.roles.includes(tab.value))
    return descending.value ? works : [...works].reverse()
  })
</script>

<template>
  <Stack gap="md">
    <EntrySectionHead id="works" title="作品">
      <template #actions>
        <IconButton
          :label="descending ? '最新的在前' : '最早的在前'"
          variant="ghost"
          tone="neutral"
          size="sm"
          @click="descending = !descending"
        >
          <ArrowDownWideNarrow v-if="descending" />
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
      <TabsContent v-for="item in tabs" :key="item.code" :value="item.code" class="pt-4">
        <PersonWorksVoices v-if="item.code === 'VOICE'" :voices="voices" :descending="descending" />
        <PersonWorksList v-else :works="listed" />
      </TabsContent>
    </Tabs>
  </Stack>
</template>
