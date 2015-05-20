
/**
 * The render context implemented rely on cocos2d-js
 */
var RenderContext = (function () {

    /**
     * render context 将在 cocos 中维护同样的 scene graph，这样做主要是为之后的 clipping 和 culling 提供支持。
     * 这里采用空间换时间的策略，所有 entity 都有对应的 cc.Node。
     * 毕竟一般 dummy entity 不会很多，因此这样产生的冗余对象可以忽略。
     * 值得注意的是，sprite 等节点，被视为 entity 对应的 cc.Node 的子物体。
     *
     * 渲染排序采用 localZOrder 来设置。sprite 等节点的值都为 -1，这样父 entity 本身就能最先渲染。
     * 所有 node 的 localZOrder 都设置成和所属 entity 的 sibling index，localZOrder 在 entity 删除时并不进行更新，
     * 因此新增 entity 时不能直接以父 entity 的 childrenCount 来计算新的 localZOrder。
     * 另外，所有 scene node 的 localZOrder 和 game node 保持一致。
     *
     * @param {number} width
     * @param {number} height
     * @param {Canvas} [canvas]
     * @param {boolean} [transparent = false]
     */
    function RenderContext (width, height, canvas, transparent) {
        width = width || 800;
        height = height || 600;
        transparent = transparent || false;

        var self = this;

        this.game = new cc.Game({
            "width": width,
            "height": height,
            "debugMode" : 1,
            "showFPS" : false,
            "frameRate" : 60,
            "id" : canvas,
            "renderMode" : 1,       // 0: WebGL, 1:Canvas
            "jsList" : []
        }, function () {
            self.root = self.stage = new cc.Scene();
            this.view.setResolutionPolicy( cc.ResolutionPolicy.SHOW_ALL );
            this.director.runScene(self.stage);
        });
        this.game.run();
        this.game.pause();          // dont start main loop
        this.game.director.pause(); // dont update logic before rendering

        if (! emptyTexture) {
            this.game.setEnvironment();
            emptyTexture = new cc.SpriteFrame(new cc.Texture2D(), cc.rect());
        }

        //Engine.on('play', function () {
        //    if (Engine.isPaused) {
        //        //self.game.setEnvironment();
        //        //self.game.director.resume();
        //        //self.game.frameRun();
        //    }
        //    else {
        //        self.game.setEnvironment();
        //        self.game.director.resume();
        //    }
        //});
        //Engine.on('pause', function () {
        //    self.game.setEnvironment();
        //    self.game.director.pause();
        //});
        //Engine.on('resume', function () {
        //    self.game.setEnvironment();
        //    self.game.director.resume();
        //});
        //Engine.on('stop', function () {
        //    self.game.setEnvironment();
        //    self.game.director.pause();
        //});

        var antialias = false;

        // the shared render context that allows display the object which marked as Fire._ObjectFlags.HideInGame
        this.sceneView = null;

        this.isSceneView = false;

        // binded camera, if supplied the scene will always rendered by this camera
        this._camera = null;

        this.renderer = this.view = this.game.view;
    }

    var emptyTexture = null;

    // static

    RenderContext.initRenderer = function (renderer) {
        renderer._renderObj = null;
        renderer._renderObjInScene = null;
        renderer._tempMatrix = new Fire.Matrix23();
    };

    // properties

    Object.defineProperty(RenderContext.prototype, 'canvas', {
        get: function () {
            return this.game.canvas;
        }
    });

    Object.defineProperty(RenderContext.prototype, 'container', {
        get: function () {
            return this.game.container;
        }
    });

    Object.defineProperty(RenderContext.prototype, 'width', {
        get: function () {
            return this.size.x;
        },
        set: function (value) {
            this.size = v2(value, this.height);
        }
    });

    Object.defineProperty(RenderContext.prototype, 'height', {
        get: function () {
            return this.size.y;
        },
        set: function (value) {
            this.size = v2(this.width, value);
        }
    });

    Object.defineProperty(RenderContext.prototype, 'size', {
        get: function () {
            var winSize = this.game.director.getWinSize();
            return new Vec2(winSize.width, winSize.height);
        },
        set: function (value) {
            this.setDesignResolutionSize(value.x, value.y, this.game.view.getResolutionPolicy());
        }
    });

    Object.defineProperty(RenderContext.prototype, 'background', {
        set: function (value) {
            this.view.setBackgroundColor(value.toCCColor());
        }
    });

    Object.defineProperty(RenderContext.prototype, 'camera', {
        get: function () {
            return this._camera;
        },
        set: function (value) {
            this._camera = value;
            if (Fire.isValid(value)) {
                value.renderContext = this;
            }
        }
    });

    // functions

    RenderContext.prototype.getRenderObj = function (target) {
        if (target && target._renderObj) {
            this.game.setEnvironment();
            return target._renderObj;
        }
        return null;
    };

    RenderContext.prototype.getRenderObjInScene = function (target) {
        if (this.sceneView && target && target._renderObjInScene){
            this.sceneView.game.setEnvironment();
            return target._renderObjInScene;
        }
        return null;
    };

    RenderContext.prototype.onPreRender = function () {
        this.game.setEnvironment();
    };

    RenderContext.prototype.render = function () {
        this.game.frameRun();
    };

    RenderContext.prototype.setDesignResolutionSize = function(width, height, policy) {
        // Normal parent
        var parent = this.game.container.parentNode;
        if (!parent) {
            // No parent
            parent = this.game.container;
        }
        else {
            // Shadow dom parent
            if (parent.host) {
                parent = parent.host;
            }
        }
        this.view.setFrame(parent);
        this.view.setDesignResolutionSize(width, height, policy);
    };

    RenderContext.prototype.onRootEntityCreated = function (entity) {
        this.game.setEnvironment();
        var node = new cc.Node();
        entity._ccNode = node;
        node.setAnchorPoint(0, 1);
        var z = 0;
        if (Engine._canModifyCurrentScene) {
            this.game.setEnvironment();
            // attach node if created dynamically
            this.root.addChild(node);
            z = setMaxZOrder(node, this.root);
        }
        // @ifdef EDITOR
        if (this.sceneView) {
            this.sceneView.game.setEnvironment();
            node = new cc.Node();
            entity._ccNodeInScene = node;
            node.setAnchorPoint(0, 1);
            if (Engine._canModifyCurrentScene) {
                this.sceneView.game.setEnvironment();
                // attach node if created dynamically
                this.sceneView.root.addChild(node);
            }
            node.setLocalZOrder(z);
        }
        // @endif
    };

    RenderContext.prototype.onEntityRemoved = function (entity) {
        var node = entity._ccNode;
        if (node) {
            if (node.parent) {
                this.game.setEnvironment();
                node.parent.removeChild(node);
            }
            entity._ccNode = null;
        }
        // @ifdef EDITOR
        node = entity._ccNodeInScene;
        if (node) {
            if (node.parent) {
                this.sceneView.game.setEnvironment();
                node.parent.removeChild(node);
            }
            entity._ccNodeInScene = null;
        }
        // @endif
    };

    RenderContext.prototype.onEntityParentChanged = function (entity, oldParent) {
        this._setParentNode(entity._ccNode, entity._parent && entity._parent._ccNode);
        // @ifdef EDITOR
        if (this.sceneView) {
            this.sceneView._setParentNode(entity._ccNodeInScene, entity._parent && entity._parent._ccNodeInScene);
        }
        // @endif
    };

    // call after addChild
    function setMaxZOrder (node, parent) {
        var children = parent.getChildren();
        var z = 0;
        if (children.length >= 2) {
            var prevNode = children[children.length - 2];
            z = prevNode.getLocalZOrder() + 1;
        }
        node.setLocalZOrder(z);
        return z;
    }

    RenderContext.prototype._setParentNode = function (node, parent) {
        if (node) {
            this.game.setEnvironment();
            node.removeFromParent();
            parent = parent || this.root;
            parent.addChild(node);
            setMaxZOrder(node, parent);
        }
    };

    RenderContext.prototype.onEntityIndexChanged = function (entity, oldIndex, newIndex) {
        var siblings = entity._parent ? entity._parent._children : Engine._scene.entities;
        this.game.setEnvironment();
        var i = 0, len = siblings.length, sibling = null;
        for (; i < len; i++) {
            sibling = siblings[i];
            sibling._ccNode.setLocalZOrder(i);
        }
        // @ifdef EDITOR
        if (this.sceneView) {
            this.sceneView.game.setEnvironment();
            for (i = 0; i < len; i++) {
                sibling = siblings[i];
                var node = sibling._ccNodeInScene;
                if (node) {
                    node.setLocalZOrder(i);
                }
            }
        }
        // @endif
    };

    RenderContext.prototype.onSceneLaunched = function (scene) {
        // attach root nodes
        this._addToScene(scene);
        // @ifdef EDITOR
        if (this.sceneView) {
            this.sceneView._addToScene(scene);
        }
        // @endif
    };

    RenderContext.prototype._addToScene = function (scene) {
        this.game.setEnvironment();
        var entities = scene.entities;
        var i = 0, len = entities.length;
        for (; i < len; i++) {
            var node = this.isSceneView ? entities[i]._ccNodeInScene : entities[i]._ccNode;
            if (node) {
                //node.removeFromParent();
                if (! node.getParent()) {
                    this.root.addChild(node);
                }
                node.setLocalZOrder(i);
            }
        }
    };

    RenderContext.prototype.onSceneLoaded = function (scene) {
        this.game.setEnvironment();
        var entities = scene.entities;
        for (var i = 0, len = entities.length; i < len; i++) {
            this.onEntityCreated(entities[i], false);
        }
    };

    /**
     * create child nodes recursively
     * 这个方法假定parent存在
     * @param {Entity} entity - must have parent, and not scene gizmo
     */
    RenderContext.prototype._onChildEntityCreated = function (entity) {
        this.game.setEnvironment();
        var node = new cc.Node();
        entity._ccNode = node;
        node.setAnchorPoint(0, 1);
        entity._parent._ccNode.addChild(node);
        var z = setMaxZOrder(node, entity._parent._ccNode);
        // @ifdef EDITOR
        if (this.sceneView) {
            this.sceneView.game.setEnvironment();
            node = new cc.Node();
            entity._ccNodeInScene = node;
            node.setAnchorPoint(0, 1);
            entity._parent._ccNodeInScene.addChild(node);
            node.setLocalZOrder(z);
        }
        // @endif
        var children = entity._children;
        for (var i = 0, len = children.length; i < len; i++) {
            this._onChildEntityCreated(children[i]);
        }
    };

    RenderContext.prototype.onEntityCreated = function (entity, addToScene) {
        var z = 0;
        this.game.setEnvironment();
        var node = new cc.Node();
        entity._ccNode = node;
        node.setAnchorPoint(0, 1);
        if (entity._parent) {
            entity._parent._ccNode.addChild(node);
            z = setMaxZOrder(node, entity._parent._ccNode);
        }
        else if (addToScene) {
            this.root.addChild(node);
            z = setMaxZOrder(node, this.root);
        }
        // @ifdef EDITOR
        if (this.sceneView) {
            this.sceneView.game.setEnvironment();
            node = new cc.Node();
            entity._ccNodeInScene = node;
            node.setAnchorPoint(0, 1);
            if (entity._parent) {
                entity._parent._ccNodeInScene.addChild(node);
            }
            else if (addToScene) {
                this.sceneView.root.addChild(node);
            }
            node.setLocalZOrder(z);
        }
        // @endif

        var children = entity._children;
        for (var i = 0, len = children.length; i < len; i++) {
            this._onChildEntityCreated(children[i]);
        }
    };

    RenderContext.prototype._createNormalSprite = function (tex, parentNode) {
        this.game.setEnvironment();
        var sprite = new cc.Sprite(tex);
        sprite.setAnchorPoint(0, 1);
        parentNode.addChild(sprite, 0);
        sprite.setLocalZOrder(-1);
        return sprite;
    };

    RenderContext.prototype._addNormalSprite = function (target) {
        var tex = this.createTexture(target._sprite);
        var inGame = !(target.entity._objFlags & HideInGame);
        if (inGame) {
            target._renderObj = this._createNormalSprite(tex, target.entity._ccNode);
        }
        // @ifdef EDITOR
        if (this.sceneView) {
            //var texInScene = this.sceneView.createTexture(target._sprite);
            target._renderObjInScene =  this.sceneView._createNormalSprite(tex, target.entity._ccNodeInScene);
        }
        // @endif
    };

    RenderContext.prototype.updateImageType = function (target) {
        var isSlicedNode = target._renderObj instanceof cc.Scale9Sprite;
        var isSlicedSprite = target._imageType === Fire.ImageType.Sliced;
        if (isSlicedNode !== isSlicedSprite){
            this.remove(target);
        }
        this.addSprite(target);
    };

    RenderContext.prototype.addSprite = function (target) {
        if (! target._renderObj) {
            if (target._imageType === Fire.ImageType.Simple) {
                this._addNormalSprite(target);
            }
            else if (target._imageType === Fire.ImageType.Sliced) {
                this._addScale9Sprite(target);
            }
            this.updateColor(target);
            if (target._imageType === Fire.ImageType.Sliced) {
                this.updateSpriteSize(target);
            }
        }
    };

    RenderContext.prototype._createScale9Sprite = function (tex, capInsets, parentNode) {
        this.game.setEnvironment();
        var sprite = new cc.Scale9Sprite(tex, capInsets);
        sprite.setAnchorPoint(0, 1);
        parentNode.addChild(sprite, 0);
        sprite.setLocalZOrder(-1);
        return sprite;
    };

    RenderContext.prototype._getCapInsets = function (target)    {
        var capInsets = new cc.Rect();
        if (target._sprite) {
            capInsets.x = target._sprite.borderLeft;
            capInsets.y = target._sprite.borderTop;
            var size = target._sprite.borderRight + target._sprite.borderLeft;
            if (size > 0) {
                capInsets.width = (target._sprite.width - size);
            }
            else {
                capInsets.width = target._sprite.width;
            }
            size = target._sprite.borderTop + target._sprite.borderBottom;
            if (size > 0) {
                capInsets.height = (target._sprite.height - size);
            }
            else {
                capInsets.height = target._sprite.height;
            }
        }
        return capInsets;
    };

    RenderContext.prototype._addScale9Sprite = function (target) {
        var tex = this.createTexture(target._sprite);

        var capInsets = this._getCapInsets(target);

        var inGame = !(target.entity._objFlags & HideInGame);
        if (inGame) {
            target._renderObj = this._createScale9Sprite(tex, capInsets, target.entity._ccNode);
        }
        // @ifdef EDITOR
        if (this.sceneView) {
            target._renderObjInScene =  this.sceneView._createScale9Sprite(tex, capInsets, target.entity._ccNodeInScene);
        }
        // @endif
    };

    RenderContext.prototype.updateSpriteSize = function (target) {
        if (target._imageType === Fire.ImageType.Simple) {
            return;
        }
        if (target._renderObj) {
            this.game.setEnvironment();
            target._renderObj.width = target.renderWidth;
            target._renderObj.height = target.renderHeight;
        }
        if (target._renderObjInScene) {
            this.sceneView.game.setEnvironment();
            target._renderObjInScene.width = target.renderWidth;
            target._renderObjInScene.height = target.renderHeight;
        }
    };

    RenderContext.prototype.show = function (target, show) {
        if (target._renderObj) {
            this.game.setEnvironment();
            target._renderObj.visible = show;
        }
        if (target._renderObjInScene) {
            this.sceneView.game.setEnvironment();
            target._renderObjInScene.visible = show;
        }
    };

    RenderContext.prototype.remove = function (target) {
        if (target._renderObj) {
            if (target._renderObj && target._renderObj.parent) {
                this.game.setEnvironment();
                target._renderObj.parent.removeChild(target._renderObj);
            }
            target._renderObj = null;
        }
        // @ifdef EDITOR
        if (this.sceneView) {
            if (target._renderObjInScene && target._renderObjInScene.parent) {
                this.sceneView.game.setEnvironment();
                target._renderObjInScene.parent.removeChild(target._renderObjInScene);
            }
            target._renderObjInScene = null;
        }
        // @endif
    };

    RenderContext.prototype.updateColor = function (target) {
        var tint = target._color.toCCColor();
        var alpha = target._color.a * 255;
        if (target._renderObj) {
            this.game.setEnvironment();
            target._renderObj.setColor(tint);
            target._renderObj.setOpacity(alpha);
        }
        // @ifdef EDITOR
        if (this.sceneView && target._renderObjInScene) {
            this.sceneView.game.setEnvironment();
            target._renderObjInScene.setColor(tint);
            target._renderObjInScene.setOpacity(alpha);
        }
        if (!target._renderObj && !target._renderObjInScene) {
            Fire.error('' + target + ' must be added to render context first!');
        }
        // @endif
    };

    RenderContext.prototype._updateCapInsets = function (target) {
        var capInsets = this._getCapInsets(target);
        if (target._renderObj) {
            this.game.setEnvironment();
            target._renderObj.setCapInsets(capInsets);
        }
        // @ifdef EDITOR
        if (this.sceneView && target._renderObjInScene) {
            this.sceneView.game.setEnvironment();
            target._renderObjInScene.setCapInsets(capInsets);
        }
        if (!target._renderObj && !target._renderObjInScene) {
            Fire.error('' + target + ' must be added to render context first!');
        }
        // @endif
    };

    RenderContext.prototype.updateMaterial = function (target) {
        var tex = this.createTexture(target._sprite);
        if (target._renderObj) {
            this.game.setEnvironment();
            target._renderObj.setSpriteFrame(tex);
        }
        // @ifdef EDITOR
        if (target._renderObjInScene && this.sceneView) {
            this.sceneView.game.setEnvironment();
            //var texInScene = this.sceneView.createTexture(target._sprite);
            target._renderObjInScene.setSpriteFrame(tex);
        }
        if (!target._renderObj && !target._renderObjInScene) {
            Fire.error('' + target + ' must be added to render context first!');
        }
        // @endif

        // cocos2d 会把 Sprite 的颜色重新赋值
        this.updateColor(target);
        if (target._imageType === Fire.ImageType.Sliced) {
            this.updateSpriteSize(target);
            this._updateCapInsets(target);
        }
    };

    RenderContext.prototype.updateTransform = function (target, matrix) {
        var node;
        // @ifdef EDITOR
        node = this.isSceneView ? target._renderObjInScene : target._renderObj;
        // @endif
        // @ifndef EDITOR
        node = target._renderObj;
        // @endif
        if (node) {
            var trs = matrix.getTRS();
            node.setPosition(matrix.tx, matrix.ty);

            var rot = trs.rotation * Math.R2D;
            // negate the rotation because our rotation transform not the same with cocos
            rot = -rot;
            if (node._rotationX !== rot) {
                node.setRotation(rot);
            }

            var scale = trs.scale;
            if (node._scaleX !== scale.x || node._scaleY !== scale.y) {
                node.setScale(scale.x, scale.y);
            }

            //var alpha = target._color.a * 255;
            //if (node._realOpacity !== alpha) {
            //    node.setOpacity(alpha);
            //}
        }
    };

    /**
     * @param sprite {Sprite}
     */
    RenderContext.prototype.createTexture = function (sprite) {
        if (sprite && sprite.texture) {
            var img = sprite.texture.image;
            if (img) {
                //this.game.setEnvironment();
                var tex = new cc.Texture2D();
                tex.initWithElement(img);
                var frame = cc.rect(sprite.x, sprite.y, Math.min(img.width - sprite.x, sprite.width), Math.min(img.height - sprite.y, sprite.height));
                return new cc.SpriteFrame(tex, frame);
            }
        }
        return emptyTexture;
    };

    /**
     * @param sprite {Sprite}
     */
    RenderContext.prototype.createCCTexture2D = function (sprite) {
        if (sprite && sprite.texture) {
            var img = sprite.texture.image;
            if (img) {
                var tex = new cc.Texture2D();
                tex.initWithElement(img);
                return tex;
            }
        }
        return null;
    };


    return RenderContext;
})();

