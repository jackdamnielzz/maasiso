const React = require('react');

// react-markdown is ESM-only en kan niet door de Jest/SWC-transform; voor tests
// volstaat het renderen van de markdown-string als platte tekst.
function ReactMarkdownMock({ children }) {
  return React.createElement('div', { 'data-testid': 'react-markdown' }, children);
}

module.exports = ReactMarkdownMock;
module.exports.default = ReactMarkdownMock;
