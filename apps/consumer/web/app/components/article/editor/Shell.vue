<script setup lang="ts">
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
  <div class="flex min-h-[calc(100vh-4rem)] flex-col">
    <div
      class="sticky top-(--app-header-height) z-20 border-b border-surface-200/75 bg-surface-0/85 shadow-[0_2px_5px_rgba(15,23,42,0.04)] backdrop-blur-xl dark:border-surface-800/75 dark:bg-surface-950/80"
      :style="{ '--editor-toolbar-bg': 'transparent', '--editor-toolbar-border': 'transparent' }"
    >
      <div class="flex justify-center px-4">
        <HikariEditorToolbar :editor="editor" :items="plugins" :context="pluginContext" />
      </div>
    </div>

    <div class="article-canvas mx-auto w-[600px] max-w-full flex-1 px-4 pt-8 pb-28 sm:px-0">
      <Message v-if="editingPublishedArticle" severity="warn" :closable="false" class="mb-5">
        这篇文章是从已发布状态进入编辑的。任何修改都会自动转为草稿，需要重新提交后才会再次公开。
      </Message>

      <div
        v-if="isReview"
        class="mb-4 flex w-fit items-center gap-1.5 rounded-lg border border-surface px-3 py-1.5 text-[13px] text-muted-color"
      >
        <Star class="size-3.5 fill-amber-400 text-amber-400" />
        <span v-if="reviewWorkTitle" class="text-color">正在为「{{ reviewWorkTitle }}」写长评</span>
        <span v-else>这是一篇长评 · 已关联你的评分</span>
      </div>

      <div
        v-if="cover"
        class="group/cover relative overflow-hidden rounded-xl border border-surface-200 dark:border-surface-800"
      >
        <HikariImage
          :src="cover.src"
          alt=""
          class="aspect-2/1 w-full"
          image-class="size-full object-cover"
          :processing="{ q: 85 }"
        />
        <div
          class="absolute top-3 right-3 flex gap-2 opacity-100 transition-opacity md:opacity-0 md:group-hover/cover:opacity-100 md:focus-within:opacity-100"
        >
          <Button
            unstyled
            class="cursor-pointer rounded-lg bg-surface-900/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur transition-colors hover:bg-surface-900/70"
            @click="openCoverLibrary"
          >
            更换封面
          </Button>
          <Button
            unstyled
            class="cursor-pointer rounded-lg bg-surface-900/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur transition-colors hover:bg-surface-900/70"
            @click="removeCover"
          >
            移除
          </Button>
        </div>
      </div>
      <Button
        v-else
        unstyled
        class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-surface-300 px-3 py-1.5 text-sm text-muted-color transition-colors hover:border-primary-400 hover:text-primary-600 dark:border-surface-600"
        @click="openCoverLibrary"
      >
        <ImagePlus :size="17" />
        <span>添加封面</span>
      </Button>

      <InputText
        v-model="title"
        unstyled
        autofocus
        maxlength="200"
        placeholder="标题"
        class="mt-5 w-full border-0 bg-transparent text-4xl leading-tight font-bold text-color outline-none placeholder:text-(--editor-placeholder-color)"
      />

      <HikariEditor v-if="editor" :editor="editor" class="mt-4" />
    </div>

    <div
      class="sticky bottom-0 z-20 border-t border-surface-200/75 bg-surface-0/85 backdrop-blur-xl dark:border-surface-800/75 dark:bg-surface-950/80"
    >
      <div
        class="mx-auto flex w-[600px] max-w-full items-center justify-between gap-3 px-4 py-3 sm:px-0"
      >
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 text-xs text-muted-color">
            <ArticleEditorSaveState :state="saveState" :saved-at="savedAt" />
            <span class="min-w-14 tabular-nums">{{ charCount }} 字</span>
          </div>
          <div class="h-4 w-px bg-surface-200 dark:bg-surface-700" />
          <HikariEditorUndoRedo :editor="editor" />
        </div>
        <Button
          label="发布"
          size="small"
          :loading="publishing"
          :disabled="!canPublish"
          @click="publishOpen = true"
        />
      </div>
    </div>

    <HikariEditorBubbleMenu :editor="editor" :items="plugins" :context="pluginContext" />
    <HikariEditorBlockHandle :editor="editor" />
    <HikariEditorTableControls :editor="editor" />
    <HikariEditorOverlayHost :plugins="plugins" />
    <ArticleEditorPublishDialog v-model:visible="publishOpen" :host="host" />
    <ArticleEditorDraftChooser v-if="props.articleId === null && !isReview" @restore="onRestore" />

    <Dialog
      v-model:visible="leavePromptOpen"
      modal
      header="空白草稿"
      :draggable="false"
      dismissable-mask
      :style="{ width: '26rem' }"
    >
      <p class="text-sm leading-6 text-muted-color">要保存此草稿吗？</p>
      <template #footer>
        <Button label="保留" severity="secondary" text @click="leaveTo" />
        <Button label="删除草稿" severity="danger" @click="discardDraft" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
  :deep(.editor-toolbar) {
    width: max-content;
    max-width: 100%;
    padding-left: 0;
    padding-right: 0;
  }
  .article-canvas :deep(.hikari-editor-surface) {
    font-size: 17px;
    line-height: 1.8;
  }
  .article-canvas :deep(.ProseMirror) {
    min-height: 50vh;
  }
</style>
