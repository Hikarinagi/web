<script setup lang="ts">
  import { Package, Trash2 } from '@lucide/vue'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import { useMerchRemove } from '~/features/galgame/useMerchMutations'

  defineOptions({ name: 'GalgameDerivativesMerchandiseCard' })
  const props = defineProps<{ item: GalgamePageData['merchs'][number] }>()

  const auth = useAuthStore()
  const { removing, confirmRemove } = useMerchRemove()

  const canRemove = computed(() => {
    const role = auth.user?.role
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') return true
    return props.item.creator?.id != null && auth.user?.id === props.item.creator.id
  })
</script>

<template>
  <div class="group flex min-w-0 flex-col gap-2">
    <div
      class="relative aspect-square overflow-hidden rounded-lg border border-surface-200 bg-surface-100 dark:border-surface-800 dark:bg-surface-800"
    >
      <HikariImage
        :src="item.image?.src"
        :alt="item.name"
        preset="small"
        class="size-full"
        image-class="size-full object-cover"
      >
        <template #empty>
          <div class="flex size-full items-center justify-center">
            <Package :size="24" class="text-muted-color opacity-50" />
          </div>
        </template>
        <template #error><span /></template>
      </HikariImage>
      <span
        v-if="item.category"
        class="absolute top-1.5 left-1.5 rounded bg-surface-900/75 px-1.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm"
      >
        {{ item.category }}
      </span>
      <div v-if="canRemove" class="absolute top-1.5 right-1.5">
        <Button
          v-tooltip.top="'删除'"
          unstyled
          :disabled="removing"
          class="flex size-6 items-center justify-center rounded-full bg-surface-900/60 text-white opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
          @click="confirmRemove(item)"
        >
          <template #icon>
            <Trash2 :size="13" />
          </template>
        </Button>
      </div>
    </div>
    <div class="flex flex-col gap-0.5">
      <p class="truncate text-sm font-medium text-surface-900 dark:text-surface-100">
        {{ item.name }}
      </p>
      <p
        v-if="item.description"
        class="line-clamp-2 text-xs text-surface-500 dark:text-surface-400"
      >
        {{ item.description }}
      </p>
    </div>
  </div>
</template>
