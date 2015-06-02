// cocos-text-field
RenderContext.prototype.getInputText = function (target) {
    var obj = this.getRenderObj(target);
    if (obj) {
       return obj.getString();
    }
    return '';
};

RenderContext.prototype.setInputText = function (target, text) {
    var obj = this.getRenderObj(target);
    if (obj) {
        obj.setString(text);
    }
    // @ifdef EDITOR
    obj = this.getRenderObjInScene(target);
    if (obj) {
        obj.setString(text);
    }
    // @endif
};

RenderContext.prototype.setPlaceHolder = function (target) {
    var obj = this.getRenderObj(target);
    if (obj) {
        obj.setPlaceHolder(target._placeHolder);
    }
    // @ifdef EDITOR
    obj = this.getRenderObjInScene(target);
    if (obj) {
        obj.setPlaceHolder(target._placeHolder);
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
    var obj = this.getRenderObj(target);
    if (obj) {
        obj.setFontName(fontName);
        obj.setPlaceholderFontName(fontName);
    }
    // @ifdef EDITOR
    obj = this.getRenderObjInScene(target);
    if (obj) {
        obj.setFontName(fontName);
        obj.setPlaceholderFontName(fontName);
    }
    // @endif
};

RenderContext.prototype.setFontSize = function (target) {
    var obj = this.getRenderObj(target);
    if (obj) {
        obj.setFontSize(target._size);
        obj.setPlaceholderFontSize(target._size);
    }
    // @ifdef EDITOR
    obj = this.getRenderObjInScene(target);
    if (obj) {
        obj.setFontSize(target._size);
        obj.setPlaceholderFontSize(target._size);
    }
    // @endif
};

RenderContext.prototype.setTextColor = function (target) {
    var textColor = target._color.toCCColor();
    var obj = this.getRenderObj(target);
    if (obj) {
        obj.setFontColor(textColor);
        obj.setPlaceholderFontColor(textColor);
    }
    // @ifdef EDITOR
    obj = this.getRenderObjInScene(target);
    if (obj) {
        obj.setFontColor(textColor);
        obj.setPlaceholderFontColor(textColor);
    }
    // @endif
};

RenderContext.prototype.setMaxLength = function (target) {
    var obj = this.getRenderObj(target);
    if (obj) {
        obj.setMaxLength(target._maxLength);
    }
    // @ifdef EDITOR
    obj = this.getRenderObjInScene(target);
    if (obj) {
        obj.setMaxLength(target._maxLength);
    }
    // @endif
};

RenderContext.prototype.setInputFlag = function (target) {
    var obj = this.getRenderObj(target);
    if (obj) {
        obj.setInputFlag(target._fontFlagType);
    }
    // @ifdef EDITOR
    obj = this.getRenderObjInScene(target);
    if (obj) {
        obj.setInputFlag(target._fontFlagType);
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
    node.setPlaceHolder(target._placeHolder);
    node.setAnchorPoint(0, 1);
    //node.setString(target.text);
    node.setPlaceholderFont(fontName, target._size);
    node.setPlaceholderFontColor(target._color.toCCColor());
    node.setFont(fontName, target._size);
    node.setFontColor(target._color.toCCColor());
    node.setLocalZOrder(-1);
    return node;
};

// @ifdef EDITOR
var InputFieldDelegate = cc.EditBoxDelegate.extend({
    _target: null,
    _renderContext: null,
    ctor: function (renderContext, inputField) {
        this._target = inputField;
        this._renderContext = renderContext;
    },
    editBoxTextChanged: function (editBox, newText) {
        this._target.text = newText;
    }
});
// @endif

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
        // @ifdef EDITOR
        delegate = new InputFieldDelegate(this, target);
        node.setDelegate(delegate);
        // @endif
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
    var size = null;
    var obj = target._renderObj;
    if (obj) {
        size = obj.getContentSize();
    }
    // @ifdef EDITOR
    if (! size) {
        obj = target._renderObjInScene;
        if (obj) {
            size = obj.getContentSize();
        }
    }
    // @endif
    return size ? new Fire.Vec2(size.width, size.height) : Fire.Vec2.zero;
};

RenderContext.prototype.updateInputFieldTransform = RenderContext.prototype.updateTransform;
