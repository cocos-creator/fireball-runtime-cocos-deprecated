//// the director
//Runtime.director = null;
//
//// the game
//Runtime.game = null;

//Runtime.sceneNode = null;

Runtime.init = function () {
    //this.sceneNode = new cc.Scene();
    //this.game = Engine._renderContext.game;
    //this.director = this.game.director;
    // @ifdef EDITOR
    //this.director.runScene(Runtime.sceneNode);
    // @endif
};

Runtime.animate = function () {
    // update cocos logic to tick cocos animations
    var dt = Time.deltaTime;
    var game = Engine._renderContext.game;
    game.setEnvironment();
    game.director._scheduler.update(dt);
    // @ifdef EDITOR
    game = Engine._renderContext.sceneView.game;
    game.setEnvironment();
    game.director._scheduler.update(dt);
    // @endif
};

//Runtime.render = function (renderContext) {
//    Engine._scene.render(renderContext || Engine._renderContext);
//};

// @ifdef EDITOR
var animateAfterRender = false;
Runtime.animateAfterRender = function () {
    animateAfterRender = true;
};

var animateInNextTick = false;
Runtime.animateInNextTick = function () {
    animateInNextTick = true;
};

Runtime.tickInEditMode = function (renderContext) {
    if (! Engine._isPlaying) {
        if (renderContext && renderContext.isSceneView) {
            var now = Fire._Ticker.now();
            Fire.Time._update(now, false, 1 / 30);
            if (Engine._editorAnimating || animateInNextTick) {
                //animateInNextTick = Engine._editorAnimating;
                animateInNextTick = false;
                this.animate();
            }
        }
    }
    else {
        animateInNextTick = false;
    }

    this.render(renderContext);

    if (animateAfterRender) {
        this.animateInNextTick();
        animateAfterRender = false;
    }
};
// @endif
