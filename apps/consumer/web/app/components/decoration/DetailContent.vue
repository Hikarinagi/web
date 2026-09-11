<script setup lang="ts">
  import { Center, Stack, Text } from '@hina-ui/vue'
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
  <Stack gap="md">
    <Stack gap="sm" align="center">
      <Center v-if="isFrame" class="size-36 shrink-0">
        <Avatar :user="previewUser" shape="circle" class="size-24!" />
      </Center>
      <HikariImage
        v-else
        :src="decoration.image.src"
        alt=""
        :preview="false"
        image-class="h-full w-auto object-contain"
        class="inline-block h-12 w-auto max-w-full"
      />
      <Text v-if="decoration.description" size="sm" tone="muted" class="text-center">
        {{ decoration.description }}
      </Text>
    </Stack>

    <Text v-if="decoration.lore" class="whitespace-pre-wrap">{{ decoration.lore }}</Text>

    <Stack v-if="acquire" gap="xs" class="rounded-xl bg-subtle p-3">
      <Text as="span" size="xs" weight="medium" tone="muted">获取方式</Text>
      <Text as="span">{{ acquire }}</Text>
    </Stack>
  </Stack>
</template>
