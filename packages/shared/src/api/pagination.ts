export interface PageMeta {
  page: number
  page_size: number
  total_items: number
  item_count: number
  total_pages: number
}

export interface PageResult<T> {
  items: T[]
  meta: PageMeta
}

export interface PageQuery {
  page?: number
  page_size?: number
}
