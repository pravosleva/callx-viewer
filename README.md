# Callx-Viewer

## About

This is simple audioplayer for mp3 tracks (all mp3 should be put to `./test-audio` directory).
Can be searched by substring in file name string.
Based on [jPlayer](http://jplayer.org/latest/demo-02-jPlayerPlaylist/?theme=0).

## Easy start

```
npm install
node index.js
```

Will be started locally on :8080.

## TODO

- [ ] GET request by `_globalGETForRemoveFileFn (fileName:String)` was not realized yet.
- [ ] Back-end function to remove the file. This function should receive the fileName as argument.
