<script setup lang="ts">
  import { Panel, Stack } from '@hina-ui/vue'
  import { useDecoration, type DecorationData } from '~/features/space/useDecoration'
  import type { CurrentUser } from '~/types/auth'

  defineOptions({ name: 'SpaceSettingDecorationPanel' })

  const props = defineProps<{
    me: CurrentUser
    data: DecorationData | null
    refresh: () => Promise<unknown>
  }>()

  const {
    points,
    ownedFrames,
    ownedBadges,
    catalogFrames,
    catalogBadges,
    ownedIds,
    selectedFrameId,
    selectedFrame,
    selectedBadgeIds,
    selectedBadges,
    equippingFrame,
    equippingBadges,
    badgeLimit,
    equipFrame,
    toggleBadge,
    purchase,
  } = useDecoration(() => props.data, props.refresh)
</script>

<template>
  <Stack gap="lg">
    <SpaceSettingDecorationPreview
      :me="me"
      :frame="selectedFrame"
      :badges="selectedBadges"
      :points="points"
    />

    <Panel title="头像框">
      <SpaceSettingDecorationOwnedGrid
        :me="me"
        :items="ownedFrames"
        :selected-id="selectedFrameId"
        :equipping="equippingFrame"
        @equip="equipFrame"
      />
    </Panel>

    <Panel
      title="徽章"
      :description="`最多同时佩戴 ${badgeLimit} 枚（已佩戴 ${selectedBadgeIds.length} / ${badgeLimit}）`"
    >
      <SpaceSettingDecorationBadgeGrid
        :me="me"
        :items="ownedBadges"
        :selected-ids="selectedBadgeIds"
        :equipping="equippingBadges"
        :limit="badgeLimit"
        @toggle="toggleBadge"
      />
    </Panel>

    <Panel title="装扮图鉴">
      <SpaceSettingDecorationCatalog
        :me="me"
        :frames="catalogFrames"
        :badges="catalogBadges"
        :owned-ids="ownedIds"
        @buy="purchase"
      />
    </Panel>
  </Stack>
</template>
