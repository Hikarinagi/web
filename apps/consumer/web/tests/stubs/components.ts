import { defineComponent, h } from 'vue'

export const NuxtLink = defineComponent({
  name: 'NuxtLink',
  props: { to: { type: [String, Object], default: undefined } },
  setup:
    (props, { slots, attrs }) =>
    () =>
      h(
        'a',
        { ...attrs, href: typeof props.to === 'string' ? props.to : undefined },
        slots.default?.(),
      ),
})
