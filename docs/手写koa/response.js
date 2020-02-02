let response = {
  set body(value) {
    this.res.statusCode = 200;
    this._body = value;
  },
  get body() {
    return this._body;
  }
};
modules.exports = response;