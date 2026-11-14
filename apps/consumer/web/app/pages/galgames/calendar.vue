<script setup lang="ts">
  import type { GalgamesCalendarPageData } from '~~/server/api/pages/galgames/calendar.get'
  import { calendarBff, calendarRoute, readCalendarQuery } from '~/features/galgame/calendar'

  defineOptions({ name: 'GalgamesCalendarPage' })
  definePageMeta({ container: 'full', scrollToTop: true })

  const route = useRoute()
  const router = useRouter()
  const month = computed(() => readCalendarQuery(route.query))
  const request = computed(() => calendarBff(month.value))
  const { data, pending } = await useHikariApiData<GalgamesCalendarPageData>(request, {
    fatal: true,
    watch: [request],
  })

  function update(next: string) {
    const current = data.value?.calendar.today.slice(0, 7)
    void router.push(calendarRoute(next === current ? undefined : next))
  }

  useHikariSeoMeta({
    title: 'Galgame 发售日历',
    headerTitle: 'Galgame',
    description: '按月查看 Galgame 的发售日程，新作与即将发售的作品一目了然！',
  })
</script>

<template>
  <GalgameCalendarPage
    v-if="data"
    :calendar="data.calendar"
    :month="month ?? data.calendar.today.slice(0, 7)"
    :pending="pending"
    @update="update"
  />
</template>
