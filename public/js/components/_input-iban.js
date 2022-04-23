/*
_input-iban.js
*/

(function (window, document, E, undefined) {
  "use strict";

  var pluginName = "eIban";
  var attr = "data-e-input-iban";
  var defaults = {};

  var _rewrite = function () {
    var value = this.inputNode.value;
    var newValue = value.split(" ").join("");
    var cursorPosition = this.inputNode.selectionStart;

    if (newValue.length > 0) {
      newValue = newValue.match(new RegExp(".{1,4}", "g")).join(" ");
    }

    this.inputNode.value = newValue.toUpperCase();
    this.inputNode.selectionStart = this.inputNode.selectionEnd =
      cursorPosition + (newValue.length - value.length);
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
