<script setup lang="ts">
  import { Inline, Link, Text } from '@hina-ui/vue'
  import { PencilLine } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { components } from '@hikarinagi/api-contract/v3'
  import { getRevisionEditPath } from '~/features/revision/resources'

  defineOptions({ name: 'CharacterProfile' })
  const props = defineProps<{
    profile: components['schemas']['CharacterAppearanceProfileDto']
    characterId: number
  }>()

  const { t } = useLocaleText()
  const rows = computed(() => {
    const { profile } = props
    const { birthday, height, weight, measurements } = profile.shown
    return [
      { key: 'gender', label: t('entity.character.gender'), value: profile.gender_label },
      {
        key: 'birthday',
        label: t('entity.character.birthday'),
        value: birthday ? t('time.monthDay', birthday) : profile.birthday,
      },
      { key: 'age', label: t('entity.character.age'), value: profile.age },
      {
        key: 'height',
        label: t('entity.character.height'),
        value:
          height === null ? profile.height : t('entity.character.centimetres', { value: height }),
      },
      {
        key: 'weight',
        label: t('entity.character.weight'),
        value:
          weight === null ? profile.weight : t('entity.character.kilograms', { value: weight }),
      },
      {
        key: 'measurements',
        label: t('entity.character.measurements'),
        value: measurements
          ? measurements.cup
            ? t('entity.character.sizesWithCup', measurements)
            : t('entity.character.sizes', measurements)
          : profile.measurements,
      },
      { key: 'bloodType', label: t('entity.character.bloodType'), value: profile.blood_type },
    ].filter(row => row.value)
  })
</script>

<template>
  <Inline gap="none" align="baseline" class="gap-x-5 gap-y-1">
    <Inline v-for="row in rows" :key="row.key" gap="xs" align="baseline" :wrap="false">
      <Text as="span" size="sm" tone="muted">{{ row.label }}</Text>
      <Text as="span" size="sm" weight="medium" class="tabular-nums">{{ row.value }}</Text>
    </Inline>
    <Link
      :as="NuxtLink"
      :to="getRevisionEditPath('character', characterId)"
      target="_blank"
      tone="neutral"
      class="inline-flex items-center gap-1 text-sm text-muted"
    >
      <PencilLine class="size-3.5" />
      {{ t('entity.character.supplement') }}
    </Link>
  </Inline>
</template>
