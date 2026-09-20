<script setup lang="ts">
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
  <section
    class="border-b border-surface-200 bg-surface-0 dark:border-surface-800 dark:bg-surface-950"
  >
    <SpaceHeroBanner :cover="profile.head_cover" />

    <div class="mx-auto max-w-app px-5 pb-7 sm:px-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
        <div class="relative z-10 -mt-14 shrink-0 sm:-mt-18">
          <Avatar
            :user="profile"
            shape="circle"
            class="size-28! bg-surface-100 ring-4 ring-surface-0 sm:size-36! dark:ring-surface-950"
            :pt="{ root: { class: 'shadow-[0_8px_28px_rgba(15,23,42,0.16)]' } }"
          />
        </div>

        <div class="flex min-w-0 flex-1 flex-col gap-2.5 sm:pt-3">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
            <div class="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
              <h1 class="text-2xl font-bold text-surface-950 sm:text-[28px] dark:text-surface-0">
                {{ displayName(profile) }}
              </h1>
              <span v-if="displayName(profile) !== profile.name" class="text-sm text-muted-color">
                @{{ profile.name }}
              </span>
              <Tag v-if="roleLabel" :value="roleLabel" :pt="{ root: { class: 'text-xs!' } }" />
              <UserBadges :user="profile" height="h-6" full />
            </div>

            <SpaceHeroActions
              :profile="profile"
              :is-self="isSelf"
              :setting-to="settingTo"
              variant="inline"
              class="hidden shrink-0 sm:flex"
            />
          </div>

          <p v-if="profile.signature" class="text-sm text-surface-600 dark:text-surface-300">
            {{ profile.signature }}
          </p>

          <SpaceHeroStats :profile="profile" :statistics="statistics" />

          <SpaceHeroActions
            :profile="profile"
            :is-self="isSelf"
            :setting-to="settingTo"
            variant="stacked"
            class="flex pt-1 sm:hidden"
          />
        </div>
      </div>
    </div>
  </section>
</template>
