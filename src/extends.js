Color.prototype.toCCColor = function () {
    return {
        r: this.r * 255,
        g: this.g * 255,
        b: this.b * 255,
        a: this.a * 255
    };
};
