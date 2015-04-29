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
    // @ifdef EDITOR
    else if (target._renderObjInScene) {
        w = target._renderObjInScene.width;
        h = target._renderObjInScene.height;
    }
    // @endif
    return new Vec2(w, h);
};

RenderContext.prototype.setText = function (target, newText) {
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

RenderContext.prototype.setAlign = function (target) {
    if (target._renderObj) {
        this.game.setEnvironment();
        target._renderObj.setAlignment(target.align);
    }
    // @ifdef EDITOR
    if (this.sceneView && target._renderObjInScene) {
        this.sceneView.game.setEnvironment();
        target._renderObjInScene.setAlignment(target.align);
    }
    // @endif
};

RenderContext.prototype.updateBitmapFont = function (target) {
    this.remove(target);
    this.addBitmapText(target);
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
    // @ifdef EDITOR
    if (this.sceneView) {
        this.sceneView.game.setEnvironment();
        node = new cc.LabelBMFont(target.text, info);
        target._renderObjInScene = node;
        target.entity._ccNodeInScene.addChild(node);
        node.setLocalZOrder(-1);
    }
    // @endif
};

RenderContext.prototype.updateBitmapTextTransform = RenderContext.prototype.updateTransform;
