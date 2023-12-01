# Linklip Browser Extension


> Why not use vite development server? In my experience debuggers don't work with vite monorepos, so I use live server instead.

## Pre Requisites

<details>
<summary><bold>Find a way to load your scripts onto other domains</bold></summary>

##### This is only necessary for website with a Content-Security-Policy that block inline scripts.


Use a browser extension:	[Disable Content-Security-Policy](https://microsoftedge.microsoft.com/addons/detail/ecmfamimnofkleckfamjbphegacljmbp) 

__or__

<details>
<summary>Enable HTTPS for localhost</summary>

https://youtu.be/AYLCEONnw2c?t=623

```
https://github.com/FiloSottile/mkcert > mkcert.exe
cmd > mkcert -install
win+r > "mmc" > File > Add/Remove Snap-in > Certificates > Add > Computer account > Local computer > Finish > OK | Console Root > Trusted Root Certification Authorities > Certificates > mkcert DESKTOP-XXXXX ...
```

</details>

---


</details>


<br/>

Install the recommended vscode extensions like Live Server

You must change your host website in the `./vscode/launch.json` to your own page

## Development
Navigate to the debug tab and run the `Launch Chrome and attach Devtools` configuration

1. It will open a new MSEdge window
	
2. It will open a terminal and run the build script in watch mode

3. Navigate to `edge://extensions/` find and copy the extension id

	3.1 replace the ids in the bookmarks file `.packages/integrations/browser-extension/_config/bookmarks.json` with your own

	3.2 Navigate to `edge://settings/profiles/importBrowsingData` and import the bookmarks file

	3.3 Select import > Import from file > Favorites or Bookmarks Files

4. The `load` bookmark will reload the site if the extension is running, else it will mount it.

	4.1 You can modify it here: `./packages/integrations/browser-extension/_config/loadBookmarklet.js`


To exit close the debugger or run the task `StopBuild_LiveServer`

When the moment comes to use browser APIs, execute `pnpm run dev` in the `./packages/integrations/browser-extension` folder. It is powered by `@crxjs/vite-plugin`
