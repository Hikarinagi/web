<script setup lang="ts">
  import { Card, Center, Flex, Ripple, SimpleGrid, Text } from '@hina-ui/vue'
  import { Check } from '@lucide/vue'
  import type { OwnedDecoration } from '~/features/space/useDecoration'
  import type { CurrentUser } from '~/types/auth'

  defineOptions({ name: 'SpaceSettingDecorationBadgeGrid' })

  const props = defineProps<{
    me: CurrentUser
    items: OwnedDecoration[]
    selectedIds: number[]
    equipping: boolean
    limit: number
  }>()
  const emit = defineEmits<{ toggle: [number] }>()

  const selected = computed(() => new Set(props.selectedIds))
  const atLimit = computed(() => props.selectedIds.length >= props.limit)

  function tileClass(active: boolean) {
    return cn(
      'hn-state-layer w-full hn-interactive text-start hn-press-lg disabled:opacity-50',
      active && 'border-accent bg-accent-soft',
    )
  }
</script>

<template>
  <SimpleGrid v-if="items.length" min="10rem" gap="sm">
    <Flex v-for="item in items" :key="item.id" class="relative">
      <Card
        as="button"
        :padded="false"
        :disabled="equipping || (atLimit && !selected.has(item.id))"
        :class="tileClass(selected.has(item.id))"
        @click="emit('toggle', item.id)"
      >
        <Ripple :disabled="equipping" />
        <Center
          v-if="selected.has(item.id)"
          inline
          as="span"
          class="absolute top-1.5 left-1.5 z-10 size-4 rounded-full bg-accent text-accent-on"
        >
          <Check :size="11" :stroke-width="3" />
        </Center>
        <SpaceSettingDecorationTile :me="me" :decoration="item" />
      </Card>
      <SpaceSettingDecorationInfo :decoration="item" class="absolute top-1.5 right-1.5 z-20" />
    </Flex>
  </SimpleGrid>

  <Text v-else size="sm" tone="muted">还没有徽章</Text>
</template>
