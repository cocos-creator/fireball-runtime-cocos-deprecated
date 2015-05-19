/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.
 Copyright (c) 2012 Scott Lembcke and Howling Moon Software

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

/**
 * Code copied & pasted from SpacePatrol game https://github.com/slembcke/SpacePatrol
 *
 * Renamed and added some changes for cocos2d
 *
 */
cc.v2fzero = function () {
    return {x: 0, y: 0};
};

cc.v2f = function (x, y) {
    return {x: x, y: y};
};

cc.v2fadd = function (v0, v1) {
    return cc.v2f(v0.x + v1.x, v0.y + v1.y);
};

cc.v2fsub = function (v0, v1) {
    return cc.v2f(v0.x - v1.x, v0.y - v1.y);
};

cc.v2fmult = function (v, s) {
    return cc.v2f(v.x * s, v.y * s);
};

cc.v2fperp = function (p0) {
    return cc.v2f(-p0.y, p0.x);
};

cc.v2fneg = function (p0) {
    return cc.v2f(-p0.x, -p0.y);
};

cc.v2fdot = function (p0, p1) {
    return  p0.x * p1.x + p0.y * p1.y;
};

cc.v2fforangle = function (_a_) {
    return cc.v2f(Math.cos(_a_), Math.sin(_a_));
};

cc.v2fnormalize = function (p) {
    var r = cc.pNormalize(cc.p(p.x, p.y));
    return cc.v2f(r.x, r.y);
};

cc.__v2f = function (v) {
    return cc.v2f(v.x, v.y);
};

cc.__t = function (v) {
    return {u: v.x, v: v.y};
};

/**
 * <p>CCDrawNode                                                <br/>
 * Node that draws dots, segments and polygons.                        <br/>
 * Faster than the "drawing primitives" since they it draws everything in one single batch.</p>
 * @class
 * @name cc.DrawNode
 * @extends cc.Node
 */
