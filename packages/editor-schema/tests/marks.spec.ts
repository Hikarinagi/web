import { LinkMark, MARK_RENDER_SPECS, RENDERER_OUTPUT_CLASSES } from '../src/index'

describe('MARK_RENDER_SPECS', () => {
  it('link class 在 RENDERER_OUTPUT_CLASSES 白名单内', () => {
    expect(RENDERER_OUTPUT_CLASSES).toContain(MARK_RENDER_SPECS.link.class)
  })

  it('简单 marks (bold/italic/strike/code) class 为 null,不在 sanitized HTML 中输出额外 class', () => {
    expect(MARK_RENDER_SPECS.bold.class).toBeNull()
    expect(MARK_RENDER_SPECS.italic.class).toBeNull()
    expect(MARK_RENDER_SPECS.strike.class).toBeNull()
    expect(MARK_RENDER_SPECS.code.class).toBeNull()
  })

  it('link mark tag/attrs 是稳定契约', () => {
    expect(MARK_RENDER_SPECS.link.tag).toBe('a')
    expect(MARK_RENDER_SPECS.link.attrs.rel).toBe('noopener noreferrer ugc')
  })
})

describe('LinkMark 与 MARK_RENDER_SPECS 同源', () => {
  it('LinkMark 是 Tiptap extension', () => {
    expect(LinkMark.name).toBe('link')
  })
  // 进一步的"rendered DOM attr 一致"验证由 PR-7 WYSIWYG 快照测试在编辑器实例上覆盖。
})
