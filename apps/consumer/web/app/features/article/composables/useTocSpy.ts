import { onMounted, ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

// scroll-spy:观察各 heading 元素,高亮当前可视小节;点击平滑滚动(扣 header 高度)。
export function useTocSpy(ids: () => string[]) {
  const activeId = ref<string | null>(null)
  const targets = ref<HTMLElement[]>([])

  function scrollTo(id: string) {
    const el = document.getElementById(id)
    if (!el) return
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - 88,
      behavior: 'smooth',
    })
    activeId.value = id
  }

  if (import.meta.client) {
    const visible = new Set<string>()
    onMounted(() => {
      const list = ids()
      targets.value = list
        .map(id => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null)
      activeId.value = list[0] ?? null
    })
    useIntersectionObserver(
      targets,
      observed => {
        for (const e of observed) {
          if (e.isIntersecting) visible.add(e.target.id)
          else visible.delete(e.target.id)
        }
        const first = ids().find(id => visible.has(id))
        if (first) activeId.value = first
      },
      { rootMargin: '-88px 0px -70% 0px' },
    )
  }

  return { activeId, scrollTo }
}
