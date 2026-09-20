import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import Form from '@primevue/forms/form'
import FormField from '@primevue/forms/formfield'
import PrimeVue from 'primevue/config'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import ScalarField from '../../../app/components/creator/editor/scalar/Field.vue'
import type { BackendEditorField } from '../../../app/features/creator/editor'

const InputNumberStub = defineComponent({
  name: 'InputNumber',
  props: ['modelValue'],
  emits: ['input', 'update:modelValue'],
  setup(props) {
    return () => h('input', { 'data-testid': 'number-input', value: props.modelValue ?? '' })
  },
})

const ResetStub = defineComponent({
  name: 'CreatorEditorFieldReset',
  setup() {
    return () => h('span', { 'data-testid': 'field-reset' })
  },
})

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
      components: {
        InputNumber: InputNumberStub,
      },
      stubs: {
        AutoComplete: true,
        CreatorEditorFieldReset: ResetStub,
        CreatorEditorScalarLabelsField: true,
        CreatorEditorScalarPricesField: true,
        CreatorEditorScalarRefField: true,
        DatePicker: true,
        InputText: true,
        MediaLibraryPicker: true,
        MultiSelect: true,
        Select: true,
        Textarea: true,
        ToggleSwitch: true,
      },
    },
  })
}

function mountFormNumberField() {
  const submitted = ref<Record<string, unknown> | null>(null)
  const Harness = defineComponent({
    components: { Form, FormField, ScalarField },
    setup() {
      return {
        field: volumeNumberField,
        submitted,
        onSubmit: (event: { values: Record<string, unknown> }) => {
          submitted.value = event.values
        },
      }
    },
    template: `
      <Form v-slot="$form" :initial-values="{ volume_number: 99 }" @submit="onSubmit">
        <FormField v-slot="$field" name="volume_number">
          <ScalarField
            :field="field"
            :model-value="$field.value"
            :initial-value="99"
            @update:model-value="value => $field.props.onInput({ value })"
          />
        </FormField>
        <span data-testid="form-value">{{ $form.volume_number?.value ?? '' }}</span>
        <button type="submit">submit</button>
      </Form>
    `,
  })

  return {
    submitted,
    wrapper: mount(Harness, {
      global: {
        plugins: [PrimeVue],
        components: {
          InputNumber,
          InputText,
        },
        stubs: {
          AutoComplete: true,
          CreatorEditorFieldReset: ResetStub,
          CreatorEditorScalarLabelsField: true,
          CreatorEditorScalarPricesField: true,
          CreatorEditorScalarRefField: true,
          DatePicker: true,
          MediaLibraryPicker: true,
          MultiSelect: true,
          Select: true,
          Textarea: true,
          ToggleSwitch: true,
        },
      },
    }),
  }
}

async function backspace(input: HTMLInputElement) {
  input.setSelectionRange(input.value.length, input.value.length)
  input.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'Backspace',
      code: 'Backspace',
      bubbles: true,
      cancelable: true,
    }),
  )
  await nextTick()
}

describe('creator/editor/scalar/Field.vue', () => {
  it('emits null when a nullable InputNumber is cleared', () => {
    const wrapper = mountNumberField(9)

    wrapper.findComponent(InputNumberStub).vm.$emit('input', { value: null })

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([null])
  })

  it('keeps nullable numbers empty after deleting the final digit inside a FormField', async () => {
    const { submitted, wrapper } = mountFormNumberField()
    const input = wrapper.find<HTMLInputElement>('input[role="spinbutton"]').element

    expect(input.value).toBe('99')

    await backspace(input)
    expect(input.value).toBe('9')

    await backspace(input)
    expect(input.value).toBe('')
    expect(wrapper.find('[data-testid="form-value"]').text()).toBe('')

    await wrapper.find('form').trigger('submit')

    expect(submitted.value).toMatchObject({ volume_number: null })
  })
})
