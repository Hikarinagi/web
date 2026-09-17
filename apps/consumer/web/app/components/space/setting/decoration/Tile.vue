<script setup lang="ts">
  import { Center, Stack, Text } from '@hina-ui/vue'
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
  <Stack gap="sm" align="center" class="p-3">
    <Avatar v-if="isFrame" :user="previewUser" class="size-16!" />
    <Center v-else class="h-16 w-full">
      <HikariImage
        :src="decoration?.image.src"
        alt=""
        :preview="false"
        image-class="h-full w-full object-contain"
        class="h-14 w-full"
      />
    </Center>
    <Stack gap="none" class="w-full text-center">
      <Text size="sm" weight="medium" class="line-clamp-1">
        {{ decoration?.name ?? '不佩戴' }}
      </Text>
      <Text size="xs" tone="muted" class="mt-0.5 line-clamp-2 h-8 leading-4">
        {{ decoration?.description }}
      </Text>
    </Stack>
    <slot name="footer" />
  </Stack>
</template>
