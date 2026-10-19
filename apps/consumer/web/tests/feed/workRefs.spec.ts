import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, toValue } from 'vue'
import FeedItemArticle from '../../app/components/feed/item/Article.vue'
import FeedItemPost from '../../app/components/feed/item/Post.vue'
import FeedWorkRefChips from '../../app/components/feed/work-ref/Chips.vue'
import FeedWorkRefList from '../../app/components/feed/work-ref/List.vue'
import type { FeedCluster, FeedItemByType, FeedWorkRef } from '../../app/features/feed/feed'
import { feedClusterHeight } from '../../app/features/feed/height'

type ArticleItem = FeedItemByType<'article'>
type PostItem = FeedItemByType<'post'>

function work(id: number, nsfw = false): FeedWorkRef {
  return {
    work_type: 'GALGAME',
    id,
    title: `作品${id}`,
    producer: null,
    year: null,
    cover: null,
    nsfw,
  } as unknown as FeedWorkRef
}

function article(works: FeedWorkRef[], review = false): ArticleItem {
  return {
    type: 'article',
    id: 292,
    title: 'GAL会社及其作品推荐',
    excerpt: null,
    work_refs: works,
    is_review: review,
    review_work: review ? works[0] : null,
    review_rate: review ? 8 : null,
    topics: [],
    cover: null,
    first_image: null,
    poll: null,
  } as unknown as ArticleItem
}

function post(works: FeedWorkRef[]): PostItem {
  return {
    type: 'post',
    id: 536,
    title: null,
    excerpt: '白板画',
    covers: [],
    cover_count: 0,
    work_refs: works,
    poll: null,
  } as unknown as PostItem
}

const WorkRefCard = defineComponent({
  name: 'FeedWorkRefCard',
  props: { workRef: { type: Object, required: true }, score: { type: Number, default: null } },
  setup: props => () => h('section', { 'data-card': (props.workRef as FeedWorkRef).id }),
})

describe('feed 文章条目里的作品引用', () => {
  beforeEach(() => {
    vi.stubGlobal('useNsfwPolicy', () => ({
      shouldBlockNsfw: (nsfw: unknown) => Boolean(toValue(nsfw)),
    }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function render(item: ArticleItem | PostItem) {
    return mount(item.type === 'post' ? FeedItemPost : FeedItemArticle, {
      props: { item },
      global: {
        components: { FeedWorkRefCard: WorkRefCard, FeedWorkRefChips, FeedWorkRefList },
        stubs: {
          HikariImage: true,
          FeedItemCovers: true,
          HikariContentNodesPollCard: true,
          WorkCardTrigger: defineComponent({
            setup:
              (_, { slots }) =>
              () =>
                h('span', slots.default?.()),
          }),
        },
      },
    })
  }

  const chipLinks = (wrapper: ReturnType<typeof render>) =>
    wrapper
      .findAll('a')
      .map(a => ({ href: a.attributes('href'), label: a.attributes('aria-label') }))

  it('只引用一部作品时显示完整卡片', () => {
    const wrapper = render(article([work(1)]))

    expect(wrapper.findAll('[data-card]')).toHaveLength(1)
    expect(wrapper.findAll('a')).toHaveLength(0)
  })

  it('测评文章只显示被测评的那部作品', () => {
    const wrapper = render(article([work(1), work(2), work(3)], true))

    expect(wrapper.findAll('[data-card]').map(card => card.attributes('data-card'))).toEqual(['1'])
    expect(wrapper.findAll('a')).toHaveLength(0)
  })

  it('引用两到五部作品时全部显示为标签', () => {
    const wrapper = render(article([1, 2, 3, 4, 5].map(id => work(id))))

    expect(wrapper.findAll('[data-card]')).toHaveLength(0)
    expect(chipLinks(wrapper).map(link => link.href)).toEqual([
      '/galgames/1',
      '/galgames/2',
      '/galgames/3',
      '/galgames/4',
      '/galgames/5',
    ])
  })

  it('超过五部时只显示前四部，其余收进一个指向文章的标签', () => {
    const wrapper = render(article(Array.from({ length: 20 }, (_, i) => work(i + 1))))
    const links = chipLinks(wrapper)

    expect(links.slice(0, 4).map(link => link.href)).toEqual([
      '/galgames/1',
      '/galgames/2',
      '/galgames/3',
      '/galgames/4',
    ])
    expect(links).toHaveLength(5)
    expect(links[4]).toEqual({ href: '/articles/292', label: '查看全部 20 部作品' })
    expect(wrapper.text()).toContain('+16')
  })

  it('被屏蔽的作品不计入数量', () => {
    const wrapper = render(article([work(1), work(2, true)]))

    expect(wrapper.findAll('[data-card]').map(card => card.attributes('data-card'))).toEqual(['1'])
  })

  it('帖子按同样的规则显示，收起的部分指向帖子', () => {
    const links = chipLinks(render(post(Array.from({ length: 8 }, (_, i) => work(i + 1)))))

    expect(links).toHaveLength(5)
    expect(links[4]).toEqual({ href: '/posts/536', label: '查看全部 8 部作品' })
  })

  it('没有引用作品的帖子不显示作品区', () => {
    const wrapper = render(post([]))

    expect(wrapper.findAll('[data-card]')).toHaveLength(0)
    expect(wrapper.findAll('a')).toHaveLength(0)
  })
})

describe('feed 文章条目的高度估算', () => {
  const height = (works: FeedWorkRef[]) =>
    feedClusterHeight(
      {
        key: 'a',
        author: null,
        rows: [{ kind: 'item', item: article(works) }],
      } as unknown as FeedCluster,
      { rowWidth: 600, viewportWidth: 1440 },
    )

  it('一部作品按一张卡片估算', () => {
    expect(height([work(1)]) - height([])).toBe(94 + 12)
  })

  it('二十部作品按标签行估算，不再按二十张卡片累加', () => {
    const many = Array.from({ length: 20 }, (_, i) => work(i + 1))

    expect(height(many) - height([])).toBeLessThanOrEqual(2 * 38 + 8 + 12)
  })

  it('帖子的作品区也计入高度', () => {
    const postHeight = (works: FeedWorkRef[]) =>
      feedClusterHeight(
        {
          key: 'p',
          author: null,
          rows: [{ kind: 'item', item: post(works) }],
        } as unknown as FeedCluster,
        { rowWidth: 600, viewportWidth: 1440 },
      )

    expect(postHeight([work(1)]) - postHeight([])).toBe(94 + 12)
  })
})
