const style = `
  /**
   * xonokai theme for JavaScript, CSS and HTML
   * based on: https://github.com/MoOx/sass-prism-theme-base by Maxime Thirouin ~ MoOx --> http://moox.fr/ , which is Loosely based on Monokai textmate theme by http://www.monokai.nl/
   * license: MIT; http://moox.mit-license.org/
   */
  code[class*="language-"],
  pre[class*="language-"] {
    -moz-tab-size: 2;
    -o-tab-size: 2;
    tab-size: 2;
    -webkit-hyphens: none;
    -moz-hyphens: none;
    -ms-hyphens: none;
    hyphens: none;
    white-space: pre;
    white-space: pre-wrap;
    word-wrap: normal;
    font-family: Menlo, Monaco, "Courier New", monospace;
    font-size: 14px;
    color: #76d9e6;
    text-shadow: none;
  }
  
  pre > code[class*="language-"] {
    font-size: 1em;
  }
  
  pre[class*="language-"],
  :not(pre)>code[class*="language-"] {
    background: #2a2a2a;
  }
  
  pre[class*="language-"] {
    padding: 15px;
    border-radius: 4px;
    border: 1px solid #e1e1e8;
    overflow: auto;
  }
  
  pre[class*="language-"] {
    position: relative;
  }
  pre[class*="language-"] code {
    white-space: pre;
    display: block;
  }
  
  :not(pre)>code[class*="language-"] {
    padding: 0.15em 0.2em 0.05em;
    border-radius: .3em;
    border: 0.13em solid #7a6652;
    box-shadow: 1px 1px 0.3em -0.1em #000 inset;
  }
  .token.namespace {
    opacity: .7;
  }
  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: #6f705e;
  }
  .token.operator,
  .token.boolean,
  .token.number {
    color: #a77afe;
  }
  .token.attr-name,
  .token.string {
    color: #e6d06c;
  }
  .token.entity,
  .token.url,
  .language-css .token.string,
  .style .token.string {
    color: #e6d06c;
  }
  .token.selector,
  .token.inserted {
    color: #a6e22d;
  }
  .token.atrule,
  .token.attr-value,
  .token.keyword,
  .token.important,
  .token.deleted {
    color: #ef3b7d;
  }
  .token.regex,
  .token.statement {
    color: #76d9e6;
  }
  .token.placeholder,
  .token.variable {
    color: #fff;
  }
  .token.important,
  .token.statement,
  .token.bold {
    font-weight: bold;
  }
  .token.punctuation {
    color: #bebec5;
  }
  .token.entity {
    cursor: help;
  }
  .token.italic {
    font-style: italic;
  }
  
  code.language-markup {
    color: #f9f9f9;
  }
  code.language-markup .token.tag {
    color: #ef3b7d;
  }
  code.language-markup .token.attr-name {
    color: #a6e22d;
  }
  code.language-markup .token.attr-value {
    color: #e6d06c;
  }
  code.language-markup .token.style,
  code.language-markup .token.script {
    color: #76d9e6;
  }
  code.language-markup .token.script .token.keyword {
    color: #76d9e6;
  }
  
  /* Line highlight plugin */
  pre[class*="language-"][data-line] {
    position: relative;
    padding: 1em 0 1em 3em;
  }
  pre[data-line] .line-highlight {
    position: absolute;
    left: 0;
    right: 0;
    padding: 0;
    margin-top: 1em;
    background: rgba(255, 255, 255, 0.08);
    pointer-events: none;
    line-height: inherit;
    white-space: pre;
  }
  pre[data-line] .line-highlight:before,
  pre[data-line] .line-highlight[data-end]:after {
    content: attr(data-start);
    position: absolute;
    top: .4em;
    left: .6em;
    min-width: 1em;
    padding: 0.2em 0.5em;
    background-color: rgba(255, 255, 255, 0.4);
    color: black;
    font: bold 65%/1 sans-serif;
    height: 1em;
    line-height: 1em;
    text-align: center;
    border-radius: 999px;
    text-shadow: none;
    box-shadow: 0 1px 1px rgba(255, 255, 255, 0.7);
  }
  pre[data-line] .line-highlight[data-end]:after {
    content: attr(data-end);
    top: auto;
    bottom: .4em;
  }
`;

export default style;
