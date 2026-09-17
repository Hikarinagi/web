<script setup lang="ts">
  import { Sidebar } from '@hina-ui/vue'
  import logoUrl from '~/assets/images/creator-wordmark.svg'

  defineOptions({ name: 'CreatorShellSidebar' })
</script>

<template>
  <Sidebar label="创作者中心导航">
    <template #wordmark>
      <NuxtLink to="/create" class="flex items-center" aria-label="创作者中心">
        <HikariImage
          :src="logoUrl"
          alt="Hikarinagi 创作者中心"
          class="h-8"
          image-class="object-contain object-left pl-2"
          :lazy="false"
          :skeleton="false"
          :preload="{ fetchPriority: 'high' }"
        />
      </NuxtLink>
    </template>

    <CreatorShellSidebarNav />

    <template #footer="{ state }">
      <CreatorShellSidebarUser :state="state" />
    </template>
  </Sidebar>
</template>
