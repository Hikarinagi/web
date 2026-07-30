<script setup lang="ts">
  import type { ShopDecoration } from '~/features/space/useDecoration'
  import type { CurrentUser } from '~/types/auth'

  defineOptions({ name: 'SpaceSettingDecorationTile' })

  const props = defineProps<{ me: CurrentUser; decoration: ShopDecoration | null }>()

  const isFrame = computed(() => !props.decoration || props.decoration.type === 'AVATAR_FRAME')

  const previewUser = computed(() => ({
    id: props.me.id,
    name: props.me.name,
    avatar: props.me.avatar,
    equipped_frame:
      props.decoration && props.decoration.type === 'AVATAR_FRAME'
        ? {
            id: props.decoration.id,
            key: props.decoration.key,
            name: props.decoration.name,
            scale: props.decoration.scale,
            image: props.decoration.image,
          }
        : null,
  }))
</script>

<template>
  <div class="flex flex-col items-center gap-2 px-3 py-3">
    <Avatar v-if="isFrame" :user="previewUser" shape="circle" class="size-16!" />
    <div v-else class="flex h-16 w-full items-center justify-center">
      <HikariImage
        :src="decoration?.image.src"
        alt=""
        :preview="false"
        image-class="h-full w-full object-contain"
        class="h-14 w-full"
      />
    </div>
    <div class="w-full text-center">
      <p class="line-clamp-1 text-sm font-medium text-color">{{ decoration?.name ?? '不佩戴' }}</p>
      <p class="mt-0.5 line-clamp-2 h-8 text-xs leading-4 text-muted-color">
        {{ decoration?.description }}
      </p>
    </div>
    <slot name="footer" />
  </div>
</template>
