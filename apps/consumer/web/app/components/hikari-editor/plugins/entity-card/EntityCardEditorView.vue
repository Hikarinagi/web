<script setup lang="ts">
  import { Trash2 } from '@lucide/vue'
  import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'
  import { provide, type Component } from 'vue'
  import HikariContentNodesEntityCardArticle from '~/components/hikari-content/nodes/entity-card/Article.vue'
  import HikariContentNodesEntityCardCharacter from '~/components/hikari-content/nodes/entity-card/Character.vue'
  import { ENTITY_CARD_IN_EDITOR_KEY } from '~/components/hikari-content/nodes/entity-card/context'
  import HikariContentNodesEntityCardGalgame from '~/components/hikari-content/nodes/entity-card/Galgame.vue'
  import HikariContentNodesEntityCardGalgameRate from '~/components/hikari-content/nodes/entity-card/GalgameRate.vue'
  import HikariContentNodesEntityCardLightNovel from '~/components/hikari-content/nodes/entity-card/LightNovel.vue'
  import HikariContentNodesEntityCardLightNovelRate from '~/components/hikari-content/nodes/entity-card/LightNovelRate.vue'
  import HikariContentNodesEntityCardLightNovelVolume from '~/components/hikari-content/nodes/entity-card/LightNovelVolume.vue'
  import HikariContentNodesEntityCardManga from '~/components/hikari-content/nodes/entity-card/Manga.vue'
  import HikariContentNodesEntityCardMangaRate from '~/components/hikari-content/nodes/entity-card/MangaRate.vue'
  import HikariContentNodesEntityCardPerson from '~/components/hikari-content/nodes/entity-card/Person.vue'
  import HikariContentNodesEntityCardPost from '~/components/hikari-content/nodes/entity-card/Post.vue'
  import HikariContentNodesEntityCardProducer from '~/components/hikari-content/nodes/entity-card/Producer.vue'

  defineOptions({ name: 'HikariEditorPluginsEntityCardEditorView' })

  const props = defineProps(nodeViewProps)

  // 让 Container 让出 my-[0.8em],NodeViewWrapper 接管,使 selected ring 紧贴卡片。
  provide(ENTITY_CARD_IN_EDITOR_KEY, true)

  const NODE_VIEW_MAP: Record<string, Component> = {
    galgame_card: HikariContentNodesEntityCardGalgame,
    light_novel_card: HikariContentNodesEntityCardLightNovel,
    light_novel_volume_card: HikariContentNodesEntityCardLightNovelVolume,
    manga_card: HikariContentNodesEntityCardManga,
    person_card: HikariContentNodesEntityCardPerson,
    producer_card: HikariContentNodesEntityCardProducer,
    character_card: HikariContentNodesEntityCardCharacter,
    article_card: HikariContentNodesEntityCardArticle,
    post_card: HikariContentNodesEntityCardPost,
    galgame_rate_card: HikariContentNodesEntityCardGalgameRate,
    light_novel_rate_card: HikariContentNodesEntityCardLightNovelRate,
    manga_rate_card: HikariContentNodesEntityCardMangaRate,
  }

  const inner = computed(() => NODE_VIEW_MAP[props.node.type.name] ?? null)

  const adaptedNode = computed(() => ({
    type: props.node.type.name,
    attrs: props.node.attrs,
  }))
</script>

<template>
  <NodeViewWrapper
    as="div"
    :class="[
      'group/card relative my-[0.8em] rounded-(--editor-panel-radius) border-[1.5px] transition-[border-color,box-shadow] duration-120 ease-out',
      selected ? 'border-(--editor-focus-ring)' : 'border-transparent',
    ]"
    :style="
      selected
        ? { boxShadow: '0 0 0 4px color-mix(in srgb, var(--editor-focus-ring) 25%, transparent)' }
        : undefined
    "
  >
    <div class="contents" @click.capture.stop.prevent>
      <component :is="inner" v-if="inner" :node="adaptedNode" />
    </div>

    <div
      :class="[
        'absolute top-2 right-2 z-10 transition-opacity duration-150',
        selected
          ? 'opacity-100'
          : 'opacity-100 md:opacity-0 md:group-hover/card:opacity-100 md:focus-within:opacity-100',
      ]"
    >
      <Button
        v-tooltip.top="'删除'"
        unstyled
        type="button"
        class="inline-flex size-7 items-center justify-center rounded-md bg-black/55 text-white transition-colors duration-150 hover:bg-hikari-red-500"
        aria-label="删除卡片"
        @click="deleteNode"
      >
        <Trash2 class="size-4" />
      </Button>
    </div>
  </NodeViewWrapper>
</template>
