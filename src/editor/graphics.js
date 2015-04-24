(function () {

    var PIXEL_OFFSET = 0.5;

    function Graphics (parent, renderContext) {
        this.renderContext = renderContext || Fire.Engine._renderContext;
        this.renderContext.game.setEnvironment();
        this.drawNode = new cc.DrawNode();
        parent.addChild(this.drawNode);

        this.lineWidthFactor = (this.renderContext.game.renderType === cc.Game.RENDER_TYPE_WEBGL) ? window.devicePixelRatio : 0.5;

        // states
        this.lastPos = cc.p(0, 0);
    }

    function color24ToColor (color24, alpha) {
        alpha = (alpha === undefined) ? 255 : alpha * 255;
        return new cc.Color(color24 >> 16, (color24 & 0x00FF00) >> 8, (color24 & 0x0000FF), alpha);
    }

    Graphics.prototype.clear = function () {
        this.drawNode.clear();

        this.lastPos = cc.p(0, 0);
        this.drawNode.setDrawColor(new cc.Color(255, 255, 255, 255));
    };

    Graphics.prototype.beginFill = function (color24, alpha) {
        color24 = color24 || 0;
        alpha = (alpha === undefined) ? 1 : alpha;

        this.drawNode.setDrawColor(color24ToColor(color24, alpha));
        return this;
    };

    Graphics.prototype.lineStyle = function (lineWidth, color24, alpha) {
        lineWidth = lineWidth || 0;
        color24 = color24 || 0;
        alpha = (alpha === undefined) ? 1 : alpha;

        this.drawNode.setLineWidth(lineWidth * this.lineWidthFactor);
        this.drawNode.setDrawColor(color24ToColor(color24, alpha));
        return this;
    };

    Graphics.prototype.lineTo = function (x, y) {
        var nextPos = cc.p(x + PIXEL_OFFSET, this._height - y + PIXEL_OFFSET);
        this.drawNode.drawSegment(this.lastPos, nextPos);
        this.lastPos = nextPos;
        return this;
    };

    Graphics.prototype.moveTo = function (x, y) {
        this.lastPos = cc.p(x + PIXEL_OFFSET, this._height - y + PIXEL_OFFSET);
        return this;
    };

    Graphics.prototype.endFill = function () {
        return this;
    };

    JS.get(Graphics.prototype, '_height', function () {
        return this.renderContext.size.y;
    });

    RenderContext.Graphics = Graphics;

})();
