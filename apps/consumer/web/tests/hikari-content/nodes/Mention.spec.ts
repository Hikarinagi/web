import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import Mention from '../../../app/components/hikari-content/nodes/Mention.vue'
import {
  provideContentSummaries,
  type EntitySummaries,
  type MentionUserSummary,
} from '../../../app/components/hikari-content/composables/useContentSummaries'

function emptySummaries(): EntitySummaries {
  return {
    galgames: [],
    light_novels: [],
    light_novel_volumes: [],
    persons: [],
    producers: [],
    characters: [],
    articles: [],
    posts: [],
    galgame_rates: [],
    light_novel_rates: [],
    mention_users: [],
    emojis: [],
  }
}

const UserCardTriggerStub = defineComponent({
  name: 'UserCardTrigger',
  props: ['userId', 'showOnClick'],
  setup(_, { slots }) {
    return () => h('span', { 'data-stub-user-card-trigger': '' }, slots.default?.())
  },
})

const AvatarStub = defineComponent({
  name: 'Avatar',
  props: ['image', 'size', 'shape'],
  setup(props) {
    return () => h('span', { 'data-stub-avatar': '', 'data-image': props.image })
  },
})

function host(summaries: EntitySummaries, node: { type: string; attrs: Record<string, unknown> }) {
  return defineComponent({
    setup() {
      const s = ref(summaries)
      provideContentSummaries(() => s.value)
      return () =>
        h(Mention, { node: node as unknown as { type: string; attrs: Record<string, unknown> } })
    },
  })
}

describe('hikari-content/nodes/Mention.vue', () => {
  it('renders @<name> chip with avatar when summary is provided via inject', () => {
    const userSummary: MentionUserSummary = {
      id: 7,
      name: 'arisaka',
      avatar: { id: 1, src: 'media/avatar.webp', width: 100, height: 100 },
    }
    const summaries = emptySummaries()
    summaries.mention_users.push(userSummary)
    const wrapper = mount(
      host(summaries, { type: 'mention_user', attrs: { mention_user_id: 7 } }),
      {
        global: { stubs: { UserCardTrigger: UserCardTriggerStub, Avatar: AvatarStub } },
      },
    )
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('falls back to @user_<id> placeholder when summary missing for the id', () => {
    const wrapper = mount(
      host(emptySummaries(), { type: 'mention_user', attrs: { mention_user_id: 99 } }),
      {
        global: { stubs: { UserCardTrigger: UserCardTriggerStub, Avatar: AvatarStub } },
      },
    )
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renders @? fallback when mention_user_id is null/invalid', () => {
    const wrapper = mount(
      host(emptySummaries(), { type: 'mention_user', attrs: { mention_user_id: null } }),
      {
        global: { stubs: { UserCardTrigger: UserCardTriggerStub, Avatar: AvatarStub } },
      },
    )
    expect(wrapper.html()).toMatchSnapshot()
  })
})
