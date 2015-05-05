// cocos-text-field
var inSceneView = function(renderContext, target) {
    return renderContext.sceneView && target && target._renderObjInScene;
};

var inGameView = function(target) {
    return target && target._renderObj;
};

RenderContext.prototype.getInputText = function (target) {
    if (inGameView(target)) {
       return target._renderObj.getString() ;
    }
    if (inSceneView(this, target)) {
        return target._renderObjInScene.getString() ;
    }
    return null;
};

RenderContext.prototype.setInputText = function (target) {
    if (inGameView(target)) {
        this.game.setEnvironment();
        target._renderObj.setString(target._text);
    }
    // @ifdef EDITOR
    if (inSceneView(this, target)) {
        this.sceneView.game.setEnvironment();
        target._renderObjInScene.setString(target._text);
    }
    // @endif
};

RenderContext.prototype.setFontName = function (target) {
    var fontName = "";
    if (target.fontType !== Fire.FontType.Custom){
        fontName = Fire.FontType[target.fontType].toLowerCase();
    }
    else{
        fontName = target.customFontType;
    }
    if (inGameView(target)) {
        this.game.setEnvironment();
        target._renderObj.setFontName(fontName);
    }
    // @ifdef EDITOR
    if (inSceneView(this, target)) {
        this.sceneView.game.setEnvironment();
        target._renderObjInScene.setFontName(fontName);
    }
    // @endif
};

RenderContext.prototype.setFontSize = function (target) {
    if (inGameView(target)) {
        this.game.setEnvironment();
        target._renderObj.setFontSize(target._size);
    }
    // @ifdef EDITOR
    if (inSceneView(this, target)) {
        this.sceneView.game.setEnvironment();
        target._renderObjInScene.setFontSize(target._size);
    }
    // @endif
};

RenderContext.prototype.setTextColor = function (target) {
    if (inGameView(target)) {
        this.game.setEnvironment();
        target._renderObj.setFontColor(target._color.toCCColor());
    }
    // @ifdef EDITOR
    if (inSceneView(this, target)) {
        this.sceneView.game.setEnvironment();
        target._renderObjInScene.setFontColor(target._color.toCCColor());
    }
    // @endif
};

RenderContext.prototype.setMaxLength = function (target) {
    if (inGameView(target)) {
        this.game.setEnvironment();
        target._renderObj.setMaxLength(target._maxLength);
    }
    // @ifdef EDITOR
    if (inSceneView(this, target)) {
        this.sceneView.game.setEnvironment();
        target._renderObjInScene.setMaxLength(target._maxLength);
    }
    // @endif
};

RenderContext.prototype.setInputFlag = function (target) {
    if (inGameView(target)) {
        this.game.setEnvironment();
        target._renderObj.setInputFlag(target._fontFlagType);
    }
    // @ifdef EDITOR
    if (inSceneView(this, target)) {
        this.sceneView.game.setEnvironment();
        target._renderObjInScene.setInputFlag(target._fontFlagType);
    }
    // @endif
};

var createEditBox = function (target) {
    var node, fontSize, fontName = "";
    if (target.fontType !== Fire.FontType.Custom){
        fontName = Fire.FontType[target.fontType].toLowerCase();
    }
    else{
        fontName = target.customFontType;
    }
    if (! target.background) {
        Fire.error("Background does not allow empty");
        return null;
    }
    fontSize = cc.size(target.background.renderWidth, target.background.renderHeight);
    node = new cc.EditBox(fontSize, new cc.Scale9Sprite());
    node.setAnchorPoint(0, 1);
    node.setString(target._text);
    node.setFont(fontName, target._size);
    node.setFontColor(target._color.toCCColor());
    node.setLocalZOrder(-1);
    return node
};

var InputFieldDelegate = cc.EditBoxDelegate.extend({
    _target: null,
    _renderContext: null,
    ctor: function (renderContext, inputField) {
        this._target = inputField;
        this._renderContext = renderContext;
    },
    editBoxTextChanged: function (editBox, newText) {
        // @ifdef EDITOR
        if (inSceneView(this._renderContext, this._target)) {
            this._renderContext.sceneView.game.setEnvironment();
            this._target._renderObjInScene.setString(newText);
        }
        // @endif
    }
})

RenderContext.prototype.initInputField = function (target) {
    var node, delegate;
    var inGame = !(target.entity._objFlags & HideInGame);
    if (inGame) {
        this.game.setEnvironment();
        node = createEditBox(target);
        if (! node){
            return;
        }
        target._renderObj = node;
        node.setMaxLength(target._maxLength);
        delegate = new InputFieldDelegate(this ,target);
        node.setDelegate(delegate);
        target.entity._ccNode.addChild(node);
    }
    // @ifdef EDITOR
    if (this.sceneView) {
        this.sceneView.game.setEnvironment();
        node = createEditBox(target);
        if (! node){
            return;
        }
        target._renderObjInScene = node;
        target.entity._ccNodeInScene.addChild(node);
    }
    // @endif
};

RenderContext.prototype.getTextSize = function (target) {
    var inGame = !(target.entity._objFlags & HideInGame);
    var size = null;
    if (inGame && target._renderObj) {
        size = target._renderObj.getContentSize();
    }
    // @ifdef EDITOR
    else if (target._renderObjInScene) {
        size = target._renderObjInScene.getContentSize();
    }
    // @endif
    return size ? new Vec2(size.width, size.height) : Vec2.zero;
};

RenderContext.prototype.updateInputFieldTransform = RenderContext.prototype.updateTransform;