// @ifdef DEV
/**
 * @param {Entity} entityParent
 * @param {Entity} [customFirstChildEntity=null]
 * @return {number}
 */
RenderContext.prototype._getChildrenOffset = function (entityParent, customFirstChildEntity) {
    if (entityParent) {
        var cocosParent = this.inSceneView ? entityParent._ccNodeInScene : entityParent._ccNode;
        var firstChildEntity = customFirstChildEntity || entityParent._children[0];
        if (firstChildEntity) {
            var firstChildCocos = this.inSceneView ? firstChildEntity._ccNodeInScene : firstChildEntity._ccNode;
            var offset = cocosParent.children.indexOf(firstChildCocos);
            if (offset !== -1) {
                return offset;
            }
            else if (customFirstChildEntity) {
                return cocosParent.children.length;
            }
            else {
                Fire.error("%s's cocos object not contains in its cocos parent's children", firstChildEntity.name);
                return -1;
            }
        }
        else {
            return cocosParent.children.length;
        }
    }
    else {
        return 0;   // the root of hierarchy
    }
};
RenderContext.prototype.checkMatchCurrentScene = function () {
    var entities = Engine._scene.entities;
    var cocosGameNodes = this.stage.children;
    var cocosSceneNodes;
    if (this.sceneView) {
        cocosSceneNodes = this.sceneView.stage.children;
        cocosSceneNodes = cocosSceneNodes[1].children;    // skip foreground and background
    }
    var scope = this;
    function checkMatch (ent, gameNode, sceneNode) {
        if (sceneNode && ent._ccNodeInScene !== sceneNode) {
            throw new Error('entity does not match cocos scene node: ' + ent.name);
        }
        //if (!(ent._objFlags & HideInGame)) {
        //    var gameNode = gameNodes[g++];
        //}
        if (ent._ccNode !== gameNode) {
            throw new Error('entity does not match cocos game node: ' + ent.name);
        }

        var childCount = ent._children.length;
        var sceneChildrenOffset;
        if (sceneNode) {
            sceneChildrenOffset = scope.sceneView._getChildrenOffset(ent);
            if (sceneNode.children.length !== childCount + sceneChildrenOffset) {
                console.error('Mismatched list of child elements in Scene view, entity: %s,\n' +
                    'cocos childCount: %s, entity childCount: %s, rcOffset: %s',
                    ent.name, sceneNode.children.length, childCount, sceneChildrenOffset);
                throw new Error('(see above error)');
            }
        }
        var gameChildrenOffset = scope._getChildrenOffset(ent);
        if (gameNode.children.length !== childCount + gameChildrenOffset) {
            throw new Error('Mismatched list of child elements in Game view, entity: ' + ent.name);
        }
        for (var i = 0; i < childCount; i++) {
            checkMatch(ent._children[i], gameNode.children[gameChildrenOffset + i], sceneNode && sceneNode.children[i + sceneChildrenOffset]);
        }
    }

    for (var i = 0; i < entities.length; i++) {
        if (cocosSceneNodes && cocosSceneNodes.length !== entities.length) {
            throw new Error('Mismatched list of root elements in scene view');
        }
        if (cocosGameNodes.length !== entities.length) {
            throw new Error('Mismatched list of root elements in game view');
        }
        checkMatch(entities[i], cocosGameNodes[i], cocosSceneNodes && cocosSceneNodes[i]);
    }
};
// @endif

Runtime.RenderContext = RenderContext;
