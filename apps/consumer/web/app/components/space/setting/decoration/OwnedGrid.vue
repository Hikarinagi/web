<script setup lang="ts">
  import { Card, Center, Flex, Ripple, SimpleGrid, Stack, Text } from '@hina-ui/vue'
  import { Check } from '@lucide/vue'
  import type { OwnedDecoration } from '~/features/space/useDecoration'
  import type { CurrentUser } from '~/types/auth'

  defineOptions({ name: 'SpaceSettingDecorationOwnedGrid' })

  defineProps<{
    me: CurrentUser
    items: OwnedDecoration[]
    selectedId: number | null
    equipping: boolean
  }>()
  const emit = defineEmits<{ equip: [number | null] }>()

  function tileClass(selected: boolean) {
    return cn(
      'hn-state-layer w-full hn-interactive text-start hn-press-lg disabled:opacity-60',
      selected && 'border-accent bg-accent-soft',
    )
  }
</script>

<template>
  <Stack gap="sm">
    <SimpleGrid min="10rem" gap="sm">
      <Card
        as="button"
        :padded="false"
        :disabled="equipping"
        :class="tileClass(selectedId === null)"
        @click="emit('equip', null)"
      >
        <Ripple :disabled="equipping" />
        <Center
          v-if="selectedId === null"
          inline
          as="span"
          class="absolute top-1.5 left-1.5 z-10 size-4 rounded-full bg-accent text-accent-on"
        >
          <Check :size="11" :stroke-width="3" />
        </Center>
        <SpaceSettingDecorationTile :me="me" :decoration="null" />
      </Card>

      <Flex v-for="item in items" :key="item.id" class="relative">
        <Card
          as="button"
          :padded="false"
          :disabled="equipping"
          :class="tileClass(selectedId === item.id)"
          @click="emit('equip', item.id)"
        >
          <Ripple :disabled="equipping" />
          <Center
            v-if="selectedId === item.id"
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

    <Text v-if="!items.length" size="sm" tone="muted">还没有头像框</Text>
  </Stack>
</template>
