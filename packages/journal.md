/packages/sandbox
- bugs
	- follower resize on desktop must readjust to the pivot origin
	- when changing followers, adjust to the minimum size
- todo
	- remove ui in mini mode, add floating controls when interacting with the mini player
	- when there is no available follower, default to the url mode

/packages/yt-gif x /packages/sandbox follower + observer
	- locate the target
	- once it's visible, start the destruction observer
	- style the target
	- create the portalFollower and set it follow the target
	- once the target is destroyed, unlink the portalFollower