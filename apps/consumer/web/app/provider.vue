<script setup lang="ts">
  import { Toaster } from '@hina-ui/vue'

  defineOptions({
    name: 'HikariProvider',
  })
</script>

<template>
  <NuxtRouteAnnouncer />
  <Toaster class="hn-scrollbar-safe" />
  <ConfirmHost />
  <AuthLoginPrompt />
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
</template>
