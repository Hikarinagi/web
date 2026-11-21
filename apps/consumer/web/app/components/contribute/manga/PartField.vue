<script setup lang="ts">
  import { FormField, FormLayout, Inline, NumberInput, Select } from '@hina-ui/vue'
  import { partOptions, WHOLE_VOLUME } from '~/features/contribute/manga-options'
  import type { MangaTargetClaim, MangaTargetVolume } from '~/features/contribute/manga-target'

  const props = defineProps<{
    volume: MangaTargetVolume | undefined
    claims: MangaTargetClaim[]
    published: MangaTargetClaim[]
    selfId?: number
  }>()
  const part = defineModel<number | null | undefined>('part', { required: true })
  const count = defineModel<number | null | undefined>('count', { required: true })

  const choices = computed(() =>
    partOptions(count.value ?? 0, props.volume, {
      claims: props.claims,
      published: props.published,
      selfId: props.selfId,
    }),
  )
  const choice = computed({
    get: () => part.value ?? WHOLE_VOLUME,
    set: value => {
      if (value === WHOLE_VOLUME || value == null) {
        part.value = null
        count.value = null
        return
      }
      part.value = Number(value)
    },
  })

  watch(
    () => props.volume?.id,
    () => {
      const editions = props.volume?.editions.length ?? 0
      if (part.value == null) count.value = editions >= 2 ? editions : null
    },
    { immediate: true },
  )
</script>

<template>
  <FormLayout :columns="2">
    <FormField name="part">
      <template #label>
        <Inline gap="xs" align="center" :wrap="false">
          部分
          <Question title="按部分投稿" aria-label="查看按部分投稿的说明">
            阅读内容按维基收录的卷编排。电子版分册只收一卷的一部分时，选择其内容所在的卷，填写是这一卷的第几部分、这一卷共分几部分；同一卷的几个部分按顺序合成这一卷。整卷投稿选「整卷」。
          </Question>
        </Inline>
      </template>
      <Select v-model="choice" :options="choices" />
    </FormField>
    <FormField name="part_count" label="共几部分" :required="part != null">
      <NumberInput v-model="count" :min="2" :max="50" />
    </FormField>
  </FormLayout>
</template>
