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
