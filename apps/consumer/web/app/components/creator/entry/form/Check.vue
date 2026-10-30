<script setup lang="ts">
  import { Alert, Button, Spinner, Text } from '@hina-ui/vue'
  import type {
    BackendEditCheck,
    BackendPropertyDefinition,
    BackendSource,
  } from '~/features/creator/entry/contract'
  import { statementText } from '~/features/creator/entry/values'

  defineOptions({ name: 'CreatorEntryFormCheck' })
  const props = defineProps<{
    check: BackendEditCheck | null
    checking: boolean
    definition: BackendPropertyDefinition
    refusal: { reason: string | null; message: string } | null
    source: BackendSource | null
    entryType: string
    unpublished: boolean
    incomplete: boolean
    screenshot: boolean
  }>()

  const REFUSALS: Record<string, string> = {
    link_evidence_required:
      '关联到人物或组织条目的名称，需要有来源证明该名称所指为该条目。请取消关联，或添加此类来源。',
  }

  const emit = defineEmits<{ adopt: [] }>()

  type Tone = 'success' | 'warning' | 'danger' | 'info'
  const message = computed<{ tone: Tone; title: string; body?: string; adopt?: boolean } | null>(
    () => {
      const refusal = props.refusal
      if (refusal)
        return {
          tone: 'danger',
          title: '无法保存此次编辑',
          body: (refusal.reason && REFUSALS[refusal.reason]) || refusal.message,
        }
      if (props.incomplete)
        return { tone: 'warning', title: '请选择版本，并填写截图在作品中的位置' }
      const check = props.check
      if (!check) return null
      const label = props.definition.label
      if (check.locked.length) return { tone: 'danger', title: '该条目已锁定' }
      if (check.conflicts.length) return null
      const violation = check.violations[0]
      if (violation)
        return violation.reason === 'duplicate'
          ? { tone: 'danger', title: `${label}已被其他条目使用` }
          : { tone: 'danger', title: `${label}仅可取一个值；请先作废当前值` }
      const record = props.source?.record_key ? props.source : null
      const checked = check.statements[0]
      if (!checked) return null
      const verification = checked.citations.at(-1)?.verification
      if (!verification)
        return {
          tone: 'warning',
          title: '没有来源',
          body: '若无来源，该值仍会被保存，并作为无来源的值显示在条目页上。',
        }
      if (verification === 'PASSED')
        return {
          tone: 'success',
          title: '核验通过',
          body: record
            ? '与资料中的值一致。'
            : props.screenshot
              ? undefined
              : '已在页面中找到对应原文。',
        }
      if (verification === 'EXCERPT_NOT_FOUND')
        return { tone: 'danger', title: '页面中未找到此摘录' }
      if (verification === 'SOURCE_NOT_ALLOWED')
        return { tone: 'danger', title: `该来源无法用于${label}` }
      if (verification === 'VALUE_MISMATCH' && record) {
        const value = record.values.find(
          item =>
            item.property === props.definition.property && item.entry_type === props.entryType,
        )?.value
        return {
          tone: 'danger',
          title: '该资料未给出此值',
          body: value
            ? `该资料给出 ${statementText({ ...value, property: props.definition.property })}。`
            : `该资料未包含${label}。`,
          adopt: Boolean(value),
        }
      }
      if (verification === 'VALUE_MISMATCH')
        return { tone: 'danger', title: '摘录与该值不符', body: '摘录必须按页面上的写法包含该值。' }
      if (verification === 'UNREACHABLE')
        return { tone: 'warning', title: '无法打开来源页面', body: '请检查地址，或稍后重试。' }
      if (verification === 'UNCONFIRMED_MATCH')
        return {
          tone: 'warning',
          title: '来源页面未明确指向该条目',
          body: '请使用标明此条目名称的页面，例如其官方网站或商店页面。',
        }
      return null
    },
  )
</script>

<template>
  <Text
    v-if="checking && !message"
    as="span"
    size="xs"
    tone="muted"
    class="inline-flex items-center gap-2"
  >
    <Spinner size="sm" />
    正在核验
  </Text>
  <Alert :open="Boolean(message)" :tone="message?.tone ?? 'info'" :title="message?.title">
    {{ message?.body }}
    <template v-if="message?.adopt" #actions>
      <Button variant="soft" tone="neutral" size="sm" @click="emit('adopt')">采用该值</Button>
    </template>
  </Alert>
  <Alert :open="unpublished" tone="info" title="此记录未公开，保存后将在读者页默认折叠显示" />
  <Alert :open="Boolean(check?.notice)" tone="info" title="本次编辑将公示 48 小时后生效" />
</template>
