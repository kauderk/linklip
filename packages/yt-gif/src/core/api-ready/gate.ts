import { createTask } from '$lib/utils/task'
import { CreateXload } from '$v3/lib/helpers'

export function YTApiPromise(url = 'https://www.youtube.com/player_api') {
  // https://stackoverflow.com/questions/52062169/uncaught-typeerror-yt-player-is-not-a-constructor
  const task = createTask()
  if (window.YT?.Player) {
    task.resolve(undefined)
  } else {
    CreateXload(url).then(() => window.YT.ready(task.resolve))
  }
  return task
}

export type ApiPromise = Awaited<ReturnType<typeof YTApiPromise>> | undefined
