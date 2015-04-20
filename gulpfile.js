﻿var Path = require('path');
//var fs = require('fs');
//var es = require('event-stream');
var del = require('del');

var gulp = require('gulp');
var concat = require('gulp-concat');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var rename = require('gulp-rename');
var uglify = require('gulp-uglifyjs');
var preprocess = require('gulp-preprocess');
//var qunit = require('gulp-qunit');
//var header = require('gulp-header');

var fb = require('gulp-fb');

var paths = {
    // source
    src: [
        "src/engine/CCBoot.js",
        "src/engine/CCDebugger.js",
        "src/engine/Base64Images.js",
        "src/engine/cocos2d/core/platform/CCClass.js",
        "src/engine/cocos2d/core/platform/CCCommon.js",
        "src/engine/cocos2d/core/cocoa/CCGeometry.js",
        "src/engine/cocos2d/core/platform/CCSAXParser.js",
        "src/engine/cocos2d/core/platform/CCLoaders.js",
        "src/engine/cocos2d/core/platform/CCConfig.js",
        "src/engine/cocos2d/core/platform/miniFramework.js",
        "src/engine/cocos2d/core/platform/CCMacro.js",
        "src/engine/cocos2d/core/platform/CCTypesWebGL.js",
        "src/engine/cocos2d/core/platform/CCTypesPropertyDefine.js",
        "src/engine/cocos2d/core/platform/CCTypes.js",
        "src/engine/cocos2d/core/platform/CCEGLView.js",
        "src/engine/cocos2d/core/platform/CCScreen.js",
        "src/engine/cocos2d/core/platform/CCVisibleRect.js",

        "src/engine/cocos2d/core/platform/CCInputManager.js",
        "src/engine/cocos2d/core/platform/CCInputExtension.js",

        "src/engine/cocos2d/core/cocoa/CCAffineTransform.js",
        "src/engine/cocos2d/core/support/CCPointExtension.js",
        "src/engine/cocos2d/core/support/CCVertex.js",
        "src/engine/cocos2d/core/support/TransformUtils.js",
        "src/engine/cocos2d/core/event-manager/CCTouch.js",

        "src/engine/cocos2d/core/event-manager/CCEvent.js",
        "src/engine/cocos2d/core/event-manager/CCEventListener.js",
        "src/engine/cocos2d/core/event-manager/CCEventManager.js",
        "src/engine/cocos2d/core/event-manager/CCEventExtension.js",

        "src/engine/cocos2d/core/renderer/RendererCanvas.js",
        "src/engine/cocos2d/core/renderer/RendererWebGL.js",

        "src/engine/cocos2d/core/base-nodes/BaseNodesPropertyDefine.js",
        "src/engine/cocos2d/core/base-nodes/CCNode.js",
        "src/engine/cocos2d/core/base-nodes/CCNodeCanvasRenderCmd.js",
        "src/engine/cocos2d/core/base-nodes/CCNodeWebGLRenderCmd.js",

        "src/engine/cocos2d/core/textures/TexturesWebGL.js",
        "src/engine/cocos2d/core/textures/TexturesPropertyDefine.js",
        "src/engine/cocos2d/core/textures/CCTexture2D.js",
        "src/engine/cocos2d/core/textures/CCTextureCache.js",

        "src/engine/cocos2d/core/scenes/CCScene.js",
        "src/engine/cocos2d/core/scenes/CCLoaderScene.js",

        "src/engine/cocos2d/core/layers/CCLayer.js",
        "src/engine/cocos2d/core/layers/CCLayerCanvasRenderCmd.js",
        "src/engine/cocos2d/core/layers/CCLayerWebGLRenderCmd.js",

        "src/engine/cocos2d/core/sprites/SpritesPropertyDefine.js",
        "src/engine/cocos2d/core/sprites/CCSprite.js",
        "src/engine/cocos2d/core/sprites/CCSpriteCanvasRenderCmd.js",
        "src/engine/cocos2d/core/sprites/CCSpriteWebGLRenderCmd.js",
        "src/engine/cocos2d/core/sprites/CCSpriteBatchNode.js",
        "src/engine/cocos2d/core/sprites/CCSpriteBatchNodeCanvasRenderCmd.js",
        "src/engine/cocos2d/core/sprites/CCSpriteBatchNodeWebGLRenderCmd.js",
        "src/engine/cocos2d/core/sprites/CCAnimation.js",
        "src/engine/cocos2d/core/sprites/CCAnimationCache.js",
        "src/engine/cocos2d/core/sprites/CCSpriteFrame.js",
        "src/engine/cocos2d/core/sprites/CCSpriteFrameCache.js",

        "src/engine/cocos2d/core/CCConfiguration.js",

        "src/engine/cocos2d/core/CCDirector.js",
        "src/engine/cocos2d/core/CCDirectorWebGL.js",

        "src/engine/cocos2d/core/CCScheduler.js",

        "src/engine/cocos2d/core/labelttf/LabelTTFPropertyDefine.js",
        "src/engine/cocos2d/core/labelttf/CCLabelTTF.js",
        "src/engine/cocos2d/core/labelttf/CCLabelTTFCanvasRenderCmd.js",
        "src/engine/cocos2d/core/labelttf/CCLabelTTFWebGLRenderCmd.js",

        "src/engine/cocos2d/audio/CCAudio.js",

        "src/engine/cocos2d/kazmath/utility.js",
        "src/engine/cocos2d/kazmath/vec2.js",
        "src/engine/cocos2d/kazmath/vec3.js",
        "src/engine/cocos2d/kazmath/vec4.js",
        "src/engine/cocos2d/kazmath/ray2.js",
        "src/engine/cocos2d/kazmath/mat3.js",
        "src/engine/cocos2d/kazmath/mat4.js",
        "src/engine/cocos2d/kazmath/plane.js",
        "src/engine/cocos2d/kazmath/quaternion.js",
        "src/engine/cocos2d/kazmath/aabb.js",
        "src/engine/cocos2d/kazmath/gl/mat4stack.js",
        "src/engine/cocos2d/kazmath/gl/matrix.js",

        "src/engine/cocos2d/shaders/CCShaders.js",
        "src/engine/cocos2d/shaders/CCShaderCache.js",
        "src/engine/cocos2d/shaders/CCGLProgram.js",
        "src/engine/cocos2d/shaders/CCGLStateCache.js",

        "src/cocos-render-context.js",
    ],
    index: 'src/index.js',

    // output
    output: 'bin/',
    output_dev: 'bin/dev/runtime.js',
    output_min: 'bin/min/runtime.js',
    output_player_dev: 'runtime.player.dev.js',
    output_player: 'runtime.player.js'
};