cc.DrawNodeCanvas = cc.Node.extend(/** @lends cc.DrawNode# */{                  //TODO need refactor
    _buffer: null,
    _blendFunc: null,
    _lineWidth: 1,
    _drawColor: null,
    _className:"DrawNodeCanvas",

    /**
     * <p>The cc.DrawNodeCanvas's constructor. <br/>
     * This function will automatically be invoked when you create a node using new construction: "var node = new cc.DrawNodeCanvas()".<br/>
     * Override it to extend its behavior, remember to call "this._super()" in the extended "ctor" function.</p>
     */
    ctor: function () {
        cc.Node.prototype.ctor.call(this);
        var locCmd = this._renderCmd;
        locCmd._buffer = this._buffer = [];
        locCmd._drawColor = this._drawColor = cc.color(255, 255, 255, 255);
        locCmd._blendFunc = this._blendFunc = new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST);

		this.init();
    },

    // ----common function start ----
    /**
     * Gets the blend func
     * @returns {Object}
     */
    getBlendFunc: function () {
        return this._blendFunc;
    },

    /**
     * Set the blend func
     * @param blendFunc
     * @param dst
     */
    setBlendFunc: function (blendFunc, dst) {
        if (dst === undefined) {
            this._blendFunc.src = blendFunc.src;
            this._blendFunc.dst = blendFunc.dst;
        } else {
            this._blendFunc.src = blendFunc;
            this._blendFunc.dst = dst;
        }
    },

    /**
     * line width setter
     * @param {Number} width
     */
    setLineWidth: function (width) {
        this._lineWidth = width;
    },

    /**
     * line width getter
     * @returns {Number}
     */
    getLineWidth: function () {
        return this._lineWidth;
    },

    /**
     * draw color setter
     * @param {cc.Color} color
     */
    setDrawColor: function (color) {
        var locDrawColor = this._drawColor;
        locDrawColor.r = color.r;
        locDrawColor.g = color.g;
        locDrawColor.b = color.b;
        locDrawColor.a = (color.a == null) ? 255 : color.a;
    },

    /**
     * draw color getter
     * @returns {cc.Color}
     */
    getDrawColor: function () {
        return  cc.color(this._drawColor.r, this._drawColor.g, this._drawColor.b, this._drawColor.a);
    },
    // ----common function end ----


    /**
     * draws a rectangle given the origin and destination point measured in points.
     * @param {cc.Point} origin
     * @param {cc.Point} destination
     * @param {cc.Color} fillColor
     * @param {Number} lineWidth
     * @param {cc.Color} lineColor
     */
    drawRect: function (origin, destination, fillColor, lineWidth, lineColor) {
        lineWidth = lineWidth || this._lineWidth;
        lineColor = lineColor || this.getDrawColor();
        if(lineColor.a == null)
            lineColor.a = 255;

        var vertices = [
            origin,
            cc.p(destination.x, origin.y),
            destination,
            cc.p(origin.x, destination.y)
        ];
        var element = new cc._DrawNodeElement(cc.DrawNode.TYPE_POLY);
        element.verts = vertices;
        element.lineWidth = lineWidth;
        element.lineColor = lineColor;
        element.isClosePolygon = true;
        element.isStroke = true;
        element.lineCap = "butt";
        element.fillColor = fillColor;
        if (fillColor) {
            if(fillColor.a == null)
                fillColor.a = 255;
            element.isFill = true;
        }
        this._buffer.push(element);
    },

    /**
     * draws a circle given the center, radius and number of segments.
     * @override
     * @param {cc.Point} center center of circle
     * @param {Number} radius
     * @param {Number} angle angle in radians
     * @param {Number} segments
     * @param {Boolean} drawLineToCenter
     * @param {Number} lineWidth
     * @param {cc.Color} color
     */
    drawCircle: function (center, radius, angle, segments, drawLineToCenter, lineWidth, color) {
        lineWidth = lineWidth || this._lineWidth;
        color = color || this.getDrawColor();
        if (color.a == null)
            color.a = 255;

        var coef = 2.0 * Math.PI / segments;
        var vertices = [];
        for (var i = 0; i <= segments; i++) {
            var rads = i * coef;
            var j = radius * Math.cos(rads + angle) + center.x;
            var k = radius * Math.sin(rads + angle) + center.y;
            vertices.push(cc.p(j, k));
        }
        if (drawLineToCenter) {
            vertices.push(cc.p(center.x, center.y));
        }

        var element = new cc._DrawNodeElement(cc.DrawNode.TYPE_POLY);
        element.verts = vertices;
        element.lineWidth = lineWidth;
        element.lineColor = color;
        element.isClosePolygon = true;
        element.isStroke = true;
        this._buffer.push(element);
    },

    /**
     * draws a quad bezier path
     * @override
     * @param {cc.Point} origin
     * @param {cc.Point} control
     * @param {cc.Point} destination
     * @param {Number} segments
     * @param {Number} lineWidth
     * @param {cc.Color} color
     */
    drawQuadBezier: function (origin, control, destination, segments, lineWidth, color) {
        lineWidth = lineWidth || this._lineWidth;
        color = color || this.getDrawColor();
        if (color.a == null)
            color.a = 255;

        var vertices = [], t = 0.0;
        for (var i = 0; i < segments; i++) {
            var x = Math.pow(1 - t, 2) * origin.x + 2.0 * (1 - t) * t * control.x + t * t * destination.x;
            var y = Math.pow(1 - t, 2) * origin.y + 2.0 * (1 - t) * t * control.y + t * t * destination.y;
            vertices.push(cc.p(x, y));
            t += 1.0 / segments;
        }
        vertices.push(cc.p(destination.x, destination.y));

        var element = new cc._DrawNodeElement(cc.DrawNode.TYPE_POLY);
        element.verts = vertices;
        element.lineWidth = lineWidth;
        element.lineColor = color;
        element.isStroke = true;
        element.lineCap = "round";
        this._buffer.push(element);
    },

    /**
     * draws a cubic bezier path
     * @override
     * @param {cc.Point} origin
     * @param {cc.Point} control1
     * @param {cc.Point} control2
     * @param {cc.Point} destination
     * @param {Number} segments
     * @param {Number} lineWidth
     * @param {cc.Color} color
     */
    drawCubicBezier: function (origin, control1, control2, destination, segments, lineWidth, color) {
        lineWidth = lineWidth || this._lineWidth;
        color = color || this.getDrawColor();
        if (color.a == null)
            color.a = 255;

        var vertices = [], t = 0;
        for (var i = 0; i < segments; i++) {
            var x = Math.pow(1 - t, 3) * origin.x + 3.0 * Math.pow(1 - t, 2) * t * control1.x + 3.0 * (1 - t) * t * t * control2.x + t * t * t * destination.x;
            var y = Math.pow(1 - t, 3) * origin.y + 3.0 * Math.pow(1 - t, 2) * t * control1.y + 3.0 * (1 - t) * t * t * control2.y + t * t * t * destination.y;
            vertices.push(cc.p(x, y));
            t += 1.0 / segments;
        }
        vertices.push(cc.p(destination.x, destination.y));

        var element = new cc._DrawNodeElement(cc.DrawNode.TYPE_POLY);
        element.verts = vertices;
        element.lineWidth = lineWidth;
        element.lineColor = color;
        element.isStroke = true;
        element.lineCap = "round";
        this._buffer.push(element);
    },

    /**
     * draw a CatmullRom curve
     * @override
     * @param {Array} points
     * @param {Number} segments
     * @param {Number} lineWidth
     * @param {cc.Color} color
     */
    drawCatmullRom: function (points, segments, lineWidth, color) {
        this.drawCardinalSpline(points, 0.5, segments, lineWidth, color);
    },

    /**
     * draw a cardinal spline path
     * @override
     * @param {Array} config
     * @param {Number} tension
     * @param {Number} segments
     * @param {Number} lineWidth
     * @param {cc.Color} color
     */
    drawCardinalSpline: function (config, tension, segments, lineWidth, color) {
        lineWidth = lineWidth || this._lineWidth;
        color = color || this.getDrawColor();
        if(color.a == null)
            color.a = 255;

        var vertices = [], p, lt, deltaT = 1.0 / config.length;
        for (var i = 0; i < segments + 1; i++) {
            var dt = i / segments;
            // border
            if (dt == 1) {
                p = config.length - 1;
                lt = 1;
            } else {
                p = 0 | (dt / deltaT);
                lt = (dt - deltaT * p) / deltaT;
            }

            // Interpolate
            var newPos = cc.cardinalSplineAt(
                cc.getControlPointAt(config, p - 1),
                cc.getControlPointAt(config, p - 0),
                cc.getControlPointAt(config, p + 1),
                cc.getControlPointAt(config, p + 2),
                tension, lt);
            vertices.push(newPos);
        }

        var element = new cc._DrawNodeElement(cc.DrawNode.TYPE_POLY);
        element.verts = vertices;
        element.lineWidth = lineWidth;
        element.lineColor = color;
        element.isStroke = true;
        element.lineCap = "round";
        this._buffer.push(element);
    },

    /**
     * draw a dot at a position, with a given radius and color
     * @param {cc.Point} pos
     * @param {Number} radius
     * @param {cc.Color} color
     */
    drawDot: function (pos, radius, color) {
        color = color || this.getDrawColor();
        if (color.a == null)
            color.a = 255;
        var element = new cc._DrawNodeElement(cc.DrawNode.TYPE_DOT);
        element.verts = [pos];
        element.lineWidth = radius;
        element.fillColor = color;
        this._buffer.push(element);
    },

    /**
     * draws an array of points.
     * @override
     * @param {Array} points point of array
     * @param {Number} radius
     * @param {cc.Color} color
     */
    drawDots: function(points, radius, color){
        if(!points || points.length == 0)
            return;
        color = color || this.getDrawColor();
        if (color.a == null)
            color.a = 255;
        for(var i = 0, len = points.length; i < len; i++)
           this.drawDot(points[i], radius, color);
    },

    /**
     * draw a segment with a radius and color
     * @param {cc.Point} from
     * @param {cc.Point} to
     * @param {Number} lineWidth
     * @param {cc.Color} color
     */
    drawSegment: function (from, to, lineWidth, color) {
        lineWidth = lineWidth || this._lineWidth;
        color = color || this.getDrawColor();
        if (color.a == null)
            color.a = 255;
        var element = new cc._DrawNodeElement(cc.DrawNode.TYPE_POLY);
        element.verts = [from, to];
        element.lineWidth = lineWidth * 2;
        element.lineColor = color;
        element.isStroke = true;
        element.lineCap = "round";
        this._buffer.push(element);
    },

    /**
     * draw a polygon with a fill color and line color without copying the vertex list
     * @param {Array} verts
     * @param {cc.Color} fillColor
     * @param {Number} lineWidth
     * @param {cc.Color} color
     */
    drawPoly_: function (verts, fillColor, lineWidth, color) {
        lineWidth = lineWidth || this._lineWidth;
        color = color || this.getDrawColor();
        if (color.a == null)
            color.a = 255;
        var element = new cc._DrawNodeElement(cc.DrawNode.TYPE_POLY);
        
        element.verts = verts;
        element.fillColor = fillColor;
        element.lineWidth = lineWidth;
        element.lineColor = color;
        element.isClosePolygon = true;
        element.isStroke = true;
        element.lineCap = "round";
        if (fillColor)
            element.isFill = true;
        this._buffer.push(element);
    },
    
    /**
     * draw a polygon with a fill color and line color, copying the vertex list
     * @param {Array} verts
     * @param {cc.Color} fillColor
     * @param {Number} lineWidth
     * @param {cc.Color} color
     */
    drawPoly: function (verts, fillColor, lineWidth, color) {
        var vertsCopy = [];
        for (var i=0; i < verts.length; i++) {
            vertsCopy.push(cc.p(verts[i].x, verts[i].y));
        }
        return this.drawPoly_(vertsCopy, fillColor, lineWidth, color);     
    },

    /**
     * Clear the geometry in the node's buffer.
     */
    clear: function () {
        this._buffer.length = 0;
    },

    _createRenderCmd: function(){
        return new cc.DrawNode.CanvasRenderCmd(this);
    }
});

