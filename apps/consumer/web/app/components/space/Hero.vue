<script setup lang="ts">
  import { Flex, Heading, Inline, Stack, Tag, Text } from '@hina-ui/vue'
  import type { SpacePageData } from '~~/server/api/pages/space/[id].get'
  import { displayName } from '~/utils/user'

  defineOptions({ name: 'SpaceHero' })

  const props = defineProps<{
    profile: SpacePageData['profile']
    statistics: SpacePageData['statistics']
    isSelf: boolean
  }>()

  const roleLabel = computed(() =>
    props.profile.role !== 'USER' ? getUserRoleLabel(props.profile.role) : null,
  )
  const settingTo = '/setting'
</script>

<template>
  <Stack as="section" gap="none" class="border-b border-line bg-surface">
    <SpaceHeroBanner :cover="profile.head_cover" />

    <Stack gap="none" class="mx-auto w-full max-w-app px-5 pb-7 sm:px-6">
      <Stack gap="md" class="sm:flex-row sm:items-start sm:gap-6">
        <Flex class="relative z-10 -mt-14 shrink-0 sm:-mt-18">
          <Avatar
            :user="profile"
            class="size-28! bg-inset shadow-lg ring-4 ring-surface sm:size-36!"
          />
        </Flex>

        <Stack gap="sm" class="min-w-0 flex-1 sm:pt-3">
          <Stack gap="sm" class="sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <Inline gap="sm" class="min-w-0">
              <Heading :level="1" class="sm:text-3xl">{{ displayName(profile) }}</Heading>
              <Text v-if="displayName(profile) !== profile.name" as="span" size="sm" tone="muted">
                @{{ profile.name }}
              </Text>
              <Tag v-if="roleLabel">{{ roleLabel }}</Tag>
              <UserBadges :user="profile" height="h-6" full />
            </Inline>

            <SpaceHeroActions
              :profile="profile"
              :is-self="isSelf"
              :setting-to="settingTo"
              variant="inline"
              class="hidden shrink-0 sm:flex"
            />
          </Stack>

          <Text v-if="profile.signature" size="sm" tone="muted">{{ profile.signature }}</Text>

          <SpaceHeroStats :profile="profile" :statistics="statistics" />

          <SpaceHeroActions
            :profile="profile"
            :is-self="isSelf"
            :setting-to="settingTo"
            variant="stacked"
            class="flex pt-1 sm:hidden"
          />
        </Stack>
      </Stack>
    </Stack>
  </Stack>
</template>
