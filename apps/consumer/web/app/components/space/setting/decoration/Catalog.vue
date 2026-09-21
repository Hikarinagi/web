<script setup lang="ts">
  import { Button, Card, SegmentedControl, SimpleGrid, Stack, Tag, Text } from '@hina-ui/vue'
  import type { ShopDecoration } from '~/features/space/useDecoration'
  import type { CurrentUser } from '~/types/auth'

  defineOptions({ name: 'SpaceSettingDecorationCatalog' })

  const props = defineProps<{
    me: CurrentUser
    frames: ShopDecoration[]
    badges: ShopDecoration[]
    ownedIds: Set<number>
  }>()
  const emit = defineEmits<{ buy: [ShopDecoration] }>()

  const type = ref<'AVATAR_FRAME' | 'BADGE'>('AVATAR_FRAME')
  const CATEGORIES = [
    { key: 'PERMANENT', label: '常驻' },
    { key: 'ACHIEVEMENT', label: '成就' },
    { key: 'LIMITED', label: '限定' },
  ] as const

  const activeItems = computed(() => (type.value === 'AVATAR_FRAME' ? props.frames : props.badges))
  const groups = computed(() =>
    CATEGORIES.map(category => ({
      ...category,
      items: activeItems.value.filter(item => item.category === category.key),
    })).filter(group => group.items.length),
  )

  function acquireHint(item: ShopDecoration) {
    if (item.category === 'ACHIEVEMENT') return '未解锁'
    if (item.category === 'LIMITED') return '限定'
    return '非卖'
  }

  const typeOptions = [
    { label: '头像框', value: 'AVATAR_FRAME' },
    { label: '徽章', value: 'BADGE' },
  ]

  function onType(value: string | number | undefined) {
    if (value === 'AVATAR_FRAME' || value === 'BADGE') type.value = value
  }
</script>

<template>
  <Stack gap="lg">
    <SegmentedControl
      :model-value="type"
      :options="typeOptions"
      size="sm"
      aria-label="装扮类型"
      class="self-start"
      @update:model-value="onType"
    />

    <Stack v-for="group in groups" :key="group.key" gap="sm">
      <Text size="sm" weight="medium" tone="muted">{{ group.label }}</Text>
      <SimpleGrid min="10rem" gap="sm">
        <Card v-for="item in group.items" :key="item.id" :padded="false" class="relative">
          <SpaceSettingDecorationTile :me="me" :decoration="item">
            <template #footer>
              <Tag v-if="ownedIds.has(item.id)" pill>已拥有</Tag>
              <Button
                v-else-if="item.price != null"
                size="sm"
                variant="soft"
                tone="neutral"
                @click="emit('buy', item)"
              >
                <template #icon><HikariPoint aria-hidden="true" /></template>
                {{ item.price }}
              </Button>
              <Tag v-else pill>{{ acquireHint(item) }}</Tag>
            </template>
          </SpaceSettingDecorationTile>
          <SpaceSettingDecorationInfo :decoration="item" class="absolute top-1.5 right-1.5 z-20" />
        </Card>
      </SimpleGrid>
    </Stack>

    <Text v-if="!groups.length" size="sm" tone="muted">还没有上架的装扮</Text>
  </Stack>
</template>
