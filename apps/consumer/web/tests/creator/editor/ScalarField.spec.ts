import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { NumberInput } from '@hina-ui/vue'
import ScalarField from '../../../app/components/creator/editor/scalar/Field.vue'
import type { BackendEditorField } from '../../../app/features/creator/editor'

const volumeNumberField = {
  field: 'volume_number',
  kind: 'scalar',
  scope: 'work.light-novel-volume.scalar',
  value_type: 'int',
  nullable: true,
  required: false,
} as BackendEditorField

function mountNumberField(modelValue: number | null) {
  return mount(ScalarField, {
    props: {
      field: volumeNumberField,
      modelValue,
      initialValue: 99,
    },
    global: {
      stubs: {
        CreatorEditorFieldReset: true,
        CreatorEditorScalarLabelsField: true,
        CreatorEditorScalarPricesField: true,
        CreatorEditorScalarRefField: true,
        MediaLibraryPicker: true,
      },
    },
  })
}

describe('creator/editor/scalar/Field.vue', () => {
  it('清空可空数字字段时抛出 null，而不是 0', () => {
    const wrapper = mountNumberField(9)

    wrapper.findComponent(NumberInput).vm.$emit('update:modelValue', null)

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([null])
  })

  it('整数字段不留小数位也不分组，避免出现 1,234 这种进不了 schema 的值', () => {
    const formatOptions = mountNumberField(9).findComponent(NumberInput).props('formatOptions')

    expect(formatOptions).toMatchObject({ maximumFractionDigits: 0, useGrouping: false })
  })

  it('已有数字照原样交给控件', () => {
    expect(mountNumberField(12).findComponent(NumberInput).props('modelValue')).toBe(12)
  })

  it('空值交给控件的是 null，不会被读成 0', () => {
    expect(mountNumberField(null).findComponent(NumberInput).props('modelValue')).toBeNull()
  })
})
