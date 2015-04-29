
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
    node.setFontFillColor(info.fillColor);
    node.setHorizontalAlignment(info.hAlignment);
}

RenderContext.prototype.setTextStyle = function (target) {
    if (target._renderObj) {
        this.game.setEnvironment();
        _updateTextStyle(target, target._renderObj);
    }
    if (this.sceneView && target._renderObjInScene) {
        this.sceneView.game.setEnvironment();
        _updateTextStyle(target, target._renderObjInScene);
    }
};

RenderContext.prototype.setTextContent = function (target, newText) {
    if (target._renderObj) {
        this.game.setEnvironment();
        target._renderObj.setString(newText);
    }
    if (this.sceneView && target._renderObjInScene) {
        this.sceneView.game.setEnvironment();
        target._renderObjInScene.setString(newText);
    }
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
    if (this.sceneView) {
        this.sceneView.game.setEnvironment();
        node = new cc.LabelTTF(target.text);
        target._renderObjInScene = node;
        target.entity._ccNodeInScene.addChild(node);
    }

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
    else if (target._renderObjInScene) {
        w = target._renderObjInScene.width;
        h = target._renderObjInScene.height;
    }
    return new Vec2(w, h);
};

RenderContext.updateTextTransform = function (target, matrix) {
    var isGameView = Engine._curRenderContext === Engine._renderContext;

    var node;
    if (isGameView && target._renderObj) {
        node = target._renderObj;
    }
    else if (target._renderObjInScene) {
        node = target._renderObjInScene;
    }

    if (node){
        Engine._curRenderContext.game.setEnvironment();

        var rot = matrix.getRotation() * Math.R2D;
        // negate the rotation because our rotation transform not the same with cocos
        rot = -rot;
        var scale = matrix.getScale();
        var alpha = target._color.a * 255;

        node.setPosition(matrix.tx, matrix.ty);
        if (node._rotationX !== rot) {
            node.setRotation(rot);
        }
        if (node._scaleX !== scale.x || node._scaleY !== scale.y) {
            node.setScale(scale.x, scale.y);
        }
        if (node._realOpacity !== alpha) {
            node.setOpacity(alpha);
        }
    }
};
