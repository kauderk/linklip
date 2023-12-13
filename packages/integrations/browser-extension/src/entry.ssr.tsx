// qwik complains if this file is missing

import type { RenderToStreamOptions } from '@builder.io/qwik/server'
import { renderToStream } from '@builder.io/qwik/server'
import { manifest } from '@qwik-client-manifest'

export default function (opts: RenderToStreamOptions) {
  return renderToStream(
    <>
      <head>
        <link rel="icon" href="/icons/logo.ico" type="image/x-icon" />
        <title>Mini Qwik - Loader</title>
      </head>
      <body>Hello World</body>
    </>,
    {
      manifest,
      ...opts,
      // Use container attributes to set attributes on the html tag.
      containerAttributes: {
        lang: 'en-us',
        ...opts.containerAttributes,
      },
    }
  )
}
