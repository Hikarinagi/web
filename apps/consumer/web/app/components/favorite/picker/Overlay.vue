<script setup lang="ts">
  import { Popover, Sheet, toast } from '@hina-ui/vue'
  import type { FavoriteEntityType } from '~/features/favorite/entity'

  defineOptions({ name: 'FavoritePickerOverlay' })

  const props = withDefaults(
    defineProps<{ type: FavoriteEntityType; id: number; pickerTitle?: string }>(),
    { pickerTitle: undefined },
  )

  const narrow = useNarrow()
  const anchor = shallowRef<HTMLElement | null>(null)
  const popoverOpen = ref(false)
  const sheetOpen = ref(false)
  const createOpen = ref(false)
  const sessionKey = ref(0)

  const heading = computed(() => props.pickerTitle ?? '收藏到收藏夹')

  function open(event: Event) {
    sessionKey.value += 1
    if (narrow.value) {
      sheetOpen.value = true
      return
    }
    anchor.value = (event.currentTarget ?? event.target) as HTMLElement
    popoverOpen.value = true
  }

  function close() {
    sheetOpen.value = false
    popoverOpen.value = false
  }

  function onCreated() {
    toast.success('已新建并收藏')
  }

  defineExpose({ open })
</script>

<template>
  <Sheet v-if="narrow" v-model:open="sheetOpen" :title="heading" class="h-[60dvh]">
    <template #body>
      <FavoriteCollectionPanel
        :id="id"
        :key="sessionKey"
        :type="type"
        :heading="heading"
        show-done
        @create="createOpen = true"
        @done="close"
      />
    </template>
  </Sheet>

  <Popover
    v-else
    v-model:open="popoverOpen"
    :anchor="anchor"
    :padded="false"
    align="end"
    class="w-90"
  >
    <template #content>
      <FavoriteCollectionPanel
        :id="id"
        :key="sessionKey"
        :type="type"
        :heading="heading"
        class="max-h-96"
        @create="createOpen = true"
      />
    </template>
  </Popover>

  <FavoriteCollectionCreateDialog
    v-model:visible="createOpen"
    :type="type"
    :id="id"
    @created="onCreated"
  />
</template>
