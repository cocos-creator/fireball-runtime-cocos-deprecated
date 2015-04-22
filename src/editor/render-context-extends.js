RenderContext.createSceneRenderCtx = function (width, height, canvas, transparent) {
    var sceneCtx = new RenderContext (width, height, canvas, transparent);

    var foreground = new cc.Layer();
    var gameRoot = new cc.Layer();
    var background = new cc.Layer();
    sceneCtx.stage.addChild(background, 0, 0);
    sceneCtx.stage.addChild(gameRoot, 1, 1);
    sceneCtx.stage.addChild(foreground, 2, 2);
    sceneCtx.root = gameRoot;
    sceneCtx.isSceneView = true;

    Engine._renderContext.sceneView = sceneCtx;
    return sceneCtx;
};

RenderContext.prototype.getForegroundNode = function () {
    return this.stage.children[this.stage.children.length - 1];
};

RenderContext.prototype.getBackgroundNode = function () {
    return this.stage.children[0];
};
