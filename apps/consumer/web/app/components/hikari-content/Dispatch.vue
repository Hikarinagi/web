<script setup lang="ts">
  import type { EditorNode } from '@hikarinagi/editor-schema'

  defineOptions({ name: 'HikariContentDispatch' })

  defineProps<{ node: EditorNode }>()
</script>

<template>
  <HikariContentNodesDoc v-if="node.type === 'doc'" :node="node" />
  <HikariContentNodesParagraph v-else-if="node.type === 'paragraph'" :node="node" />
  <HikariContentNodesHeading v-else-if="node.type === 'heading'" :node="node" />
  <HikariContentNodesBulletList v-else-if="node.type === 'bullet_list'" :node="node" />
  <HikariContentNodesOrderedList v-else-if="node.type === 'ordered_list'" :node="node" />
  <HikariContentNodesListItem v-else-if="node.type === 'list_item'" :node="node" />
  <HikariContentNodesBlockquote v-else-if="node.type === 'blockquote'" :node="node" />
  <HikariContentNodesCodeBlock v-else-if="node.type === 'code_block'" :node="node" />
  <HikariContentNodesHorizontalRule v-else-if="node.type === 'horizontal_rule'" :node="node" />
  <HikariContentNodesHardBreak v-else-if="node.type === 'hard_break'" :node="node" />
  <HikariContentNodesText v-else-if="node.type === 'text'" :node="node" />
  <HikariContentNodesImage v-else-if="node.type === 'image_block'" :node="node" />
  <HikariContentNodesMention v-else-if="node.type === 'mention_user'" :node="node" />
  <HikariContentNodesEmoji v-else-if="node.type === 'emoji_inline'" :node="node" />
  <HikariContentNodesEntityCardGalgame v-else-if="node.type === 'galgame_card'" :node="node" />
  <HikariContentNodesEntityCardLightNovel
    v-else-if="node.type === 'light_novel_card'"
    :node="node"
  />
  <HikariContentNodesEntityCardLightNovelVolume
    v-else-if="node.type === 'light_novel_volume_card'"
    :node="node"
  />
  <HikariContentNodesEntityCardManga v-else-if="node.type === 'manga_card'" :node="node" />
  <HikariContentNodesEntityCardPerson v-else-if="node.type === 'person_card'" :node="node" />
  <HikariContentNodesEntityCardProducer v-else-if="node.type === 'producer_card'" :node="node" />
  <HikariContentNodesEntityCardCharacter v-else-if="node.type === 'character_card'" :node="node" />
  <HikariContentNodesEntityCardArticle v-else-if="node.type === 'article_card'" :node="node" />
  <HikariContentNodesEntityCardPost v-else-if="node.type === 'post_card'" :node="node" />
  <HikariContentNodesEntityCardGalgameRate
    v-else-if="node.type === 'galgame_rate_card'"
    :node="node"
  />
  <HikariContentNodesEntityCardLightNovelRate
    v-else-if="node.type === 'light_novel_rate_card'"
    :node="node"
  />
  <HikariContentNodesEntityCardMangaRate v-else-if="node.type === 'manga_rate_card'" :node="node" />
  <HikariContentNodesEntityCardComment v-else-if="node.type === 'comment_card'" :node="node" />
  <HikariContentNodesPollCard v-else-if="node.type === 'poll'" :node="node" />
  <span v-else class="hikari-content-unknown-node" :data-node-type="node.type">
    [?{{ node.type }}]
  </span>
</template>
