var Path = require('path');
//var fs = require('fs');
var es = require('event-stream');
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
        "src/runtime.js",
        "src/extends.js",
        "src/cocos-render-context.js",
        "src/cocos-bitmap-font.js",
        "src/cocos-text.js",
        "src/cocos-input-field.js",
    ],
    editor: [
        // modules in editor only
        'src/editor/render-context-extends.js',
        'src/editor/graphics.js',
    ],
    index: 'src/index.js',

    // output
    output: 'bin/',
    output_dev: 'bin/dev/runtime.js',
    output_min: 'bin/min/runtime.js',
    output_player_dev: 'runtime.player.dev.js',
    output_player: 'runtime.player.js',

    // engine
    engine: {
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

            "src/engine/cocos2d/labels/CCLabelBMFont.js",
            "src/engine/cocos2d/labels/CCLabelBMFontCanvasRenderCmd.js",
            "src/engine/cocos2d/labels/CCLabelBMFontWebGLRenderCmd.js",

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

            "src/engine/cocos2d/core/CCActionManager.js",
            "src/engine/cocos2d/core/platform/CCEGLView.js",
            "src/engine/extensions/gui/control-extension/CCControl.js",
            "src/engine/extensions/gui/control-extension/CCInvocation.js",
            "src/engine/extensions/gui/control-extension/CCScale9Sprite.js",
            "src/engine/extensions/gui/control-extension/CCScale9SpriteCanvasRenderCmd.js",
            "src/engine/extensions/gui/control-extension/CCScale9SpriteWebGLRenderCmd.js",
            "src/engine/extensions/gui/control-extension/CCControlButton.js",
            "src/engine/extensions/gui/control-extension/CCScale9Sprite.js",
            "src/engine/extensions/gui/control-extension/CCScale9SpriteCanvasRenderCmd.js",
            "src/engine/extensions/gui/control-extension/CCScale9SpriteWebGLRenderCmd.js",
            "src/engine/extensions/editbox/CCdomNode.js",
            "src/engine/extensions/editbox/CCEditBox.js",

            "src/engine/extensions/spine/Spine.js",
            "src/engine/extensions/spine/CCSkeleton.js",
            "src/engine/extensions/spine/CCSkeletonCanvasRenderCmd.js",
            "src/engine/extensions/spine/CCSkeletonWebGLRenderCmd.js",
            "src/engine/extensions/spine/CCSkeletonAnimation.js",

            "src/engine/cocos2d/particle/CCParticleBatchNode.js",
            "src/engine/cocos2d/particle/CCParticleBatchNodeCanvasRenderCmd.js",
            "src/engine/cocos2d/particle/CCParticleBatchNodeWebGLRenderCmd.js",
            "src/engine/cocos2d/particle/CCParticleSystem.js",
            "src/engine/cocos2d/particle/CCParticleSystemCanvasRenderCmd.js",
            "src/engine/cocos2d/particle/CCParticleSystemWebGLRenderCmd.js",
        ],
        src_editor_extends: [
            "src/engine/cocos2d/shape-nodes/CCDrawNode.js",
            "src/engine/cocos2d/shape-nodes/CCDrawNodeCanvasRenderCmd.js",
            "src/engine/cocos2d/shape-nodes/CCDrawNodeWebGLRenderCmd.js",
            "src/engine/cocos2d/core/CCDrawingPrimitivesCanvas.js",
            "src/engine/cocos2d/core/CCDrawingPrimitivesWebGL.js"
        ],
        output_min: 'lib/cocos2d.js',
        output_dev: 'lib/cocos2d.dev.js',
        output_editor_min: 'lib/cocos2d.editor.js',
        output_editor_dev: 'lib/cocos2d.editor.dev.js'
    }
};

/////////////////////////////////////////////////////////////////////////////
// build
/////////////////////////////////////////////////////////////////////////////

gulp.task('js-dev', function() {
    return gulp.src(paths.src.concat(paths.editor))
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
    return gulp.src(paths.src.concat(paths.editor))
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

///////////////////////////////////////////////////
// compile cocos2d
///////////////////////////////////////////////////

gulp.task('build-cocos2d', function () {
    var runtime = gulp.src(paths.engine.src.concat('!**/*WebGL*'))
        .pipe(concat(Path.basename(paths.engine.output_dev)))
        .pipe(gulp.dest(Path.dirname(paths.engine.output_dev)))
        .pipe(uglify({
            //compress: {
            //    dead_code: false,
            //    unused: false
            //}
        }))
        .pipe(rename(Path.basename(paths.engine.output_min)))
        .pipe(gulp.dest(Path.dirname(paths.engine.output_min)));

    var editorExtends = gulp.src(paths.engine.src_editor_extends.concat('!**/*WebGL*'))
        .pipe(concat(Path.basename(paths.engine.output_editor_dev)))
        .pipe(gulp.dest(Path.dirname(paths.engine.output_editor_dev)))
        .pipe(uglify({}))
        .pipe(rename(Path.basename(paths.engine.output_editor_min)))
        .pipe(gulp.dest(Path.dirname(paths.engine.output_editor_min)));

    return es.merge(runtime, editorExtends);
});

gulp.task('cp-cocos2d', function () {
    var name_editor = 'cocos2d.js';
    var name_editor_extends = 'cocos2d.extends.js';
    var name_min = 'cocos2d.min.js';
    var name_dev = 'cocos2d.dev.js';

    // 不论 dev 还是 min 的编辑器都要有两套 cocos 用于输出，再加编辑器的核心库，还有编辑器的扩展库

    var devStream = gulp.src(paths.engine.output_dev)
        .pipe(rename(name_editor))
        .pipe(gulp.dest(Path.dirname(paths.output_dev)))
        .pipe(rename(name_dev))
        .pipe(gulp.dest(Path.dirname(paths.output_dev)))
        .pipe(gulp.dest(Path.dirname(paths.output_min)));

    var minStream = gulp.src(paths.engine.output_min)
        .pipe(rename(name_editor))
        .pipe(gulp.dest(Path.dirname(paths.output_min)))
        .pipe(rename(name_min))
        .pipe(gulp.dest(Path.dirname(paths.output_dev)))
        .pipe(gulp.dest(Path.dirname(paths.output_min)));

    var editorExtendsDev = gulp.src(paths.engine.output_editor_dev)
        .pipe(rename(name_editor_extends))
        .pipe(gulp.dest(Path.dirname(paths.output_dev)));

    var editorExtendsMin = gulp.src(paths.engine.output_editor_min)
        .pipe(rename(name_editor_extends))
        .pipe(gulp.dest(Path.dirname(paths.output_min)));

    return es.merge(devStream, minStream, editorExtendsDev, editorExtendsMin);
});

///////////////////////////////////////////////////
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
    gulp.watch(paths.src.concat(paths.index, paths.editor), ['default']).on ( 'error', gutil.log );
    gulp.watch([paths.engine.output_dev, paths.engine.output_min], ['cp-cocos2d']).on ( 'error', gutil.log );
});

// tasks
gulp.task('min', ['js-min', 'js-player-dev', 'js-player', 'cp-cocos2d']);
gulp.task('dev', ['js-dev', 'js-player-dev', 'js-player', 'cp-cocos2d']);
gulp.task('default', ['dev', 'min']);
