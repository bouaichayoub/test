(function (window, document, E, undefined) {
  "use strict";

  var pluginName = "eToggleiban";
  var attr = "data-e-toggleiban";
  var ctaAttr = attr + "-cta";
  var ctaWrapperAttr = attr + "-ctawrappper";
  var addIbanAttr = attr + "-target";
  var defaults = {};

  var _addNewIban = function () {
    this.ctaWrapperNode.hidden = true;
    this.addIbanNode.hidden = false;
    this.addIbanNode.disabled = false;
  };

  function Plugin() {}

  Plugin.prototype = {
    init: function () {
      this.ctaNode = this.el.querySelector("[" + ctaAttr + "]");
      this.ctaWrapperNode = this.el.querySelector("[" + ctaWrapperAttr + "]");
      this.addIbanNode = this.el.querySelector("[" + addIbanAttr + "]");

      this.ctaNode.addEventListener("click", _addNewIban.bind(this));
    },
  };

  document.addEventListener("DOMContentLoaded", function () {
    E.factory.createPlugin(pluginName, attr, defaults, Plugin);
  });
})(window, document, window.E || {});
