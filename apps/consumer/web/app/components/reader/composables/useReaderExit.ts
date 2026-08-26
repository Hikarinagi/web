/**
 * Leaving a reader has two different meanings and they must not be conflated.
 *
 * `exit` navigates to the work's detail page. `back` is the toolbar's back
 * affordance: when the reader was opened from somewhere in the app it pops that
 * entry, so the browser's own back button does not land the reader again — a
 * pushed detail page would leave `detail -> reader -> detail` on the stack.
 * Only a cold entry (deep link, refresh) has nothing to pop and falls back to
 * `exit`.
 */
export function useReaderExit(detailPath: () => string) {
  const router = useRouter()

  function exit() {
    void navigateTo(detailPath())
  }

  function back() {
    if (router.options.history.state.back) router.back()
    else exit()
  }

  return { back, exit }
}
