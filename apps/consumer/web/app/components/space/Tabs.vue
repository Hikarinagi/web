<script setup lang="ts">
  import { Tabs, TabsList, TabsTrigger } from '@hina-ui/vue'
  import { SPACE_TABS, type SpaceTabKey } from '~/features/space/space'

  defineOptions({ name: 'SpaceTabs' })

  const active = defineModel<SpaceTabKey>({ required: true })
  const props = defineProps<{ isSelf?: boolean }>()

  const visibleTabs = computed(() =>
    SPACE_TABS.filter(tab => {
      if ('selfOnly' in tab && tab.selfOnly) return props.isSelf
      if ('selfHidden' in tab && tab.selfHidden) return !props.isSelf
      return true
    }),
  )

  function onSelect(value: string | undefined) {
    const next = visibleTabs.value.find(tab => tab.key === value)
    if (next) active.value = next.key
  }
</script>

<template>
  <Tabs :model-value="active" @update:model-value="onSelect">
    <TabsList label="主页内容">
      <TabsTrigger v-for="tab in visibleTabs" :key="tab.key" :value="tab.key">
        {{ tab.label }}
      </TabsTrigger>
    </TabsList>
  </Tabs>
</template>