/////////////////////////////////////////////////////////////////////////////
// build
/////////////////////////////////////////////////////////////////////////////

gulp.task('js-dev', function() {
    return gulp.src(paths.src)
        .pipe(jshint({
           multistr: true,
           smarttabs: false,
           loopfunc: true,
        }))
        //.pipe(jshint.reporter(stylish))
        .pipe(concat(Path.basename(paths.output_dev)))
        .pipe(fb.wrapModule(paths.index))
        .pipe(preprocess({context: { EDITOR: true, DEBUG: true, DEV: true }}))
        .pipe(gulp.dest(Path.dirname(paths.output_dev)))
        ;
});

gulp.task('js-min', function() {
    return gulp.src(paths.src)
        .pipe(concat(Path.basename(paths.output_min)))
        .pipe(fb.wrapModule(paths.index))
        .pipe(preprocess({context: { EDITOR: true, DEV: true }}))
        .pipe(uglify({
            compress: {
                dead_code: false,
                unused: false
            }
        }))
        .pipe(gulp.dest(Path.dirname(paths.output_min)))
        ;
});

gulp.task('js-player-dev', function() {
    return gulp.src(paths.src)
        .pipe(concat(paths.output_player_dev))
        .pipe(fb.wrapModule(paths.index))
        .pipe(preprocess({context: { PLAYER: true, DEBUG: true, DEV: true }}))
        .pipe(gulp.dest(paths.output))
        ;
});

gulp.task('js-player', function() {
    return gulp.src(paths.src)
        .pipe(concat(paths.output_player))
        .pipe(fb.wrapModule(paths.index))
        .pipe(preprocess({context: { PLAYER: true }}))
        .pipe(gulp.dest(paths.output))
        ;
});

gulp.task('js-all', ['js-dev', 'js-min', 'js-player-dev', 'js-player']);

////////////////////////////////////////////////////
// clean
///////////////////////////////////////////////////

gulp.task('clean', function(cb) {
    del('bin/', cb);
});

//// doc
//gulp.task('export-api-syntax', function (done) {
//
//    // 默认所有 engine 模块都在 Fire 下面
//    var DefaultModuleHeader = "/**\n" +
//                              " * @module Fire\n" +
//                              " * @class Fire\n" +
//                              " */\n";
//    var dest = '../../utils/api/engine';
//
//    del(dest + '/**/*', { force: true }, function (err) {
//        if (err) {
//            done(err);
//            return;
//        }
//
//        gulp.src(paths.src)
//            .pipe(header(DefaultModuleHeader))
//            .pipe(gulp.dest(dest))
//            .on('end', done);
//    });
//});

// watch
gulp.task('watch', function() {
    gulp.watch(paths.src.concat(paths.index), ['default']).on ( 'error', gutil.log );
});

// tasks
gulp.task('min', ['js-min', 'js-player-dev', 'js-player']);
gulp.task('dev', ['js-dev', 'js-player-dev', 'js-player']);
gulp.task('default', ['dev', 'min']);