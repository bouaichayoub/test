/*
_input-telRewrite.js
*/

(function (window, document, E, undefined) {
  "use strict";

  var pluginName = "eTelRewrite";
  var attr = "data-e-telrewrite";
  var defaults = {};

  var _rewrite = function () {
    var value = this.inputNode.value;
    var foo = value.split(" ").join("");
    var cursorPosition = this.inputNode.selectionStart;

    if (foo.length > 0) {
      foo = foo.match(new RegExp(".{1,2}", "g")).join(" ");
    }

    this.inputNode.value = foo;
    this.inputNode.selectionStart = this.inputNode.selectionEnd =
      cursorPosition + (this.inputNode.value.length - value.length);
  };

  function Plugin() {}

  Plugin.prototype = {
    init: function () {
      this.inputNode = this.el.querySelector("input");
      this.inputNode.addEventListener("input", _rewrite.bind(this));
    },
  };

  document.addEventListener("DOMContentLoaded", function () {
    E.factory.createPlugin(pluginName, attr, defaults, Plugin);
  });
})(window, document, window.E || {});
