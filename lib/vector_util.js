export function VectorUtil(x, y) {
  this.x = x; this.y = y;
}
VectorUtil.prototype.plus = function(other) {
  return new VectorUtil(this.x + other.x, this.y + other.y);
};
VectorUtil.prototype.times = function(factor) {
  return new VectorUtil(this.x * factor, this.y * factor);
};