//Just only a note
cc.DrawNodeWebGL = cc.Node.extend({
    _bufferCapacity:0,
    _buffer:null,

    _trianglesArrayBuffer:null,
    _trianglesWebBuffer:null,
    _trianglesReader:null,

    _lineWidth: 1,
    _drawColor: null,

    _blendFunc:null,
    _dirty:false,
    _className:"DrawNodeWebGL",

    // ----common function start ----
    getBlendFunc:function () {
        return this._blendFunc;
    },

    setBlendFunc:function (blendFunc, dst) {
        if (dst === undefined) {
            this._blendFunc.src = blendFunc.src;
            this._blendFunc.dst = blendFunc.dst;
        } else {
            this._blendFunc.src = blendFunc;
            this._blendFunc.dst = dst;
        }
    },
    // ----common function end ----

    ctor:function () {
        cc.Node.prototype.ctor.call(this);
        this._buffer = [];
        this._blendFunc = new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST);
        this._drawColor = cc.color(255,255,255,255);

	    this.init();
    },

    init:function () {
        if (cc.Node.prototype.init.call(this)) {
            this.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_LENGTHTEXTURECOLOR);
            this._ensureCapacity(64);
            this._trianglesWebBuffer = cc.game._renderContext.createBuffer();
            this._dirty = true;
            return true;
        }
        return false;
    },

    setLineWidth: function (width) {
        this._lineWidth = width;
    },

    getLineWidth: function () {
        return this._lineWidth;
    },

    setDrawColor: function (color) {
        var locDrawColor = this._drawColor;
        locDrawColor.r = color.r;
        locDrawColor.g = color.g;
        locDrawColor.b = color.b;
        locDrawColor.a = color.a;
    },

    getDrawColor: function () {
        return  cc.color(this._drawColor.r, this._drawColor.g, this._drawColor.b, this._drawColor.a);
    },

    drawRect: function (origin, destination, fillColor, lineWidth, lineColor) {
        lineWidth = lineWidth || this._lineWidth;
        lineColor = lineColor || this.getDrawColor();
        if (lineColor.a == null)
            lineColor.a = 255;
        var vertices = [origin, cc.p(destination.x, origin.y), destination, cc.p(origin.x, destination.y)];
        if(fillColor == null)
            this._drawSegments(vertices, lineWidth, lineColor, true);
        else
            this.drawPoly(vertices, fillColor, lineWidth, lineColor);
    },

    drawCircle: function (center, radius, angle, segments, drawLineToCenter, lineWidth, color) {
        lineWidth = lineWidth || this._lineWidth;
        color = color || this.getDrawColor();
        if (color.a == null)
            color.a = 255;
        var coef = 2.0 * Math.PI / segments, vertices = [], i, len;
        for (i = 0; i <= segments; i++) {
            var rads = i * coef;
            var j = radius * Math.cos(rads + angle) + center.x;
            var k = radius * Math.sin(rads + angle) + center.y;
            vertices.push(cc.p(j, k));
        }
        if (drawLineToCenter)
            vertices.push(cc.p(center.x, center.y));

        lineWidth *= 0.5;
        for (i = 0, len = vertices.length; i < len - 1; i++)
            this.drawSegment(vertices[i], vertices[i + 1], lineWidth, color);
    },

    drawQuadBezier: function (origin, control, destination, segments, lineWidth, color) {
        lineWidth = lineWidth || this._lineWidth;
        color = color || this.getDrawColor();
        if (color.a == null)
            color.a = 255;
        var vertices = [], t = 0.0;
        for (var i = 0; i < segments; i++) {
            var x = Math.pow(1 - t, 2) * origin.x + 2.0 * (1 - t) * t * control.x + t * t * destination.x;
            var y = Math.pow(1 - t, 2) * origin.y + 2.0 * (1 - t) * t * control.y + t * t * destination.y;
            vertices.push(cc.p(x, y));
            t += 1.0 / segments;
        }
        vertices.push(cc.p(destination.x, destination.y));
        this._drawSegments(vertices, lineWidth, color, false);
    },

    drawCubicBezier: function (origin, control1, control2, destination, segments, lineWidth, color) {
        lineWidth = lineWidth || this._lineWidth;
        color = color || this.getDrawColor();
        if (color.a == null)
            color.a = 255;
        var vertices = [], t = 0;
        for (var i = 0; i < segments; i++) {
            var x = Math.pow(1 - t, 3) * origin.x + 3.0 * Math.pow(1 - t, 2) * t * control1.x + 3.0 * (1 - t) * t * t * control2.x + t * t * t * destination.x;
            var y = Math.pow(1 - t, 3) * origin.y + 3.0 * Math.pow(1 - t, 2) * t * control1.y + 3.0 * (1 - t) * t * t * control2.y + t * t * t * destination.y;
            vertices.push(cc.p(x, y));
            t += 1.0 / segments;
        }
        vertices.push(cc.p(destination.x, destination.y));
        this._drawSegments(vertices, lineWidth, color, false);
    },

    drawCatmullRom: function (points, segments, lineWidth, color) {
        this.drawCardinalSpline(points, 0.5, segments, lineWidth, color);
    },

    drawCardinalSpline: function (config, tension, segments, lineWidth, color) {
        lineWidth = lineWidth || this._lineWidth;
        color = color || this.getDrawColor();
        if (color.a == null)
            color.a = 255;
        var vertices = [], p, lt, deltaT = 1.0 / config.length;

        for (var i = 0; i < segments + 1; i++) {
            var dt = i / segments;

            // border
            if (dt == 1) {
                p = config.length - 1;
                lt = 1;
            } else {
                p = 0 | (dt / deltaT);
                lt = (dt - deltaT * p) / deltaT;
            }

            // Interpolate
            var newPos = cc.cardinalSplineAt(
                cc.getControlPointAt(config, p - 1),
                cc.getControlPointAt(config, p - 0),
                cc.getControlPointAt(config, p + 1),
                cc.getControlPointAt(config, p + 2),
                tension, lt);
            vertices.push(newPos);
        }

        lineWidth *= 0.5;
        for (var j = 0, len = vertices.length; j < len - 1; j++)
            this.drawSegment(vertices[j], vertices[j + 1], lineWidth, color);
    },

    _render:function () {
        var gl = cc.game._renderContext;

        cc.glEnableVertexAttribs(gl, cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._trianglesWebBuffer);
        if (this._dirty) {
            gl.bufferData(gl.ARRAY_BUFFER, this._trianglesArrayBuffer, gl.STREAM_DRAW);
            this._dirty = false;
        }
        var triangleSize = cc.V2F_C4B_T2F.BYTES_PER_ELEMENT;

        // vertex
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, gl.FLOAT, false, triangleSize, 0);
        // color
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, gl.UNSIGNED_BYTE, true, triangleSize, 8);
        // texcood
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, triangleSize, 12);

        gl.drawArrays(gl.TRIANGLES, 0, this._buffer.length * 3);
        cc.incrementGLDraws(1);
        //cc.checkGLErrorDebug(gl);
    },

    _ensureCapacity:function(count){
        var _t = this;
        var locBuffer = _t._buffer;
        if(locBuffer.length + count > _t._bufferCapacity){
            var TriangleLength = cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT;
            _t._bufferCapacity += Math.max(_t._bufferCapacity, count);
            //re alloc
            if((locBuffer == null) || (locBuffer.length === 0)){
                //init
                _t._buffer = [];
                _t._trianglesArrayBuffer = new ArrayBuffer(TriangleLength * _t._bufferCapacity);
                _t._trianglesReader = new Uint8Array(_t._trianglesArrayBuffer);
            } else {
                var newTriangles = [];
                var newArrayBuffer = new ArrayBuffer(TriangleLength * _t._bufferCapacity);
                for(var i = 0; i < locBuffer.length;i++){
                    newTriangles[i] = new cc.V2F_C4B_T2F_Triangle(locBuffer[i].a,locBuffer[i].b,locBuffer[i].c,
                        newArrayBuffer, i * TriangleLength);
                }
                _t._trianglesReader = new Uint8Array(newArrayBuffer);
                _t._trianglesArrayBuffer = newArrayBuffer;
                _t._buffer = newTriangles;
            }
        }
    },

    drawDot:function (pos, radius, color) {
        color = color || this.getDrawColor();
        if (color.a == null)
            color.a = 255;
        var c4bColor = {r: 0 | color.r, g: 0 | color.g, b: 0 | color.b, a: 0 | color.a};
        var a = {vertices: {x: pos.x - radius, y: pos.y - radius}, colors: c4bColor, texCoords: {u: -1.0, v: -1.0}};
        var b = {vertices: {x: pos.x - radius, y: pos.y + radius}, colors: c4bColor, texCoords: {u: -1.0, v: 1.0}};
        var c = {vertices: {x: pos.x + radius, y: pos.y + radius}, colors: c4bColor, texCoords: {u: 1.0, v: 1.0}};
        var d = {vertices: {x: pos.x + radius, y: pos.y - radius}, colors: c4bColor, texCoords: {u: 1.0, v: -1.0}};

        this._ensureCapacity(2*3);

        this._buffer.push(new cc.V2F_C4B_T2F_Triangle(a, b, c, this._trianglesArrayBuffer, this._buffer.length * cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT));
        this._buffer.push(new cc.V2F_C4B_T2F_Triangle(a, c, d, this._trianglesArrayBuffer, this._buffer.length * cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT));
        this._dirty = true;
    },

    drawDots: function(points, radius,color) {
        if(!points || points.length == 0)
            return;
        color = color || this.getDrawColor();
        if (color.a == null)
            color.a = 255;
        for(var i = 0, len = points.length; i < len; i++)
            this.drawDot(points[i], radius, color);
    },

    drawSegment:function (from, to, radius, color) {
        color = color || this.getDrawColor();
        if (color.a == null)
            color.a = 255;
        radius = radius || (this._lineWidth * 0.5);
        var vertexCount = 6*3;
        this._ensureCapacity(vertexCount);

        var c4bColor = {r: 0 | color.r, g: 0 | color.g, b: 0 | color.b, a: 0 | color.a};
        var a = cc.__v2f(from), b = cc.__v2f(to);
        var n = cc.v2fnormalize(cc.v2fperp(cc.v2fsub(b, a))), t = cc.v2fperp(n);
        var nw = cc.v2fmult(n, radius), tw = cc.v2fmult(t, radius);

        var v0 = cc.v2fsub(b, cc.v2fadd(nw, tw));
        var v1 = cc.v2fadd(b, cc.v2fsub(nw, tw));
        var v2 = cc.v2fsub(b, nw);
        var v3 = cc.v2fadd(b, nw);
        var v4 = cc.v2fsub(a, nw);
        var v5 = cc.v2fadd(a, nw);
        var v6 = cc.v2fsub(a, cc.v2fsub(nw, tw));
        var v7 = cc.v2fadd(a, cc.v2fadd(nw, tw));

        var TriangleLength = cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT, triangleBuffer = this._trianglesArrayBuffer, locBuffer = this._buffer;
        locBuffer.push(new cc.V2F_C4B_T2F_Triangle({vertices: v0, colors: c4bColor, texCoords: cc.__t(cc.v2fneg(cc.v2fadd(n, t)))},
            {vertices: v1, colors: c4bColor, texCoords: cc.__t(cc.v2fsub(n, t))}, {vertices: v2, colors: c4bColor, texCoords: cc.__t(cc.v2fneg(n))},
            triangleBuffer, locBuffer.length * TriangleLength));

        locBuffer.push(new cc.V2F_C4B_T2F_Triangle({vertices: v3, colors: c4bColor, texCoords: cc.__t(n)},
            {vertices: v1, colors: c4bColor, texCoords: cc.__t(cc.v2fsub(n, t))}, {vertices: v2, colors: c4bColor, texCoords: cc.__t(cc.v2fneg(n))},
            triangleBuffer, locBuffer.length * TriangleLength));

        locBuffer.push(new cc.V2F_C4B_T2F_Triangle({vertices: v3, colors: c4bColor, texCoords: cc.__t(n)},
            {vertices: v4, colors: c4bColor, texCoords: cc.__t(cc.v2fneg(n))}, {vertices: v2, colors: c4bColor, texCoords: cc.__t(cc.v2fneg(n))},
            triangleBuffer, locBuffer.length * TriangleLength));

        locBuffer.push(new cc.V2F_C4B_T2F_Triangle({vertices: v3, colors: c4bColor, texCoords: cc.__t(n)},
            {vertices: v4, colors: c4bColor, texCoords: cc.__t(cc.v2fneg(n))}, {vertices: v5, colors: c4bColor, texCoords: cc.__t(n)},
            triangleBuffer, locBuffer.length * TriangleLength));

        locBuffer.push(new cc.V2F_C4B_T2F_Triangle({vertices: v6, colors: c4bColor, texCoords: cc.__t(cc.v2fsub(t, n))},
            {vertices: v4, colors: c4bColor, texCoords: cc.__t(cc.v2fneg(n))}, {vertices: v5, colors: c4bColor, texCoords: cc.__t(n)},
            triangleBuffer, locBuffer.length * TriangleLength));

        locBuffer.push(new cc.V2F_C4B_T2F_Triangle({vertices: v6, colors: c4bColor, texCoords: cc.__t(cc.v2fsub(t, n))},
            {vertices: v7, colors: c4bColor, texCoords: cc.__t(cc.v2fadd(n, t))}, {vertices: v5, colors: c4bColor, texCoords: cc.__t(n)},
            triangleBuffer, locBuffer.length * TriangleLength));
        this._dirty = true;
    },

    drawPoly:function (verts, fillColor, borderWidth, borderColor) {
        if(fillColor == null){
            this._drawSegments(verts, borderWidth, borderColor, true);
            return;
        }
        if (fillColor.a == null)
            fillColor.a = 255;
        if (borderColor.a == null)
            borderColor.a = 255;
        borderWidth = borderWidth || this._lineWidth;
        borderWidth *= 0.5;
        var c4bFillColor = {r: 0 | fillColor.r, g: 0 | fillColor.g, b: 0 | fillColor.b, a: 0 | fillColor.a};
        var c4bBorderColor = {r: 0 | borderColor.r, g: 0 | borderColor.g, b: 0 | borderColor.b, a: 0 | borderColor.a};
        var extrude = [], i, v0, v1, v2, count = verts.length;
        for (i = 0; i < count; i++) {
            v0 = cc.__v2f(verts[(i - 1 + count) % count]);
            v1 = cc.__v2f(verts[i]);
            v2 = cc.__v2f(verts[(i + 1) % count]);
            var n1 = cc.v2fnormalize(cc.v2fperp(cc.v2fsub(v1, v0)));
            var n2 = cc.v2fnormalize(cc.v2fperp(cc.v2fsub(v2, v1)));
            var offset = cc.v2fmult(cc.v2fadd(n1, n2), 1.0 / (cc.v2fdot(n1, n2) + 1.0));
            extrude[i] = {offset: offset, n: n2};
        }
        var outline = (borderWidth > 0.0), triangleCount = 3 * count - 2, vertexCount = 3 * triangleCount;
        this._ensureCapacity(vertexCount);

        var triangleBytesLen = cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT, trianglesBuffer = this._trianglesArrayBuffer;
        var locBuffer = this._buffer;
        var inset = (outline == false ? 0.5 : 0.0);
        for (i = 0; i < count - 2; i++) {
            v0 = cc.v2fsub(cc.__v2f(verts[0]), cc.v2fmult(extrude[0].offset, inset));
            v1 = cc.v2fsub(cc.__v2f(verts[i + 1]), cc.v2fmult(extrude[i + 1].offset, inset));
            v2 = cc.v2fsub(cc.__v2f(verts[i + 2]), cc.v2fmult(extrude[i + 2].offset, inset));
            locBuffer.push(new cc.V2F_C4B_T2F_Triangle({vertices: v0, colors: c4bFillColor, texCoords: cc.__t(cc.v2fzero())},
                {vertices: v1, colors: c4bFillColor, texCoords: cc.__t(cc.v2fzero())}, {vertices: v2, colors: c4bFillColor, texCoords: cc.__t(cc.v2fzero())},
                trianglesBuffer, locBuffer.length * triangleBytesLen));
        }

        for (i = 0; i < count; i++) {
            var j = (i + 1) % count;
            v0 = cc.__v2f(verts[i]);
            v1 = cc.__v2f(verts[j]);

            var n0 = extrude[i].n;
            var offset0 = extrude[i].offset;
            var offset1 = extrude[j].offset;
            var inner0 = outline ? cc.v2fsub(v0, cc.v2fmult(offset0, borderWidth)) : cc.v2fsub(v0, cc.v2fmult(offset0, 0.5));
            var inner1 = outline ? cc.v2fsub(v1, cc.v2fmult(offset1, borderWidth)) : cc.v2fsub(v1, cc.v2fmult(offset1, 0.5));
            var outer0 = outline ? cc.v2fadd(v0, cc.v2fmult(offset0, borderWidth)) : cc.v2fadd(v0, cc.v2fmult(offset0, 0.5));
            var outer1 = outline ? cc.v2fadd(v1, cc.v2fmult(offset1, borderWidth)) : cc.v2fadd(v1, cc.v2fmult(offset1, 0.5));

            if (outline) {
                locBuffer.push(new cc.V2F_C4B_T2F_Triangle({vertices: inner0, colors: c4bBorderColor, texCoords: cc.__t(cc.v2fneg(n0))},
                    {vertices: inner1, colors: c4bBorderColor, texCoords: cc.__t(cc.v2fneg(n0))}, {vertices: outer1, colors: c4bBorderColor, texCoords: cc.__t(n0)},
                    trianglesBuffer, locBuffer.length * triangleBytesLen));
                locBuffer.push(new cc.V2F_C4B_T2F_Triangle({vertices: inner0, colors: c4bBorderColor, texCoords: cc.__t(cc.v2fneg(n0))},
                    {vertices: outer0, colors: c4bBorderColor, texCoords: cc.__t(n0)}, {vertices: outer1, colors: c4bBorderColor, texCoords: cc.__t(n0)},
                    trianglesBuffer, locBuffer.length * triangleBytesLen));
            } else {
                locBuffer.push(new cc.V2F_C4B_T2F_Triangle({vertices: inner0, colors: c4bFillColor, texCoords: cc.__t(cc.v2fzero())},
                    {vertices: inner1, colors: c4bFillColor, texCoords: cc.__t(cc.v2fzero())}, {vertices: outer1, colors: c4bFillColor, texCoords: cc.__t(n0)},
                    trianglesBuffer, locBuffer.length * triangleBytesLen));
                locBuffer.push(new cc.V2F_C4B_T2F_Triangle({vertices: inner0, colors: c4bFillColor, texCoords: cc.__t(cc.v2fzero())},
                    {vertices: outer0, colors: c4bFillColor, texCoords: cc.__t(n0)}, {vertices: outer1, colors: c4bFillColor, texCoords: cc.__t(n0)},
                    trianglesBuffer, locBuffer.length * triangleBytesLen));
            }
        }
        extrude = null;
        this._dirty = true;
    },

    _drawSegments: function(verts, borderWidth, borderColor, closePoly){
        borderWidth = borderWidth || this._lineWidth;
        borderColor = borderColor || this._drawColor;
        if(borderColor.a == null)
            borderColor.a = 255;
        borderWidth *= 0.5;
        if (borderWidth <= 0)
            return;

        var c4bBorderColor = {r: 0 | borderColor.r, g: 0 | borderColor.g, b: 0 | borderColor.b, a: 0 | borderColor.a };
        var extrude = [], i, v0, v1, v2, count = verts.length;
        for (i = 0; i < count; i++) {
            v0 = cc.__v2f(verts[(i - 1 + count) % count]);
            v1 = cc.__v2f(verts[i]);
            v2 = cc.__v2f(verts[(i + 1) % count]);
            var n1 = cc.v2fnormalize(cc.v2fperp(cc.v2fsub(v1, v0)));
            var n2 = cc.v2fnormalize(cc.v2fperp(cc.v2fsub(v2, v1)));
            var offset = cc.v2fmult(cc.v2fadd(n1, n2), 1.0 / (cc.v2fdot(n1, n2) + 1.0));
            extrude[i] = {offset: offset, n: n2};
        }

        var triangleCount = 3 * count - 2, vertexCount = 3 * triangleCount;
        this._ensureCapacity(vertexCount);

        var triangleBytesLen = cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT, trianglesBuffer = this._trianglesArrayBuffer;
        var locBuffer = this._buffer;
        var len = closePoly ? count : count - 1;
        for (i = 0; i < len; i++) {
            var j = (i + 1) % count;
            v0 = cc.__v2f(verts[i]);
            v1 = cc.__v2f(verts[j]);

            var n0 = extrude[i].n;
            var offset0 = extrude[i].offset;
            var offset1 = extrude[j].offset;
            var inner0 = cc.v2fsub(v0, cc.v2fmult(offset0, borderWidth));
            var inner1 = cc.v2fsub(v1, cc.v2fmult(offset1, borderWidth));
            var outer0 = cc.v2fadd(v0, cc.v2fmult(offset0, borderWidth));
            var outer1 = cc.v2fadd(v1, cc.v2fmult(offset1, borderWidth));
            locBuffer.push(new cc.V2F_C4B_T2F_Triangle({vertices: inner0, colors: c4bBorderColor, texCoords: cc.__t(cc.v2fneg(n0))},
                {vertices: inner1, colors: c4bBorderColor, texCoords: cc.__t(cc.v2fneg(n0))}, {vertices: outer1, colors: c4bBorderColor, texCoords: cc.__t(n0)},
                trianglesBuffer, locBuffer.length * triangleBytesLen));
            locBuffer.push(new cc.V2F_C4B_T2F_Triangle({vertices: inner0, colors: c4bBorderColor, texCoords: cc.__t(cc.v2fneg(n0))},
                {vertices: outer0, colors: c4bBorderColor, texCoords: cc.__t(n0)}, {vertices: outer1, colors: c4bBorderColor, texCoords: cc.__t(n0)},
                trianglesBuffer, locBuffer.length * triangleBytesLen));
        }
        extrude = null;
        this._dirty = true;
    },

    clear:function () {
        this._buffer.length = 0;
        this._dirty = true;
    },

    _createRenderCmd: function () {
        return new cc.DrawNode.WebGLRenderCmd(this);
    }
});

