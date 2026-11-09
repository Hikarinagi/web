<script setup lang="ts">
  import { Card, IconButton, Inline, Input, Stack } from '@hina-ui/vue'
  import { ChevronRight, X } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'WikiWorkCastCard' })

  const props = defineProps<{ appearance: number }>()
  const cast = useCastEntry(() => props.appearance)
</script>

<template>
  <Card
    :class="
      cn('p-3', cast.dirty.value && (cast.created.value ? 'bg-success-soft' : 'bg-accent-soft'))
    "
  >
    <Inline gap="sm" align="center" :wrap="false">
      <WikiWorkCastAvatar :image="cast.image.value" :name="cast.name.value" />
      <Stack gap="sm" class="min-w-0 flex-1">
        <Stack gap="xs">
          <Input v-model="cast.name.value" placeholder="名字" aria-label="名字" lang="ja" />
          <WikiFieldBefore
            v-if="cast.touched('LABEL') && cast.field('LABEL')"
            :view="cast.view('LABEL')"
            :definition="cast.field('LABEL')!"
          />
        </Stack>
        <Stack gap="xs">
          <WikiFieldName v-model="cast.actor.value" label="配音" placeholder="配音演员" />
          <WikiFieldBefore
            v-if="cast.touched('CREDIT') && cast.field('CREDIT')"
            :view="cast.view('CREDIT')"
            :definition="cast.field('CREDIT')!"
          />
        </Stack>
      </Stack>
      <Stack gap="xs" class="shrink-0">
        <IconButton
          :as="NuxtLink"
          :to="`/entries/${appearance}/edit`"
          label="编辑全部资料"
          :disabled="cast.created.value"
          variant="ghost"
          tone="neutral"
          size="sm"
        >
          <ChevronRight />
        </IconButton>
        <IconButton
          v-if="cast.created.value"
          label="取消添加"
          variant="ghost"
          tone="neutral"
          size="sm"
          @click="cast.editor.uncreate(appearance)"
        >
          <X />
        </IconButton>
      </Stack>
    </Inline>
  </Card>
</template>
