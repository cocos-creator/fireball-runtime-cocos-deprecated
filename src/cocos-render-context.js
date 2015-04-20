
(function () {
    // Tweak PIXI
    PIXI.dontSayHello = true;
    var EMPTY_METHOD = function () {};
    PIXI.DisplayObject.prototype.updateTransform = EMPTY_METHOD;
    PIXI.DisplayObject.prototype.displayObjectUpdateTransform = EMPTY_METHOD;
    PIXI.DisplayObjectContainer.prototype.displayObjectContainerUpdateTransform = EMPTY_METHOD;
})();

/**
 * The web renderer implemented rely on pixi.js
 */
var RenderContext = (function () {

    /**
     * render context 将在 pixi 中维护同样的 scene graph，这样做主要是为之后的 clipping 和 culling 提供支持。
     * 这里采用空间换时间的策略，所有 entity 都有对应的 PIXI.DisplayObjectContainer。
     * 毕竟一般 dummy entity 不会很多，因此这样产生的冗余对象可以忽略。
     * 值得注意的是，sprite 等 pixi object，被视为 entity 对应的 PIXI.DisplayObjectContainer 的子物体，
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
            "showFPS" : true,
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

    Object.defineProperty(RenderContext.prototype, 'domNode', {
        get: function () {
            return this.game.container;
        }
    });

    Object.defineProperty(RenderContext.prototype, 'width', {
        get: function () {
            return this.renderer.width;
        },
        set: function (value) {
            this.renderer.resize(value, this.renderer.height);
        }
    });

    Object.defineProperty(RenderContext.prototype, 'height', {
        get: function () {
            return this.renderer.height;
        },
        set: function (value) {
            this.renderer.resize(this.renderer.width, value);
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

    /**
     * @param {Fire.Entity} entity
     */
    RenderContext.prototype.onRootEntityCreated = function (entity) {
        // always create pixi node even if is scene gizmo, to keep all their indice sync with transforms' sibling indice.
        entity._ccNode = new cc.Node();
        entity._ccNode.setAnchorPoint(0, 1);
        if (Engine._canModifyCurrentScene) {
            this.game.setEnvironment();
            // attach node if created dynamically
            this.root.addChild(entity._ccNode);
        }
        if (this.sceneView) {
            entity._ccNodeInScene = new cc.Node();
            entity._ccNodeInScene.setAnchorPoint(0, 1);
            if (Engine._canModifyCurrentScene) {
                this.sceneView.game.setEnvironment();
                // attach node if created dynamically
                this.sceneView.root.addChild(entity._ccNodeInScene);
            }
        }
    };

    /**
     * removes a entity and all its children from scene
     * @param {Fire.Entity} entity
     */
    RenderContext.prototype.onEntityRemoved = function (entity) {
        if (entity._ccNode) {
            if (entity._ccNode.parent) {
                this.game.setEnvironment();
                entity._ccNode.parent.removeChild(entity._ccNode);
            }
            entity._ccNode = null;
        }
        if (entity._ccNodeInScene) {
            if (entity._ccNodeInScene.parent) {
                this.sceneView.game.setEnvironment();
                entity._ccNodeInScene.parent.removeChild(entity._ccNodeInScene);
            }
            entity._ccNodeInScene = null;
        }
    };

    /**
     * @param {Fire.Entity} entity
     * @param {Fire.Entity} oldParent
     */
    RenderContext.prototype.onEntityParentChanged = function (entity, oldParent) {
        this.game.setEnvironment();
        this._setParentNode(entity._ccNode, entity._parent && entity._parent._ccNode);
        // @ifdef EDITOR
        if (this.sceneView) {
            this.sceneView.game.setEnvironment();
            this.sceneView._setParentNode(entity._ccNodeInScene, entity._parent && entity._parent._ccNodeInScene);
        }
        // @endif
    };

    RenderContext.prototype._setParentNode = function (node, parent) {
        if (node) {
            if (parent) {
                parent.addChild(node);
            }
            else {
                this.root.addChild(node);
            }
        }
    };

    /**
     * @param {Fire.Entity} entityParent
     * @param {Fire.Entity} [customFirstChildEntity=null]
     * @returns {number}
     */
    RenderContext.prototype._getChildrenOffset = function (entityParent, customFirstChildEntity) {
        if (entityParent) {
            var cocosParent = inSceneView ? entityParent._ccNodeInScene : entityParent._ccNode;
            var firstChildEntity = customFirstChildEntity || entityParent._children[0];
            if (firstChildEntity) {
                var firstChildCocos = inSceneView ? firstChildEntity._ccNodeInScene : firstChildEntity._ccNode;
                var offset = pixiParent.children.indexOf(firstChildCocos);
                if (offset !== -1) {
                    return offset;
                }
                else if (customFirstChildEntity) {
                    return cocosParent.children.length;
                }
                else {
                    Fire.error("%s's pixi object not contains in its pixi parent's children", firstChildEntity.name);
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

    /**
     * @param {Fire.Entity} entity
     * @param {number} oldIndex
     * @param {number} newIndex
     */
    RenderContext.prototype.onEntityIndexChanged = function (entity, oldIndex, newIndex) {
        this.game.setEnvironment();
        entity._ccNode.setLocalZOrder(newIndex);
    };

    RenderContext.prototype.onSceneLaunched = function (scene) {
        // attach root nodes
        this._addToScene(scene);
        if (this.sceneView) {
            this.sceneView._addToScene(scene);
        }
    };

    RenderContext.prototype._addToScene = function (scene) {
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
     * @param {Fire.Entity} entity - must have parent, and not scene gizmo
     */
    var _onChildEntityCreated = function (entity, hasSceneView) {
        entity._ccNode = new cc.Node();
        entity._ccNode.setAnchorPoint(0, 1);
        entity._parent._ccNode.addChild(entity._ccNode);
        // @ifdef EDITOR
        if (hasSceneView) {
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

    /**
     * create pixi nodes recursively
     * @param {Entity} entity
     * @param {boolean} addToScene - add to pixi stage now if entity is root
     */
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
        var sprite = new cc.Sprite(tex);
        sprite.setAnchorPoint(0, 1);
        parentNode.addChild(sprite, 0);
        return sprite;
    };

    /**
     * @param {Fire.SpriteRenderer} target
     */
    RenderContext.prototype.addSprite = function (target) {
        var tex = createTexture(target._sprite) || emptyTexture;

        var inGame = !(target.entity._objFlags & HideInGame);
        if (inGame) {
            this.game.setEnvironment();
            target._renderObj = this._addSprite(tex, target.entity._ccNode);
        }
        // @ifdef EDITOR
        if (this.sceneView) {
            this.sceneView.game.setEnvironment();
            target._renderObjInScene =  this._addSprite(tex, target.entity._ccNodeInScene);
        }
        // @endif

        this.updateSpriteColor(target);
    };

    /**
     * @param {Fire.SpriteRenderer} target
     * @param {boolean} show
     */
    RenderContext.prototype.show = function (target, show) {
        if (target._renderObj) {
            target._renderObj.visible = show;
        }
        if (target._renderObjInScene) {
            target._renderObjInScene.visible = show;
        }
    };

    /**
     * @param target {Fire.SpriteRenderer}
     * @param show {boolean}
     */
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
        if (target._renderObj || target._renderObjInScene) {
            var tint = target._color.toCCColor();
            if (target._renderObj) {
                target._renderObj.setColor(tint);
            }
            // @ifdef EDITOR
            if (target._renderObjInScene) {
                target._renderObjInScene.setColor(tint);
            }
            // @endif
        }
        else {
            Fire.error('' + target + ' must be added to render context first!');
        }
    };

    /**
     * @param target {Fire.SpriteRenderer}
     */
    RenderContext.prototype.updateMaterial = function (target) {
        if (target._renderObj || target._renderObjInScene) {
            var tex = createTexture(target._sprite) || emptyTexture;
            if (target._renderObj) {
                target._renderObj.setSpriteFrame(tex);
            }
            // @ifdef EDITOR
            if (target._renderObjInScene) {
                target._renderObjInScene.setSpriteFrame(tex);
            }
            // @endif
        }
        else {
            Fire.error('' + target + ' must be added to render context first!');
        }
    };

    /**
     * Set the final transform to render
     * @param {Fire.SpriteRenderer} target
     * @param {Fire.Matrix23} matrix - the matrix to render (Read Only)
     */
    RenderContext.prototype.updateTransform = function (target, matrix) {
        // apply matrix
        var rot = 360 * (matrix.getRotation() / Math.PI);
        if (target._renderObj) {
            target._renderObj.setPosition(matrix.tx, matrix.ty);
            target._renderObj.setRotation(rot);
            target._renderObj.setScale(matrix.a, matrix.d);
            target._renderObj.setOpacity(target._color.a * 255);
        }
        // @ifdef EDITOR
        if (target._renderObjInScene) {
            target._renderObjInScene.setPosition(matrix.tx, matrix.ty);
            target._renderObjInScene.setRotation(rot);
            target._renderObjInScene.setScale(matrix.a, matrix.d);
            target._renderObjInScene.setOpacity(target._color.a * 255);
        }
        // @endif
    };

    ///**
    // * @param {Fire.SpriteRenderer} target
    // * @param {Fire.SpriteRenderer} transform
    // * @param {Fire.SpriteRenderer} oldParent
    // */
    //RenderContext.prototype.updateHierarchy = function (target, transform, oldParent) {
    //    if (target._renderObj || target._renderObjInScene) {
    //        if (transform._parent === oldParent) {
    //            // oldAncestor changed its sibling index
    //            if (target._renderObj) {
    //                this._updateSiblingIndex(transform);
    //            }
    //            if (target._renderObjInScene) {
    //                this.sceneView._updateSiblingIndex(transform);
    //            }
    //            return true;
    //        }
    //        else {
    //            // parent changed
    //        }
    //    }
    //    else {
    //        Fire.error('' + target + ' must be added to render context first!');
    //    }
    //    return false;
    //};

    //RenderContext.prototype._updateSiblingIndex = function (transform) {
    //    var pixiNode = this._pixiObjects[transform.id];
    //    var array = pixiNode.parent.children;
    //    var oldIndex = array.indexOf(pixiNode);
    //    var newIndex = transform.getSiblingIndex(); // TODO: 如果前面的节点包含空的entity，则这个new index会有问题
    //    // skip entities not exists in pixi
    //    while ((--newIndex) > 0) {
    //        var previous = transform.getSibling(newIndex);
    //        if (previous.id) {
    //        }
    //    }
    //    array.splice(oldIndex, 1);
    //    if (newIndex < array.length) {
    //        array.splice(newIndex, 0, pixiNode);
    //    }
    //    else {
    //        array.push(pixiNode);
    //    }
    //};

    /**
     * @param sprite {Fire.Sprite}
     */
    function createTexture(sprite) {
        if (sprite && sprite.texture && sprite.texture.image) {
            var img = cc.textureCache.addUIImage(sprite.texture.image, sprite.texture.name);
            var frame = cc.rect(sprite.x, sprite.y, Math.min(img.width - sprite.x, sprite.width), Math.min(img.height - sprite.y, sprite.height));
            return new cc.SpriteFrame(img, frame);
        }
        else {
            return null;
        }
    }

    return RenderContext;
})();

// @ifdef DEV
/**
 * The debugging method that checks whether the render context matches the current scene or not.
 * @throws {string} error info
 */
RenderContext.prototype.checkMatchCurrentScene = function () {
    var entities = Engine._scene.entities;
    var cocosGameNodes = this.stage.children;
    var cocosSceneNodes;
    if (this.sceneView) {
        cocosSceneNodes = this.sceneView.stage.children;
        cocosSceneNodes = cocosSceneNodes[1].children;    // skip forground and background
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
            throw new Error('entity does not match pixi game node: ' + ent.name);
        }

        var childCount = ent._children.length;
        var sceneChildrenOffset;
        if (sceneNode) {
            sceneChildrenOffset = scope.sceneView._getChildrenOffset(ent);
            if (sceneNode.children.length !== childCount + sceneChildrenOffset) {
                console.error('Mismatched list of child elements in Scene view, entity: %s,\n' +
                    'pixi childCount: %s, entity childCount: %s, rcOffset: %s',
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

    //if (g !== pixiGameNodes.length) {
    //    Fire.error('pixi has extra game node, pixi count: ' + pixiGameNodes.length + ' expected count: ' + g);
    //    return false;
    //}
    // 目前不测试renderer
};
// @endif

Fire._RenderContext = RenderContext;
