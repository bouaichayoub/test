/*
_miniControl-valid.js
*/

(function (window, document, E, undefined) {
  "use strict";

  var pluginName = "eMiniControlValid";
  var attr = "data-e-minicontrolvalid";
  var defaults = {
    koValue: "",
  };

  var _createInput = function () {
    this.inputNode = document.createElement("input");
    this.inputNode.type = "hidden";
    this.inputNode.name = this.checkboxNode.name;
    this.inputNode.value = this.settings.koValue;
    this.inputNode.disabled = this.checkboxNode.checked;

    this.el.appendChild(this.inputNode);
  };

  var _onChange = function () {
    this.inputNode.disabled = this.checkboxNode.checked;
    document.dispatchEvent(
      new CustomEvent(pluginName + ".changed", { detail: this })
    );
  };

  function Plugin() {
    this.inputNode = null;
  }

  Plugin.prototype = {
    init: function () {
      var that = this;
      this.checkboxNode = this.el.querySelector("input[type=checkbox]");

      _createInput.call(this);

      document.dispatchEvent(
        new CustomEvent(pluginName + ".init", { detail: this })
      );

      this.checkboxNode.addEventListener("change", _onChange.bind(this));
    },
  };

  document.addEventListener("DOMContentLoaded", function () {
    E.factory.createPlugin(pluginName, attr, defaults, Plugin);
  });
})(window, document, window.E || {});
