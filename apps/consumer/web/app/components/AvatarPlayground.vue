<script setup lang="ts">
  import { UserRound } from '@lucide/vue'

  const avatarObjectKey = 'user/avatar/missing-avatar.webp'
  const avatarRemote = 'https://lain.bgm.tv/pic/user/l/icon.jpg'
  const users = {
    currentLike: {
      id: 1,
      name: 'Hikari',
      avatar: { src: avatarObjectKey },
    },
    publicLike: {
      id: 2,
      name: 'Yuki',
      avatar: null,
    },
  }
</script>

<template>
  <div class="space-y-8 py-10">
    <header class="space-y-2">
      <p class="text-sm font-medium text-muted-color">Hikarinagi UI</p>
      <h1 class="text-3xl font-semibold tracking-normal text-color">Avatar Playground</h1>
    </header>

    <section class="space-y-4">
      <h2 class="text-base font-semibold text-color">Image</h2>
      <div class="flex flex-wrap items-center gap-4">
        <Avatar :image="avatarObjectKey" aria-label="Object key avatar" shape="circle" />
        <Avatar
          :image="avatarRemote"
          aria-label="Third party avatar"
          shape="circle"
          :processing="{ width: 200, height: 200, fit: 'cover', quality: 90 }"
        />
        <Avatar
          image="missing/avatar.webp"
          aria-label="Default avatar fallback"
          shape="circle"
          size="large"
        />
        <Avatar
          image="missing/square-avatar.webp"
          aria-label="Custom fallback style"
          size="xlarge"
          fallback-image-class="object-contain p-2"
        />
      </div>
    </section>

    <section class="space-y-4">
      <h2 class="text-base font-semibold text-color">User Data</h2>
      <div class="flex flex-wrap items-center gap-4">
        <Avatar :user="users.currentLike" shape="circle" />
        <Avatar :user="users.publicLike" shape="circle" size="large" />
      </div>
    </section>

    <section class="space-y-4">
      <h2 class="text-base font-semibold text-color">PrimeVue Modes</h2>
      <div class="flex flex-wrap items-center gap-4">
        <Avatar label="H" shape="circle" />
        <Avatar label="YK" size="large" />
        <Avatar icon="pi pi-user" shape="circle" size="large" />
        <Avatar shape="circle" size="xlarge">
          <template #icon>
            <UserRound class="size-6" aria-hidden="true" />
          </template>
        </Avatar>
      </div>
    </section>
  </div>
</template>