cc.DrawNode = cc.game.renderType === cc.Game.RENDER_TYPE_WEBGL ? cc.DrawNodeWebGL : cc.DrawNodeCanvas;

/**
 * Creates a DrawNode
 * @deprecated since v3.0 please use new cc.DrawNode() instead.
 * @return {cc.DrawNode}
 */
cc.DrawNode.create = function () {
    return new cc.DrawNode();
};

cc._DrawNodeElement = function (type, verts, fillColor, lineWidth, lineColor, lineCap, isClosePolygon, isFill, isStroke) {
    var _t = this;
    _t.type = type;
    _t.verts = verts || null;
    _t.fillColor = fillColor || null;
    _t.lineWidth = lineWidth || 0;
    _t.lineColor = lineColor || null;
    _t.lineCap = lineCap || "butt";
    _t.isClosePolygon = isClosePolygon || false;
    _t.isFill = isFill || false;
    _t.isStroke = isStroke || false;
};

cc.DrawNode.TYPE_DOT = 0;
cc.DrawNode.TYPE_SEGMENT = 1;
cc.DrawNode.TYPE_POLY = 2;

/****************************************************************************
 Copyright (c) 2013-2014 Chukong Technologies Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

(function(){

    cc.DrawNode.CanvasRenderCmd = function(renderableObject){
        cc.Node.CanvasRenderCmd.call(this, renderableObject);
        this._needDraw = true;
        this._buffer = null;
        this._drawColor = null;
        this._blendFunc = null;
    };

    cc.DrawNode.CanvasRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
    cc.DrawNode.CanvasRenderCmd.prototype.constructor = cc.DrawNode.CanvasRenderCmd;

    cc.DrawNode.CanvasRenderCmd.prototype.rendering = function (ctx, scaleX, scaleY) {
        var wrapper = ctx || cc.game._renderContext, context = wrapper.getContext(), node = this._node;
        var alpha = this._displayedOpacity / 255;
        if (alpha === 0)
            return;

        wrapper.setTransform(this._worldTransform, scaleX, scaleY);

        //context.save();
        wrapper.setGlobalAlpha(alpha);
        if ((this._blendFunc && (this._blendFunc.src == cc.SRC_ALPHA) && (this._blendFunc.dst == cc.ONE)))
            wrapper.setCompositeOperation('lighter');               //todo: need refactor
        var locBuffer = this._buffer;
        for (var i = 0, len = locBuffer.length; i < len; i++) {
            var element = locBuffer[i];
            switch (element.type) {
                case cc.DrawNode.TYPE_DOT:
                    this._drawDot(wrapper, element, scaleX, scaleY);
                    break;
                case cc.DrawNode.TYPE_SEGMENT:
                    this._drawSegment(wrapper, element, scaleX, scaleY);
                    break;
                case cc.DrawNode.TYPE_POLY:
                    this._drawPoly(wrapper, element, scaleX, scaleY);
                    break;
            }
        }
        //context.restore();            //todo It can be reserve
    };

    cc.DrawNode.CanvasRenderCmd.prototype._drawDot = function (wrapper, element, scaleX, scaleY) {
        var locColor = element.fillColor, locPos = element.verts[0], locRadius = element.lineWidth;

        var ctx = wrapper.getContext();
        wrapper.setFillStyle("rgba(" + (0 | locColor.r) + "," + (0 | locColor.g) + "," + (0 | locColor.b) + "," + locColor.a / 255 + ")");

        ctx.beginPath();
        ctx.arc(locPos.x * scaleX, -locPos.y * scaleY, locRadius * scaleX, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fill();
    };

    cc.DrawNode.CanvasRenderCmd.prototype._drawSegment = function (wrapper, element, scaleX, scaleY) {
        var locColor = element.lineColor;
        var locFrom = element.verts[0], locTo = element.verts[1];
        var locLineWidth = element.lineWidth, locLineCap = element.lineCap;

        var ctx = wrapper.getContext();
        wrapper.setStrokeStyle("rgba(" + (0 | locColor.r) + "," + (0 | locColor.g) + "," + (0 | locColor.b) + "," + locColor.a / 255 + ")");

        ctx.lineWidth = locLineWidth * scaleX;
        ctx.beginPath();
        ctx.lineCap = locLineCap;
        ctx.moveTo(locFrom.x * scaleX, -locFrom.y * scaleY);
        ctx.lineTo(locTo.x * scaleX, -locTo.y * scaleY);
        ctx.stroke();
    };

    cc.DrawNode.CanvasRenderCmd.prototype._drawPoly = function (wrapper, element, scaleX, scaleY) {
        var locVertices = element.verts, locLineCap = element.lineCap;
        if (locVertices == null)
            return;

        var locFillColor = element.fillColor, locLineWidth = element.lineWidth;
        var locLineColor = element.lineColor, locIsClosePolygon = element.isClosePolygon;
        var locIsFill = element.isFill, locIsStroke = element.isStroke;

        var ctx = wrapper.getContext();
        var firstPoint = locVertices[0];
        ctx.lineCap = locLineCap;
        if (locFillColor)
            wrapper.setFillStyle("rgba(" + (0 | locFillColor.r) + "," + (0 | locFillColor.g) + ","
                + (0 | locFillColor.b) + "," + locFillColor.a / 255 + ")");
        if (locLineWidth)
            ctx.lineWidth = locLineWidth * scaleX;
        if (locLineColor)
            wrapper.setStrokeStyle("rgba(" + (0 | locLineColor.r) + "," + (0 | locLineColor.g) + ","
                + (0 | locLineColor.b) + "," + locLineColor.a / 255 + ")");

        ctx.beginPath();
        ctx.moveTo(firstPoint.x * scaleX, -firstPoint.y * scaleY);
        for (var i = 1, len = locVertices.length; i < len; i++)
            ctx.lineTo(locVertices[i].x * scaleX, -locVertices[i].y * scaleY);

        if (locIsClosePolygon)
            ctx.closePath();
        if (locIsFill)
            ctx.fill();
        if (locIsStroke)
            ctx.stroke();
    };
})();
/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/
/**
 * @const
 * @type {number}
 */
