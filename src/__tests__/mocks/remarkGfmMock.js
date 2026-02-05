function remarkGfmMock() {
  return function transformer(tree) {
    return tree;
  };
}

module.exports = remarkGfmMock;
module.exports.default = remarkGfmMock;
