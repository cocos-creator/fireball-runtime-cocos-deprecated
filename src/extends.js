Color.prototype.toCCColor = function () {
    return {
        r: (this.r * 255) | 0,
        g: (this.g * 255) | 0,
        b: (this.b * 255) | 0,
        a: (this.a * 255) | 0
    };
};
