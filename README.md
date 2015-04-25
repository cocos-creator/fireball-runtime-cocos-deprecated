为了方便开发，目前 build 好的 cocos2d 包提交到了 lib 目录下。当在 dev repo 下执行 `gulp build` 或 `gulp watch` 时，会从 lib 里面加载最新的 cocos2d。

如果修改了这个 repo 的 src/engine 下的源码，需要手工在这个 repo 下执行 `gulp build-cocos2d`，才会更新 lib 下的脚本。
