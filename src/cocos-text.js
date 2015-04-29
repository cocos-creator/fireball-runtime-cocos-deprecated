function _getTextInfo (target) {
    if (target) {
        var info = {};
        if (target.fontType !== Fire.Text.FontType.Custom){
            info.fontName = Fire.Text.FontType[target.fontType].toLowerCase();
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
        target._renderObj = node;
        target.entity._ccNode.addChild(node);
    }
    // @ifdef EDITOR
    if (this.sceneView) {
        this.sceneView.game.setEnvironment();
        node = new cc.LabelTTF(target.text);
        target._renderObjInScene = node;
        target.entity._ccNodeInScene.addChild(node);
    }
    // @endif
    if (node) {
        node.anchorX = 0;
        node.anchorY = 1;
        this.setTextStyle(target);
        node.setLocalZOrder(-1);
    }
};

RenderContext.prototype.getTextSize = function (target) {
    var inGame = !(target.entity._objFlags & HideInGame);
    var w = 0, h = 0;
    if (inGame && target._renderObj) {
        w = target._renderObj.width;
        h = target._renderObj.height;

    }
    // @ifdef EDITOR
    else if (target._renderObjInScene) {
        w = target._renderObjInScene.width;
        h = target._renderObjInScene.height;
    }
    // @endif
    return new Vec2(w, h);
};

RenderContext.prototype.updateTextTransform = RenderContext.prototype.updateTransform;

