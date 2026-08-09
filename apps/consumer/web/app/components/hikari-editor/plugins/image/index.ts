import { Image as ImageIcon } from '@lucide/vue'
import { ImageBlockExtension } from '@hikarinagi/editor-schema'
import type { Editor } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import { push } from 'notivue'
import { useMediaLibrary } from '~/components/media-library/composables/useMediaLibrary'
import { isAcceptedImage, uploadImage } from '~/components/media-library/lib/upload'
import type { MediaValue } from '~/components/media-library/types'
import { insertAfterTable } from '../table/insert'
import type { EditorPlugin } from '../types'
import { pickInitialWidthPercent } from './composables/useImageResize'
import ImageBlockNodeView from './ImageBlockNodeView.vue'
import ImageMetaForm from './ImageMetaForm.vue'

function insertUploadedImage(editor: Editor, media: MediaValue) {
  const surfaceWidth = (editor.view.dom as HTMLElement).clientWidth || 0
  const content = [
    {
      type: 'image_block',
      attrs: {
        media_asset_id: media.id,
        src: media.src,
        alt: null,
        caption: null,
        width: media.width ?? 0,
        height: media.height ?? 0,
        width_percent: pickInitialWidthPercent(media.width ?? 0, surfaceWidth),
      },
    },
    { type: 'paragraph' },
  ]
  if (insertAfterTable(editor, content)) return
  editor.chain().focus().insertContent(content).run()
}

function clipboardImages(event: ClipboardEvent): File[] {
  const list = event.clipboardData?.files
  if (!list?.length) return []
  return Array.from(list).filter(file => file.type.startsWith('image/'))
}

async function uploadAndInsert(editor: Editor, files: File[]) {
  for (const file of files) {
    const note = isAcceptedImage(file) ? push.promise({ message: '正在上传图片…' }) : null
    const media = await uploadImage(file)
    if (media) {
      insertUploadedImage(editor, media)
      note?.clear()
    } else {
      note?.destroy()
    }
  }
}

const ImageBlock = ImageBlockExtension.extend({
  addNodeView() {
    return VueNodeViewRenderer(ImageBlockNodeView)
  },
  // 粘贴上传:只在注册了 image 插件的 profile(community/文章)生效;post/comment 不含本插件。
  addProseMirrorPlugins() {
    const parentPlugins = this.parent?.() ?? []
    const editor = this.editor
    return [
      ...parentPlugins,
      new Plugin({
        key: new PluginKey('image_paste_upload'),
        props: {
          handlePaste(_view, event) {
            const files = clipboardImages(event)
            if (!files.length) return false
            void uploadAndInsert(editor, files)
            return true
          },
        },
      }),
    ]
  },
})

export const image: EditorPlugin = {
  id: 'image',
  group: 'insert-media',
  order: 0,
  extensions: () => [ImageBlock],
  toolbarItem: {
    icon: ImageIcon,
    tooltip: '插入图片',
    onClick: async (editor, _ctx, trigger) => {
      const picks = await useMediaLibrary().open({
        mode: 'single',
        style: 'popover',
        anchor: trigger,
      })
      const m = picks[0]
      if (!m) return
      insertUploadedImage(editor, m)
    },
  },
  overlays: {
    'image-meta': ImageMetaForm,
  },
}
