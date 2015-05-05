function _getTextInfo (target) {
    if (target) {
        var info = {};
        if (target.fontType !== Fire.FontType.Custom){
            info.fontName = Fire.FontType[target.fontType].toLowerCase();
        }
        else{
            info.fontName = target.customFontType;
        }
        info.fontSize = target.size;
        info.dimensions = null;
        info.hAlignment = target.align;
        info.vAlignment = null;

        info.fillColor = target.color.toCCColor();
        return info;
    }
    return null;
};

var _updateTextStyle = function (target, node) {
    var info = _getTextInfo(target);
    node.setFontName(info.fontName);
    node.setFontSize(info.fontSize);
    node.color = info.fillColor;
    node.setOpacity(target.color.a * 255);
    node.setHorizontalAlignment(info.hAlignment);
}

RenderContext.prototype.setTextStyle = function (target) {
    if (target._renderObj) {
        this.game.setEnvironment();
        _updateTextStyle(target, target._renderObj);
    }
    // @ifdef EDITOR
    if (this.sceneView && target._renderObjInScene) {
        this.sceneView.game.setEnvironment();
        _updateTextStyle(target, target._renderObjInScene);
    }
    // @endif
};

RenderContext.prototype.setTextContent = function (target, newText) {
    if (target._renderObj) {
        this.game.setEnvironment();
        target._renderObj.setString(newText);
    }
    // @ifdef EDITOR
    if (this.sceneView && target._renderObjInScene) {
        this.sceneView.game.setEnvironment();
        target._renderObjInScene.setString(newText);
    }
    // @endif
};

RenderContext.prototype.addText = function (target) {
    var info = _getTextInfo(target);
    if (!info){
        return;
    }
    var node;
    var inGame = !(target.entity._objFlags & HideInGame);
    if (inGame) {
        this.game.setEnvironment();
        node = new cc.LabelTTF(target.text);
        node.setAnchorPoint(0, 1);
        target._renderObj = node;
        target.entity._ccNode.addChild(node);
    }
    // @ifdef EDITOR
    if (this.sceneView) {
        this.sceneView.game.setEnvironment();
        node = new cc.LabelTTF(target.text);
        node.setAnchorPoint(0, 1);
        target._renderObjInScene = node;
        target.entity._ccNodeInScene.addChild(node);
    }
    // @endif
    if (node) {
        this.setTextStyle(target);
        node.setLocalZOrder(-1);
    }
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

RenderContext.prototype.updateTextTransform = RenderContext.prototype.updateTransform;

