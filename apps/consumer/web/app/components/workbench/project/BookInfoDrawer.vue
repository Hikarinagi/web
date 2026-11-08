<script setup lang="ts">
  import { Drawer, Skeleton, Stack, toast } from '@hina-ui/vue'
  import { useEntityDrawer } from '~/features/creator/composables/useEntityDrawer'
  import type { BackendChangeRequestDetail } from '~/features/creator/contribution'
  import {
    ENTITY_DRAWER_FOOTER_KEY,
    IN_ENTITY_DRAWER_KEY,
  } from '~/features/creator/editor/relation'

  const props = defineProps<{
    target: { slug: 'light-novel' | 'light-novel-volume' | 'manga'; id: number } | null
  }>()
  const emit = defineEmits<{ close: [] }>()

  const visible = computed({
    get: () => props.target !== null,
    set: value => {
      if (!value) emit('close')
    },
  })

  const { loading, failed, data, mineCr, blocked } = useEntityDrawer(() =>
    props.target
      ? {
          slug: props.target.slug,
          resourceType: (
            {
              'light-novel': 'LIGHT_NOVEL',
              'light-novel-volume': 'LIGHT_NOVEL_VOLUME',
              manga: 'MANGA',
            } as const
          )[props.target.slug],
          id: props.target.id,
        }
      : null,
  )

  const footerHost = useTemplateRef<{ $el: HTMLElement }>('footerHost')
  const footerEl = ref<HTMLElement | null>(null)
  watchEffect(() => {
    footerEl.value = footerHost.value?.$el ?? null
  })
  provide(IN_ENTITY_DRAWER_KEY, true)
  provide(ENTITY_DRAWER_FOOTER_KEY, footerEl)

  function onSubmitted(result: BackendChangeRequestDetail) {
    toast.success(
      result.status === 'MERGED'
        ? '修改已生效'
        : mineCr.value
          ? '已更新变更请求'
          : '已提交，等待审核',
    )
    emit('close')
  }
</script>

<template>
  <Drawer
    v-model:open="visible"
    side="end"
    size="lg"
    :title="data?.resource?.title ?? '编辑书籍信息'"
    class="sm:w-136"
  >
    <template #content>
      <Stack v-if="loading" gap="md">
        <Skeleton v-for="n in 6" :key="n" as="div" class="h-14 rounded-lg" />
      </Stack>

      <CreatorEmpty v-else-if="failed" text="加载失败。关闭该面板并重试。" />

      <CreatorEditorBlockedCard
        v-else-if="blocked && data?.openCr"
        :change-request-id="data.openCr.id"
      />

      <CreatorEditorEntityForm
        v-else-if="data && target"
        :key="`${target.slug}:${target.id}`"
        :slug="target.slug"
        :resource-id="target.id"
        :schema="data.schema"
        :snapshot="data.snapshot"
        :refs="data.refs"
        :open-change-request="mineCr"
        @submitted="onSubmitted"
      />
    </template>

    <template v-if="data && target && !blocked" #footer>
      <Stack ref="footerHost" class="w-full" />
    </template>
  </Drawer>
</template>
