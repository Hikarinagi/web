<script setup lang="ts">
  import type { components } from '@hikarinagi/api-contract/v3'

  defineOptions({ name: 'DecorationDetailContent' })

  const props = defineProps<{ decoration: components['schemas']['DecorationDto'] }>()

  const auth = useAuthStore()
  const isFrame = computed(() => props.decoration.type === 'AVATAR_FRAME')
  const acquire = computed(
    () =>
      props.decoration.unlock_description || (props.decoration.price != null ? '购买获得' : null),
  )
  const previewUser = computed(() => ({
    id: auth.user?.id ?? 0,
    name: auth.user?.name ?? '',
    avatar: auth.user?.avatar ?? null,
    equipped_frame: isFrame.value
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
  <div class="flex flex-col gap-4">
    <div class="flex flex-col items-center gap-2">
      <div v-if="isFrame" class="grid size-36 shrink-0 place-items-center">
        <Avatar :user="previewUser" shape="circle" class="size-24!" />
      </div>
      <HikariImage
        v-else
        :src="decoration.image.src"
        alt=""
        :preview="false"
        image-class="h-full w-auto object-contain"
        class="inline-block h-12 w-auto max-w-full"
      />
      <p v-if="decoration.description" class="text-center text-sm text-muted-color">
        {{ decoration.description }}
      </p>
    </div>

    <p v-if="decoration.lore" class="text-[15px] leading-7 whitespace-pre-wrap text-color">
      {{ decoration.lore }}
    </p>

    <div v-if="acquire" class="rounded-xl p-3 bg-emphasis">
      <p class="text-xs font-medium text-muted-color">获取方式</p>
      <p class="mt-1 text-color">{{ acquire }}</p>
    </div>
  </div>
</template>
