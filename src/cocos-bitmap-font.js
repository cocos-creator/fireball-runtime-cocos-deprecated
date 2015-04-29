// unload asset
Fire.BitmapFont.prototype._onPreDestroy = function () {
    Fire.Asset.prototype._onPreDestroy.call(this);
};

var _getBitmapFontInfo = function (target) {
    var bitmapFont = target.bitmapFont;
    if (!bitmapFont) {
        return;
    }
    var info = {};
    info.alignment = target.align;
    info.imageOffset = null;
    info.width = null;
    info.image = bitmapFont.texture.image;
    info.config = {
        commonHeight: bitmapFont.lineHeight,
        atlasName: bitmapFont.atlasName
    };
    //char
    var fontDefDictionary = info.config.fontDefDictionary = {};
    var charInfos = bitmapFont.charInfos, len = charInfos.length;
    for (var i = 0; i < len; i++) {
        var charInfo = charInfos[i];
        var id = charInfo.id;
        fontDefDictionary[id] = {
            rect: { x: charInfo.x, y: charInfo.y, width: charInfo.width, height: charInfo.height },
            xOffset: charInfo.xOffset,
            yOffset : charInfo.yOffset,
            xAdvance: charInfo.xAdvance
        };
    }
    // kerning
    var kerningDict = info.config.kerningDict = {};
    var kernings = bitmapFont.kernings;
    len = kernings.length;
    for (var j = 0; j < len; j++) {
        var kerning = kernings[j];
        kerningDict[kerning.first | (kerning.second & 0xffff)] = kerning.amount;
    }
    return info;
};

cc.LabelBMFont.prototype.initWithString = function (str, info) {
    if (!info) {
        return false;
    }
    var self = this;
    var text = str || "";

    self._config = info.config;
    var texture = new cc.Texture2D();
    texture.initWithElement(info.image);
    self._textureLoaded = true;

    if (self.initWithTexture(texture, text.length)) {
        self._alignment = info.alignment || cc.TEXT_ALIGNMENT_LEFT;
        self._imageOffset = info.imageOffset || cc.p(0, 0);
        self._width = (info.width === null) ? -1 : info.width;

        self._realOpacity = 255;
        self._realColor = cc.color(255, 255, 255, 255);

        self._contentSize.width = 0;
        self._contentSize.height = 0;

        self.setAnchorPoint(0, 1);

        this._renderCmd._initBatchTexture();

        self.setString(text, true);
        return true;
    }
    return false;
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

RenderContext.prototype.setText = function (target, newText) {
    if (target._renderObj) {
        this.game.setEnvironment();
        target._renderObj.setString(newText);
    }
    if (this.sceneView && target._renderObjInScene) {
        this.sceneView.game.setEnvironment();
        target._renderObjInScene.setString(newText);
    }
};

RenderContext.prototype.setAlign = function (target) {
    if (target._renderObj) {
        this.game.setEnvironment();
        target._renderObj.setAlignment(target.align);
    }
    if (this.sceneView && target._renderObjInScene) {
        this.sceneView.game.setEnvironment();
        target._renderObjInScene.setAlignment(target.align);
    }
};

RenderContext.prototype.updateBitmapFont = function (target) {
    this.remove(target);
    this.addBitmapText(target);
};

RenderContext.prototype.remove = function (target) {
    if (target._renderObj) {
        if (target._renderObj && target._renderObj.parent) {
            this.game.setEnvironment();
            target._renderObj.parent.removeChild(target._renderObj);
        }
        target._renderObj = null;
    }
    if (this.sceneView) {
        if (target._renderObjInScene && target._renderObjInScene.parent) {
            this.sceneView.game.setEnvironment();
            target._renderObjInScene.parent.removeChild(target._renderObjInScene);
        }
        target._renderObjInScene = null;
    }
};

RenderContext.prototype.addBitmapText = function (target) {
    var info = _getBitmapFontInfo(target);
    if (!info){
        return;
    }
    var node;
    var inGame = !(target.entity._objFlags & HideInGame);
    if (inGame) {
        this.game.setEnvironment();
        node = new cc.LabelBMFont(target.text, info);
        target._renderObj = node;
        target.entity._ccNode.addChild(node);
        node.setLocalZOrder(-1);
    }
    if (this.sceneView) {
        this.sceneView.game.setEnvironment();
        node = new cc.LabelBMFont(target.text, info);
        target._renderObjInScene = node;
        target.entity._ccNodeInScene.addChild(node);
        node.setLocalZOrder(-1);
    }
};

RenderContext.updateBitmapTextTransform = function (target, matrix) {
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
        var alpha = 255;

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