cc.PI2 = Math.PI * 2;

/**
 * Canvas of DrawingPrimitive implement version use for canvasMode
 * @class
 * @extends cc.Class
 * @param {CanvasRenderingContext2D} renderContext
 */
cc.DrawingPrimitiveCanvas = cc.Class.extend(/** @lends cc.DrawingPrimitiveCanvas# */{
    _cacheArray:[],
    _renderContext:null,
    /**
     * Constructor of cc.DrawingPrimitiveCanvas
     * @param {cc.CanvasContextWrapper} renderContext
     */
    ctor:function (renderContext) {
        this._renderContext = renderContext;
    },

    /**
     * draws a point given x and y coordinate measured in points
     * @override
     * @param {cc.Point} point
     * @param {Number} size
     */
    drawPoint:function (point, size) {
        if (!size) {
            size = 1;
        }
        var locScaleX = cc.view.getScaleX(), locScaleY = cc.view.getScaleY();
        var newPoint = cc.p(point.x  * locScaleX, point.y * locScaleY);
        var ctx = this._renderContext.getContext();
        ctx.beginPath();
        ctx.arc(newPoint.x, -newPoint.y, size * locScaleX, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fill();
    },

    /**
     * draws an array of points.
     * @override
     * @param {Array} points point of array
     * @param {Number} numberOfPoints
     * @param {Number} size
     */
    drawPoints:function (points, numberOfPoints, size) {
        if (points == null)
            return;

        if (!size) {
            size = 1;
        }
        var locContext = this._renderContext.getContext(),locScaleX = cc.view.getScaleX(), locScaleY = cc.view.getScaleY();

        locContext.beginPath();
        for (var i = 0, len = points.length; i < len; i++)
            locContext.arc(points[i].x * locScaleX, -points[i].y * locScaleY, size * locScaleX, 0, Math.PI * 2, false);
        locContext.closePath();
        locContext.fill();
    },

    /**
     * draws a line given the origin and destination point measured in points
     * @override
     * @param {cc.Point} origin
     * @param {cc.Point} destination
     */
    drawLine:function (origin, destination) {
        var locContext = this._renderContext.getContext(), locScaleX = cc.view.getScaleX(), locScaleY = cc.view.getScaleY();
        locContext.beginPath();
        locContext.moveTo(origin.x * locScaleX, -origin.y * locScaleY);
        locContext.lineTo(destination.x * locScaleX, -destination.y * locScaleY);
        locContext.closePath();
        locContext.stroke();
    },

    /**
     * draws a rectangle given the origin and destination point measured in points.
     * @param {cc.Point} origin
     * @param {cc.Point} destination
     */
    drawRect:function (origin, destination) {
        //todo need optimize for performance
        this.drawLine(cc.p(origin.x, origin.y), cc.p(destination.x, origin.y));
        this.drawLine(cc.p(destination.x, origin.y), cc.p(destination.x, destination.y));
        this.drawLine(cc.p(destination.x, destination.y), cc.p(origin.x, destination.y));
        this.drawLine(cc.p(origin.x, destination.y), cc.p(origin.x, origin.y));
    },

    /**
     * draws a solid rectangle given the origin and destination point measured in points.
     * @param {cc.Point} origin
     * @param {cc.Point} destination
     * @param {cc.Color} color
     */
    drawSolidRect:function (origin, destination, color) {
        var vertices = [
            origin,
            cc.p(destination.x, origin.y),
            destination,
            cc.p(origin.x, destination.y)
        ];

        this.drawSolidPoly(vertices, 4, color);
    },

    /**
     * draws a polygon given a pointer to cc.Point coordinates and the number of vertices measured in points.
     * @override
     * @param {Array} vertices a pointer to cc.Point coordinates
     * @param {Number} numOfVertices the number of vertices measured in points
     * @param {Boolean} closePolygon The polygon can be closed or open
     * @param {Boolean} [fill=] The polygon can be closed or open and optionally filled with current color
     */
    drawPoly:function (vertices, numOfVertices, closePolygon, fill) {
        fill = fill || false;

        if (vertices == null)
            return;

        if (vertices.length < 3)
            throw new Error("Polygon's point must greater than 2");

        var firstPoint = vertices[0], locContext = this._renderContext.getContext();
        var locScaleX = cc.view.getScaleX(), locScaleY = cc.view.getScaleY();
        locContext.beginPath();
        locContext.moveTo(firstPoint.x * locScaleX, -firstPoint.y * locScaleY);
        for (var i = 1, len = vertices.length; i < len; i++)
            locContext.lineTo(vertices[i].x * locScaleX, -vertices[i].y * locScaleY);

        if (closePolygon)
            locContext.closePath();

        if (fill)
            locContext.fill();
        else
            locContext.stroke();
    },

    /**
     * draws a solid polygon given a pointer to CGPoint coordinates, the number of vertices measured in points, and a color.
     * @param {Array} polygons
     * @param {Number} numberOfPoints
     * @param {cc.Color} color
     */
    drawSolidPoly:function (polygons, numberOfPoints, color) {
        this.setDrawColor(color.r, color.g, color.b, color.a);
        this.drawPoly(polygons, numberOfPoints, true, true);
    },

    /**
     * draws a circle given the center, radius and number of segments.
     * @override
     * @param {cc.Point} center center of circle
     * @param {Number} radius
     * @param {Number} angle angle in radians
     * @param {Number} segments
     * @param {Boolean} [drawLineToCenter=]
     */
    drawCircle: function (center, radius, angle, segments, drawLineToCenter) {
        drawLineToCenter = drawLineToCenter || false;
        var locContext = this._renderContext.getContext();
        var locScaleX = cc.view.getScaleX(), locScaleY = cc.view.getScaleY();
        locContext.beginPath();
        var endAngle = angle - Math.PI * 2;
        locContext.arc(0 | (center.x * locScaleX), 0 | -(center.y * locScaleY), radius * locScaleX, -angle, -endAngle, false);
        if (drawLineToCenter) {
            locContext.lineTo(0 | (center.x * locScaleX), 0 | -(center.y * locScaleY));
        }
        locContext.stroke();
    },

    /**
     * draws a quad bezier path
     * @override
     * @param {cc.Point} origin
     * @param {cc.Point} control
     * @param {cc.Point} destination
     * @param {Number} segments
     */
    drawQuadBezier:function (origin, control, destination, segments) {
        //this is OpenGL Algorithm
        var vertices = this._cacheArray;
        vertices.length =0;

        var t = 0.0;
        for (var i = 0; i < segments; i++) {
            var x = Math.pow(1 - t, 2) * origin.x + 2.0 * (1 - t) * t * control.x + t * t * destination.x;
            var y = Math.pow(1 - t, 2) * origin.y + 2.0 * (1 - t) * t * control.y + t * t * destination.y;
            vertices.push(cc.p(x, y));
            t += 1.0 / segments;
        }
        vertices.push(cc.p(destination.x, destination.y));

        this.drawPoly(vertices, segments + 1, false, false);
    },

    /**
     * draws a cubic bezier path
     * @override
     * @param {cc.Point} origin
     * @param {cc.Point} control1
     * @param {cc.Point} control2
     * @param {cc.Point} destination
     * @param {Number} segments
     */
    drawCubicBezier:function (origin, control1, control2, destination, segments) {
        //this is OpenGL Algorithm
        var vertices = this._cacheArray;
        vertices.length =0;

        var t = 0;
        for (var i = 0; i < segments; i++) {
            var x = Math.pow(1 - t, 3) * origin.x + 3.0 * Math.pow(1 - t, 2) * t * control1.x + 3.0 * (1 - t) * t * t * control2.x + t * t * t * destination.x;
            var y = Math.pow(1 - t, 3) * origin.y + 3.0 * Math.pow(1 - t, 2) * t * control1.y + 3.0 * (1 - t) * t * t * control2.y + t * t * t * destination.y;
            vertices.push(cc.p(x , y ));
            t += 1.0 / segments;
        }
        vertices.push(cc.p(destination.x , destination.y));

        this.drawPoly(vertices, segments + 1, false, false);
    },

    /**
     * draw a CatmullRom curve
     * @override
     * @param {Array} points
     * @param {Number} segments
     */
    drawCatmullRom:function (points, segments) {
        this.drawCardinalSpline(points, 0.5, segments);
    },

    /**
     * draw a cardinal spline path
     * @override
     * @param {Array} config
     * @param {Number} tension
     * @param {Number} segments
     */
    drawCardinalSpline:function (config, tension, segments) {
        //lazy_init();
        cc.game._renderContext.setStrokeStyle("rgba(255,255,255,1)");
        var points = this._cacheArray;
        points.length = 0;
        var p, lt;
        var deltaT = 1.0 / config.length;

        for (var i = 0; i < segments + 1; i++) {
            var dt = i / segments;

            // border
            if (dt == 1) {
                p = config.length - 1;
                lt = 1;
            } else {
                p = 0 | (dt / deltaT);
                lt = (dt - deltaT * p) / deltaT;
            }

            // Interpolate
            var newPos = cc.CardinalSplineAt(
                cc.getControlPointAt(config, p - 1),
                cc.getControlPointAt(config, p - 0),
                cc.getControlPointAt(config, p + 1),
                cc.getControlPointAt(config, p + 2),
                tension, lt);
            points.push(newPos);
        }
        this.drawPoly(points, segments + 1, false, false);
    },

    /**
     * draw an image
     * @override
     * @param {HTMLImageElement|HTMLCanvasElement} image
     * @param {cc.Point} sourcePoint
     * @param {cc.Size} sourceSize
     * @param {cc.Point} destPoint
     * @param {cc.Size} destSize
     */
    drawImage:function (image, sourcePoint, sourceSize, destPoint, destSize) {
        var len = arguments.length;
        var ctx = this._renderContext.getContext();
        switch (len) {
            case 2:
                var height = image.height;
                ctx.drawImage(image, sourcePoint.x, -(sourcePoint.y + height));
                break;
            case 3:
                ctx.drawImage(image, sourcePoint.x, -(sourcePoint.y + sourceSize.height), sourceSize.width, sourceSize.height);
                break;
            case 5:
                ctx.drawImage(image, sourcePoint.x, sourcePoint.y, sourceSize.width, sourceSize.height, destPoint.x, -(destPoint.y + destSize.height),
                    destSize.width, destSize.height);
                break;
            default:
                throw new Error("Argument must be non-nil");
                break;
        }
    },

    /**
     * draw a star
     * @param {cc.CanvasContextWrapper} ctx canvas context
     * @param {Number} radius
     * @param {cc.Color} color
     */
    drawStar:function (ctx, radius, color) {
        var wrapper = ctx || this._renderContext;
        var context = wrapper.getContext();
        radius *= cc.view.getScaleX();
        var colorStr = "rgba(" + (0 | color.r) + "," + (0 | color.g) + "," + (0 | color.b);
        wrapper.setFillStyle(colorStr + ",1)");
        //context.fillStyle = colorStr + ",1)";
        var subRadius = radius / 10;

        context.beginPath();
        context.moveTo(-radius, radius);
        context.lineTo(0, subRadius);
        context.lineTo(radius, radius);
        context.lineTo(subRadius, 0);
        context.lineTo(radius, -radius);
        context.lineTo(0, -subRadius);
        context.lineTo(-radius, -radius);
        context.lineTo(-subRadius, 0);
        context.lineTo(-radius, radius);
        context.closePath();
        context.fill();

        var rg = context.createRadialGradient(0, 0, subRadius, 0, 0, radius);
        rg.addColorStop(0, colorStr + ", 1)");
        rg.addColorStop(0.3, colorStr + ", 0.8)");
        rg.addColorStop(1.0, colorStr + ", 0.0)");
        wrapper.setFillStyle(rg);
        //context.fillStyle = g1;
        context.beginPath();
        var startAngle_1 = 0;
        var endAngle_1 = cc.PI2;
        context.arc(0, 0, radius - subRadius, startAngle_1, endAngle_1, false);
        context.closePath();
        context.fill();
    },

    /**
     * draw a color ball
     * @param {cc.CanvasContextWrapper} ctx canvas context
     * @param {Number} radius
     * @param {cc.Color} color
     */
    drawColorBall:function (ctx, radius, color) {
        var wrapper = ctx || this._renderContext;
        var context = wrapper.getContext();
        radius *= cc.view.getScaleX();
        var colorStr = "rgba(" +(0|color.r) + "," + (0|color.g) + "," + (0|color.b);
        var subRadius = radius / 10;

        var g1 = context.createRadialGradient(0, 0, subRadius, 0, 0, radius);
        g1.addColorStop(0, colorStr + ", 1)");
        g1.addColorStop(0.3, colorStr + ", 0.8)");
        g1.addColorStop(0.6, colorStr + ", 0.4)");
        g1.addColorStop(1.0, colorStr + ", 0.0)");
        wrapper.setFillStyle(g1);
        //context.fillStyle = g1;
        context.beginPath();
        var startAngle_1 = 0;
        var endAngle_1 = cc.PI2;
        context.arc(0, 0, radius, startAngle_1, endAngle_1, false);
        context.closePath();
        context.fill();
    },

    /**
     * fill text
     * @param {String} strText
     * @param {Number} x
     * @param {Number} y
     */
    fillText:function (strText, x, y) {
        this._renderContext.getContext().fillText(strText, x, -y);
    },

    /**
     * set the drawing color with 4 unsigned bytes
     * @param {Number} r red value (0 to 255)
     * @param {Number} g green value (0 to 255)
     * @param {Number} b blue value (0 to 255)
     * @param {Number} a Alpha value (0 to 255)
     */
    setDrawColor:function (r, g, b, a) {
        this._renderContext.setFillStyle("rgba(" + r + "," + g + "," + b + "," + a / 255 + ")");
        this._renderContext.setStrokeStyle("rgba(" + r + "," + g + "," + b + "," + a / 255 + ")");
    },

    /**
     * set the point size in points. Default 1.
     * @param {Number} pointSize
     */
    setPointSize:function (pointSize) {
    },

    /**
     * set the line width. Default 1.
     * @param {Number} width
     */
    setLineWidth:function (width) {
        this._renderContext.getContext().lineWidth = width * cc.view.getScaleX();
    }
});