import type { DownHierarchy } from '$v3/init/formatter/update/types'
export let mock = {
  url: 'https://youtu.be/hOfRN0KihOU?t=100&end=200',
}

export const blockChildren = async (
  uid: s,
  withChildren = false,
  withParents = false
): Promise<DownHierarchy[][] | null> => {
  return [
    [
      {
        open: false,
        order: 0,
        string: mock.url,
        uid,
      },
    ],
  ]
}
