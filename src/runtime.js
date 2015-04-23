//// the director
//Runtime.director = null;
//
//// the game
//Runtime.game = null;

//Runtime.sceneNode = null;

Runtime.render = function (renderContext) {
    renderContext = renderContext || Engine._renderContext;
    renderContext.game.frameRun();
};

Runtime.init = function () {
    //this.sceneNode = new cc.Scene();
    //this.game = Engine._renderContext.game;
    //this.director = this.game.director;
    // @ifdef EDITOR
    //this.director.runScene(Runtime.sceneNode);
    // @endif
};
