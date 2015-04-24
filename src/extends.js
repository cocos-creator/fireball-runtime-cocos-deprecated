Color.prototype.toCCColor = function () {
    return {
        r: Math.floor(this.r * 255),
        g: Math.floor(this.g * 255),
        b: Math.floor(this.b * 255),
        a: Math.floor(this.a * 255)
    };
};
