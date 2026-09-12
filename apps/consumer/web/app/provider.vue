<script setup lang="ts">
  import { darkTheme, pastelTheme } from 'notivue'
  import type { NotivueProps, NotivueTheme } from 'notivue'

  defineOptions({
    name: 'HikariProvider',
  })

  const colorMode = useColorMode()
  const notivueStyles = {
    list: {
      zIndex: 11000,
    },
    itemContainer: {
      minWidth: '250px',
    },
  } satisfies NonNullable<NotivueProps['styles']>
  const notivueTheme = computed<NotivueTheme>(() =>
    colorMode.value === 'dark' ? darkTheme : pastelTheme,
  )
</script>

<template>
  <NuxtRouteAnnouncer />
  <Notivue v-slot="item" :styles="notivueStyles">
    <NotificationsDmToast v-if="item.props?.kind === 'dm'" :item="item" />
    <NotificationsCheckInRewardToast
      v-else-if="item.props?.kind === 'check-in-reward'"
      :item="item"
    />
    <NotificationsCheckInMakeUpToast
      v-else-if="item.props?.kind === 'check-in-make-up'"
      :item="item"
    />
    <NotificationsCheckInLoadingToast
      v-else-if="item.props?.kind === 'check-in-loading'"
      :item="item"
    />
    <Notification v-else :item="item" :theme="notivueTheme" class="hn-scrollbar-safe" />
  </Notivue>
  <ConfirmDialog />
  <ConfirmHost />
  <PurchaseDialog />
  <DecorationDetailDialog />
  <AuthLogoutDialog />
  <AuthNicknamePrompt />
  <AuthUsernamePrompt />
  <UserCardHost />
  <WorkCardHost />
  <NotificationsDetailDrawer />
  <EmojiDrawer />
  <FeedComposeFab />
  <FeedComposerDialog />
  <PollEditDialog />
  <CheckinDialog />
  <HikariPointsLedgerDialog />
  <LayoutFloatingToolbar />
  <LayoutTooltipHost />
</template>
