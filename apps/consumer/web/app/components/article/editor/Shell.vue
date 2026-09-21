<script setup lang="ts">
  import { Alert, Button, Center, Dialog, Divider, Inline, Input, Stack, Text } from '@hina-ui/vue'
  import { ImagePlus, Star } from '@lucide/vue'
  import { useArticleEditor, type ArticleReviewContext } from './composables/useArticleEditor'

  defineOptions({ name: 'ArticleEditorShell' })

  const props = defineProps<{
    articleId: number | null
    reviewContext?: ArticleReviewContext
  }>()
  const articleId = ref(props.articleId)
  const host = useArticleEditor(articleId, props.reviewContext)
  const {
    editor,
    plugins,
    pluginContext,
    title,
    cover,
    charCount,
    saveState,
    savedAt,
    publishing,
    canPublish,
    isReview,
    reviewWorkTitle,
    openCoverLibrary,
    removeCover,
  } = host

  const publishOpen = ref(false)
  const editingPublishedArticle = ref(false)

  async function onRestore(id: number) {
    try {
      const detail = await hikariRequest('/api/v3/articles/{id}', {
        path: { id },
        query: { preview: true },
      })
      await host.load(detail)
      editingPublishedArticle.value = detail.status === 'PUBLISHED'
    } catch {
      /* empty */
    }
  }

  if (props.articleId !== null) {
    const stopInitialLoad = watch(
      editor,
      ed => {
        if (!ed) return
        stopInitialLoad()
        void onRestore(props.articleId as number)
      },
      { immediate: true },
    )
  }

  const router = useRouter()
  const leavePromptOpen = ref(false)
  let pendingPath: string | null = null
  let confirmedLeave = false
  function isEmptyDraft() {
    return props.articleId === null && articleId.value !== null && !host.hasContent.value
  }
  onBeforeRouteLeave(to => {
    if (confirmedLeave || !isEmptyDraft()) return true
    pendingPath = to.fullPath
    leavePromptOpen.value = true
    return false
  })
  function leaveTo() {
    confirmedLeave = true
    leavePromptOpen.value = false
    if (pendingPath) void router.push(pendingPath)
  }
  async function discardDraft() {
    leavePromptOpen.value = false
    await host.discard()
    leaveTo()
  }
</script>

<template>
  <Stack gap="none" class="min-h-[calc(100vh-var(--app-header-height))]">
    <Stack
      gap="none"
      class="sticky top-(--app-header-height) z-20 border-b border-line bg-surface/85 shadow-xs backdrop-blur-xl"
    >
      <Center>
        <HikariEditorToolbar :editor="editor" :items="plugins" :context="pluginContext" />
      </Center>
    </Stack>

    <Stack
      gap="none"
      class="article-canvas mx-auto w-150 max-w-full flex-1 px-4 pt-8 pb-28 sm:px-0"
    >
      <Alert v-model:open="editingPublishedArticle" tone="warning" class="mb-5">
        这篇文章是从已发布状态进入编辑的。任何修改都会自动转为草稿，需要重新提交后才会再次公开。
      </Alert>

      <Inline
        v-if="isReview"
        gap="none"
        align="center"
        :wrap="false"
        class="mb-4 w-fit gap-1.5 rounded-lg border border-line px-3 py-1.5"
      >
        <Star class="size-3.5 fill-warning text-warning" />
        <Text v-if="reviewWorkTitle" as="span" size="xs">
          正在为「{{ reviewWorkTitle }}」写长评
        </Text>
        <Text v-else as="span" size="xs" tone="muted">这是一篇长评 · 已关联你的评分</Text>
      </Inline>

      <Stack
        v-if="cover"
        gap="none"
        class="group/cover relative overflow-hidden rounded-xl border border-line"
      >
        <HikariImage
          :src="cover.src"
          alt=""
          class="aspect-2/1 w-full"
          image-class="size-full object-cover"
          :processing="{ q: 85 }"
        />
        <Inline
          gap="sm"
          :wrap="false"
          class="absolute top-3 right-3 opacity-100 transition-opacity md:opacity-0 md:group-hover/cover:opacity-100 md:focus-within:opacity-100"
        >
          <Button variant="solid" tone="neutral" size="sm" @click="openCoverLibrary">
            更换封面
          </Button>
          <Button variant="solid" tone="neutral" size="sm" @click="removeCover">移除</Button>
        </Inline>
      </Stack>
      <Button
        v-else
        variant="outline"
        tone="neutral"
        size="sm"
        class="w-fit border-dashed"
        @click="openCoverLibrary"
      >
        <template #icon><ImagePlus /></template>
        添加封面
      </Button>

      <Input
        v-model="title"
        variant="bare"
        autofocus
        maxlength="200"
        placeholder="标题"
        class="mt-5 h-auto text-4xl leading-tight font-bold [--hn-input-px:0]"
      />

      <HikariEditor v-if="editor" :editor="editor" class="mt-4" />
    </Stack>

    <Stack
      gap="none"
      class="sticky bottom-0 z-20 border-t border-line bg-surface/85 backdrop-blur-xl"
    >
      <Inline
        gap="none"
        align="center"
        justify="between"
        :wrap="false"
        class="mx-auto w-150 max-w-full gap-3 px-4 py-3 sm:px-0"
      >
        <Inline gap="none" align="center" :wrap="false" class="gap-3">
          <Inline gap="sm" align="center" :wrap="false">
            <ArticleEditorSaveState :state="saveState" :saved-at="savedAt" />
            <Text as="span" size="xs" tone="muted" class="min-w-14 tabular-nums">
              {{ charCount }} 字
            </Text>
          </Inline>
          <Divider orientation="vertical" class="h-4" />
          <HikariEditorUndoRedo :editor="editor" />
        </Inline>
        <Button size="sm" :loading="publishing" :disabled="!canPublish" @click="publishOpen = true">
          发布
        </Button>
      </Inline>
    </Stack>

    <HikariEditorBubbleMenu :editor="editor" :items="plugins" :context="pluginContext" />
    <HikariEditorBlockHandle :editor="editor" />
    <HikariEditorTableControls :editor="editor" />
    <HikariEditorOverlayHost :plugins="plugins" />
    <ArticleEditorPublishDialog v-model:visible="publishOpen" :host="host" />
    <ArticleEditorDraftChooser v-if="props.articleId === null && !isReview" @restore="onRestore" />

    <Dialog v-model:open="leavePromptOpen" title="空白草稿" size="sm">
      <template #content>
        <Text tone="muted">要保存此草稿吗？</Text>
      </template>
      <template #footer>
        <Button variant="ghost" tone="neutral" @click="leaveTo">保留</Button>
        <Button tone="danger" @click="discardDraft">删除草稿</Button>
      </template>
    </Dialog>
  </Stack>
</template>
