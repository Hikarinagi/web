import { Form, FormField, NumberInput } from '@hina-ui/vue'
import { HIKARI_BIZ_CODE } from '@hikarinagi/shared'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PurchaseDialog from '../../app/components/ui/PurchaseDialog.vue'
import { usePurchaseDialog } from '../../app/features/purchase/usePurchaseDialog'
import { HikariApiError } from '../../app/utils/api/error'

describe('PurchaseDialog', () => {
  const purchase = usePurchaseDialog()
  const handler = vi.fn()
  let wrapper: ReturnType<typeof mount>

  function open(maxQuantity = 10, quantity = 1) {
    purchase.open({
      name: '下载卡',
      price: 6,
      balance: 60,
      maxQuantity,
      quantity,
      onConfirm: handler,
    })
  }

  async function change(quantity: number | null) {
    wrapper.getComponent(NumberInput).vm.$emit('update:modelValue', quantity)
    await nextTick()
    await flushPromises()
  }

  async function submit() {
    await wrapper.getComponent(Form).vm.submit()
    await nextTick()
  }

  beforeEach(() => {
    handler.mockReset().mockResolvedValue(undefined)
    open()
    wrapper = mount(PurchaseDialog, {
      global: {
        stubs: {
          HnDialog: defineComponent({
            setup:
              (_, { slots }) =>
              () =>
                h('section', [slots.content?.(), slots.footer?.()]),
          }),
          HikariImage: true,
          HikariPoint: true,
        },
      },
    })
  })

  afterEach(() => {
    wrapper.unmount()
    purchase.cancel()
  })

  it('shows empty quantity errors at the field instead of claiming insufficient points', async () => {
    await change(null)
    await submit()
    expect(handler).not.toHaveBeenCalled()
    expect(wrapper.getComponent(FormField).text()).toContain('请输入购买数量')
    expect(wrapper.get('input').attributes('aria-invalid')).toBe('true')
    expect(wrapper.text()).not.toContain('光点不足')
    expect(wrapper.text()).not.toContain('NaN')
  })

  it('validates when the purchase button is clicked and clears errors after correction', async () => {
    await change(11)
    await wrapper
      .findAll('button')
      .find(button => button.text() === '购买')!
      .trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('购买数量不能超过 10')
    expect(wrapper.text()).not.toContain('光点不足')
    expect(handler).not.toHaveBeenCalled()

    await change(2)
    expect(wrapper.text()).not.toContain('购买数量不能超过 10')
    await submit()
    expect(handler).toHaveBeenCalledExactlyOnceWith(2)
    expect(purchase.state.open).toBe(false)
  })

  it('handles clearing the actual number input without showing NaN or buying an item', async () => {
    const input = wrapper.get('input')
    await input.setValue('')
    await input.trigger('blur')
    await submit()
    expect(wrapper.getComponent(FormField).text()).toContain('请输入购买数量')
    expect(wrapper.text()).not.toContain('NaN')
    expect(wrapper.text()).not.toContain('光点不足')
    expect(handler).not.toHaveBeenCalled()
  })

  it('shows insufficient points only for a valid quantity', async () => {
    purchase.state.balance = 5
    await nextTick()
    await submit()
    expect(wrapper.text()).toContain('光点不足')
    expect(wrapper.find('[data-hn-form-field-message]').exists()).toBe(false)
    expect(handler).not.toHaveBeenCalled()
    expect(purchase.state.open).toBe(true)
  })

  it('clears old errors and restores the requested quantity when reopened', async () => {
    await change(null)
    await submit()
    purchase.cancel()
    await nextTick()
    open(10, 3)
    await nextTick()
    expect(wrapper.text()).not.toContain('请输入购买数量')
    expect(wrapper.getComponent(NumberInput).props('modelValue')).toBe(3)
    await submit()
    expect(handler).toHaveBeenCalledExactlyOnceWith(3)
  })

  it('keeps single-item purchases working without a quantity input', async () => {
    purchase.cancel()
    await nextTick()
    open(1)
    await nextTick()
    expect(wrapper.findComponent(NumberInput).exists()).toBe(false)
    await submit()
    expect(handler).toHaveBeenCalledExactlyOnceWith(1)
  })

  it('displays API field errors through FormField and permits correction', async () => {
    handler.mockRejectedValueOnce(
      new HikariApiError({
        status: 400,
        code: HIKARI_BIZ_CODE.COMMON_VALIDATION_FAILED,
        message: '参数错误',
        field_errors: [{ field: 'quantity', message: '本次最多购买 2 张' }],
      }),
    )
    await change(3)
    await submit()
    expect(wrapper.getComponent(FormField).text()).toContain('本次最多购买 2 张')
    expect(purchase.state.open).toBe(true)
    expect(purchase.state.submitting).toBe(false)
    await change(2)
    expect(wrapper.text()).not.toContain('本次最多购买 2 张')
    await submit()
    expect(handler).toHaveBeenLastCalledWith(2)
    expect(purchase.state.open).toBe(false)
  })

  it('keeps the form usable after a request failure', async () => {
    handler.mockRejectedValueOnce(new Error('network'))
    await submit()
    expect(purchase.state.open).toBe(true)
    expect(purchase.state.submitting).toBe(false)
    await submit()
    expect(handler).toHaveBeenCalledTimes(2)
    expect(purchase.state.open).toBe(false)
  })

  it('prevents duplicate purchases and dismissal while submitting', async () => {
    let resolve!: () => void
    handler.mockImplementationOnce(
      () =>
        new Promise<void>(done => {
          resolve = done
        }),
    )
    const pending = submit()
    await flushPromises()
    expect(purchase.state.submitting).toBe(true)
    expect(wrapper.get('input').attributes('disabled')).toBeDefined()
    purchase.cancel()
    expect(purchase.state.open).toBe(true)
    await submit()
    expect(handler).toHaveBeenCalledTimes(1)
    resolve()
    await pending
    expect(purchase.state.open).toBe(false)
    expect(purchase.state.submitting).toBe(false)
  })
})
