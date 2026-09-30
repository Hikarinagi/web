<script setup lang="ts">
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { Button, Dialog, Tabs, TabsContent, TabsList, TabsTrigger, Text } from '@hina-ui/vue'
  import StartForm from '~/components/contribute/novel/StartForm.vue'
  import { PROJECT_COPY } from '~/features/contribute/wanted'
  import EpubForm from '../epub/ContributeForm.vue'

  type Mode = 'ENTRY' | 'TRANSLATION'
  type Project = ApiData<'/api/v3/novel-projects', 'get'>['items'][number]

  defineOptions({ name: 'LightNovelVolumeContributeDialog' })
  const props = defineProps<{ volumeId: number }>()
  const open = defineModel<boolean>('open', { required: true })

  const MODES: { value: Mode; label: string; resume: string }[] = [
    { value: 'ENTRY', label: '录入', resume: '继续录入' },
    { value: 'TRANSLATION', label: '翻译', resume: '继续翻译' },
  ]

  const auth = useAuthStore()
  const tab = ref<'EPUB' | Mode>('EPUB')
  const projects = ref<Project[]>([])
  const passed = ref(false)
  const epub = useTemplateRef<InstanceType<typeof EpubForm>>('epub')
  const forms = useTemplateRef<InstanceType<typeof StartForm>[]>('forms')

  const start = computed(() => forms.value?.[0] ?? null)
  const submitting = computed(() => !!(epub.value?.submitting || start.value?.submitting))
  const mode = computed(() => MODES.find(item => item.value === tab.value) ?? null)
  const running = computed(() =>
    mode.value ? (projects.value.find(item => item.mode === mode.value?.value) ?? null) : null,
  )
  const mine = computed(() => !!running.value && running.value.owner.id === auth.user?.id)
  const footer = computed(() =>
    tab.value === 'EPUB'
      ? !epub.value?.review || epub.value.isTerminal
      : !running.value || mine.value,
  )

  watch(
    () => epub.value?.status,
    status => {
      if (status === 'PASSED') passed.value = true
    },
  )

  watch(
    open,
    async next => {
      if (!next) {
        if (passed.value) void refreshNuxtData()
        epub.value?.pause()
        return
      }
      tab.value = 'EPUB'
      passed.value = false
      projects.value = []
      epub.value?.reset()
      const page = await hikariRequest('/api/v3/novel-projects', {
        query: {
          light_novel_volume_id: props.volumeId,
          status: ['DRAFT', 'ACTIVE', 'REVIEW'],
          page: 1,
          page_size: 20,
        },
        toast: false,
      }).catch(() => null)
      projects.value = page?.items ?? []
    },
    { immediate: true },
  )
</script>

<template>
  <Dialog v-model:open="open" title="投稿" size="md" :locked="submitting">
    <template #content>
      <Tabs v-model="tab">
        <TabsList label="投稿方式">
          <TabsTrigger value="EPUB" :disabled="submitting">上传 EPUB</TabsTrigger>
          <TabsTrigger
            v-for="item in MODES"
            :key="item.value"
            :value="item.value"
            :disabled="submitting"
          >
            {{ item.label }}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="EPUB" class="h-56 pt-4">
          <EpubForm ref="epub" :volume-id="volumeId" class="h-full" />
        </TabsContent>
        <TabsContent v-for="item in MODES" :key="item.value" :value="item.value" class="h-56 pt-4">
          <Text v-if="running" size="sm" tone="muted">
            <UserName :user="running.owner" :handle="false" class="inline-flex" />
            {{ PROJECT_COPY[item.value] }}
          </Text>
          <StartForm v-else ref="forms" :volume-id="volumeId" :mode="item.value" />
        </TabsContent>
      </Tabs>
    </template>

    <template v-if="footer" #footer>
      <template v-if="tab === 'EPUB' && !epub?.review">
        <Button variant="ghost" tone="neutral" :disabled="submitting" @click="open = false">
          取消
        </Button>
        <Button :disabled="!epub?.file" :loading="submitting" @click="epub?.contribute()">
          上传
        </Button>
      </template>
      <template v-else-if="tab === 'EPUB'">
        <Button
          v-if="epub?.status === 'REJECTED' || epub?.status === 'FAILED'"
          variant="outline"
          tone="neutral"
          @click="epub?.reset()"
        >
          重新上传
        </Button>
        <Button @click="open = false">完成</Button>
      </template>
      <Button v-else-if="mine" @click="navigateTo(`/create/projects/${running?.id}`)">
        {{ mode?.resume }}
      </Button>
      <template v-else>
        <Button variant="ghost" tone="neutral" :disabled="submitting" @click="open = false">
          取消
        </Button>
        <Button :loading="submitting" @click="start?.submit()">开始</Button>
      </template>
    </template>
  </Dialog>
</template>
