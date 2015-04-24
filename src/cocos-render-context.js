
/**
 * The render context implemented rely on cocos2d-js
 */
var RenderContext = (function () {

    /**
     * render context 将在 cocos 中维护同样的 scene graph，这样做主要是为之后的 clipping 和 culling 提供支持。
     * 这里采用空间换时间的策略，所有 entity 都有对应的 cc.Node。
     * 毕竟一般 dummy entity 不会很多，因此这样产生的冗余对象可以忽略。
     * 值得注意的是，sprite 等节点，被视为 entity 对应的 cc.Node 的子物体，
     * 并且排列在所有 entity 之前，以达到最先渲染的效果。
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
            "renderMode" : 1,
            "jsList" : []
        }, function () {
            self.root = self.stage = new cc.Scene();
            this.view.setResolutionPolicy( cc.ResolutionPolicy.SHOW_ALL );
            this.director.runScene(self.stage);
        });
        this.game.run();
        this.game.pause();

        var antialias = false;

        // the shared render context that allows display the object which marked as Fire._ObjectFlags.HideInGame
        this.sceneView = null;

        this.isSceneView = false;

        // binded camera, if supplied the scene will always rendered by this camera
        this._camera = null;

        this.renderer = this.view = this.game.view;
    }

    var emptyTexture = new cc.Texture2D();

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
        // always create node even if is scene gizmo, to keep all their indice sync with transforms' sibling indice.
        this.game.setEnvironment();
        entity._ccNode = new cc.Node();
        entity._ccNode.setAnchorPoint(0, 1);
        if (Engine._canModifyCurrentScene) {
            this.game.setEnvironment();
            // attach node if created dynamically
            this.root.addChild(entity._ccNode);
        }
        // @ifdef EDITOR
        if (this.sceneView) {
            this.sceneView.game.setEnvironment();
            entity._ccNodeInScene = new cc.Node();
            entity._ccNodeInScene.setAnchorPoint(0, 1);
            if (Engine._canModifyCurrentScene) {
                this.sceneView.game.setEnvironment();
                // attach node if created dynamically
                this.sceneView.root.addChild(entity._ccNodeInScene);
            }
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

    RenderContext.prototype._setParentNode = function (node, parent) {
        if (node) {
            this.game.setEnvironment();
            node.removeFromParent();
            if (parent) {
                parent.addChild(node);
            }
            else {
                this.root.addChild(node);
            }
        }
    };

    RenderContext.prototype.onEntityIndexChanged = function (entity, oldIndex, newIndex) {
        this.game.setEnvironment();
        entity._ccNode.setLocalZOrder(newIndex);
        // @ifdef EDITOR
        if (this.sceneView) {
            this.sceneView.game.setEnvironment();
            entity._ccNodeInScene.setLocalZOrder(newIndex);
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
                node.removeFromParent();
                this.root.addChild(node);
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
    var _onChildEntityCreated = function (entity, hasSceneView) {
        this.game.setEnvironment();
        entity._ccNode = new cc.Node();
        entity._ccNode.setAnchorPoint(0, 1);
        entity._parent._ccNode.addChild(entity._ccNode);
        // @ifdef EDITOR
        if (hasSceneView) {
            this.sceneView.game.setEnvironment();
            entity._ccNodeInScene = new cc.Node();
            entity._ccNodeInScene.setAnchorPoint(0, 1);
            entity._parent._ccNodeInScene.addChild(entity._ccNodeInScene);
        }
        // @endif
        var children = entity._children;
        for (var i = 0, len = children.length; i < len; i++) {
            _onChildEntityCreated(children[i], hasSceneView);
        }
    };

    RenderContext.prototype.onEntityCreated = function (entity, addToScene) {
        this.game.setEnvironment();
        entity._ccNode = new cc.Node();
        entity._ccNode.setAnchorPoint(0, 1);
        if (entity._parent) {
            entity._parent._ccNode.addChild(entity._ccNode);
        }
        else if (addToScene) {
            this.root.addChild(entity._ccNode);
        }
        // @ifdef EDITOR
        if (this.sceneView) {
            this.sceneView.game.setEnvironment();
            entity._ccNodeInScene = new cc.Node();
            entity._ccNodeInScene.setAnchorPoint(0, 1);
            if (entity._parent) {
                entity._parent._ccNodeInScene.addChild(entity._ccNodeInScene);
            }
            else if (addToScene) {
                this.sceneView.root.addChild(entity._ccNodeInScene);
            }
        }
        // @endif

        var children = entity._children;
        for (var i = 0, len = children.length; i < len; i++) {
            _onChildEntityCreated(children[i], this.sceneView);
        }
    };

    RenderContext.prototype._addSprite = function (tex, parentNode) {
        this.game.setEnvironment();
        var sprite = new cc.Sprite(tex);
        sprite.setAnchorPoint(0, 1);
        parentNode.addChild(sprite, 0);
        return sprite;
    };

    RenderContext.prototype.addSprite = function (target) {
        var tex = this.createTexture(target._sprite);
        var inGame = !(target.entity._objFlags & HideInGame);
        if (inGame) {
            target._renderObj = this._addSprite(tex, target.entity._ccNode);
        }
        // @ifdef EDITOR
        if (this.sceneView) {
            //var texInScene = this.sceneView.createTexture(target._sprite);
            target._renderObjInScene =  this.sceneView._addSprite(tex, target.entity._ccNodeInScene);
        }
        // @endif

        this.updateSpriteColor(target);
    };

    RenderContext.prototype.show = function (target, show) {
        if (target._renderObj) {
            target._renderObj.visible = show;
        }
        if (target._renderObjInScene) {
            target._renderObjInScene.visible = show;
        }
    };

    RenderContext.prototype.remove = function (target) {
        if (target._renderObj) {
            this.game.setEnvironment();
            target._renderObj.parent.removeChild(target._renderObj);
            target._renderObj = null;
        }
        // @ifdef EDITOR
        if (this.sceneView) {
            this.sceneView.game.setEnvironment();
            target._renderObjInScene.parent.removeChild(target._renderObjInScene);
            target._renderObjInScene = null;
        }
        // @endif
    };

    RenderContext.prototype.updateSpriteColor = function (target) {
        var tint = target._color.toCCColor();
        if (target._renderObj) {
            target._renderObj.setColor(tint);
        }
        // @ifdef EDITOR
        if (target._renderObjInScene) {
            target._renderObjInScene.setColor(tint);
        }
        if (!target._renderObj && !target._renderObjInScene) {
            Fire.error('' + target + ' must be added to render context first!');
        }
        // @endif
    };

    RenderContext.prototype.updateMaterial = function (target) {
        var tex = this.createTexture(target._sprite);
        if (target._renderObj) {
            target._renderObj.setSpriteFrame(tex);
        }
        // @ifdef EDITOR
        if (target._renderObjInScene) {
            //var texInScene = this.sceneView.createTexture(target._sprite);
            target._renderObjInScene.setSpriteFrame(tex);
        }
        if (!target._renderObj && !target._renderObjInScene) {
            Fire.error('' + target + ' must be added to render context first!');
        }
        // @endif
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

    /**
     * @param sprite {Sprite}
     */
    RenderContext.prototype.createTexture = function (sprite) {
        if (sprite && sprite.texture && sprite.texture.image) {
            //this.game.setEnvironment();
            var key = sprite.texture._uuid || sprite.texture.id;
            // @ifdef EDITOR
            if (this.isSceneView) {
                //key += '-scene';
            }
            // @endif
            var img = cc.textureCache.addUIImage(sprite.texture.image, key);
            var frame = cc.rect(sprite.x, sprite.y, Math.min(img.width - sprite.x, sprite.width), Math.min(img.height - sprite.y, sprite.height));
            return new cc.SpriteFrame(img, frame);
        }
        else {
            return emptyTexture;
        }
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
