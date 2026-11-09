<script setup lang="ts">
  import { IconButton, Inline, Input, Link, Stack, TableCell, TableRow, Text } from '@hina-ui/vue'
  import { ChevronRight, Lightbulb, X } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'WikiWorkCastRow' })

  const props = defineProps<{ appearance: number; twins: number[] }>()
  const route = useRoute()
  const cast = useCastEntry(() => props.appearance)
</script>

<template>
  <TableRow
    :class="cn(cast.dirty.value && (cast.created.value ? 'bg-success-soft' : 'bg-accent-soft'))"
  >
    <TableCell class="py-2.5 align-top">
      <Stack gap="xs">
        <Inline gap="md" align="center" :wrap="false">
          <WikiWorkCastAvatar :image="cast.image.value" :name="cast.name.value" />
          <Input
            v-model="cast.name.value"
            placeholder="名字"
            aria-label="名字"
            lang="ja"
            class="min-w-0 flex-1"
          />
        </Inline>
        <Stack gap="xs" class="pl-11">
          <WikiFieldBefore
            v-if="cast.touched('LABEL') && cast.field('LABEL')"
            :view="cast.view('LABEL')"
            :definition="cast.field('LABEL')!"
          />
          <Text v-if="cast.others.value" size="xs" tone="muted">
            另有 {{ cast.others.value }} 个名字
          </Text>
          <Inline v-if="twins.length && cast.name.value" gap="sm" align="baseline">
            <Text size="xs" tone="warning">本作中另有 {{ twins.length }} 个同名的出场角色</Text>
            <Link
              v-if="appearance > 0 && twins[0]! > 0"
              :as="NuxtLink"
              :to="`/entries/${appearance}/merge/${twins[0]}`"
              class="text-xs"
            >
              合并
            </Link>
          </Inline>
        </Stack>
      </Stack>
    </TableCell>
    <TableCell class="py-2.5 align-top">
      <Stack gap="xs">
        <WikiFieldName v-model="cast.actor.value" label="配音" placeholder="配音演员" />
        <WikiFieldBefore
          v-if="cast.touched('CREDIT') && cast.field('CREDIT')"
          :view="cast.view('CREDIT')"
          :definition="cast.field('CREDIT')!"
        />
        <Text v-if="cast.more.value" size="xs" tone="muted">
          另有 {{ cast.more.value }} 个配音
        </Text>
      </Stack>
    </TableCell>
    <TableCell class="py-2.5 align-top">
      <Inline gap="none" justify="end" align="center" :wrap="false">
        <IconButton
          v-if="cast.hinted.value"
          :as="NuxtLink"
          :to="{ query: { ...route.query, side: 'hints', focus: `${appearance}|` } }"
          :label="`${cast.hinted.value} 条建议`"
          variant="ghost"
          tone="accent"
          size="sm"
        >
          <Lightbulb />
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
      </Inline>
    </TableCell>
  </TableRow>
</template>
