(function (window, document, E, undefined) {
  "use strict";

  var pluginName = "eInfosEMDM";
  var attr = "data-e-infosemdm";
  var ctaAttr = attr + "-cta";
  var targetAttr = attr + "-target";
  var defaults = {};

  var _toggle = function () {
    this.isOpened = !this.isOpened;

    this.ctaNode.setAttribute("aria-expanded", "" + !this.isOpened);
    this.panelNode.hidden = this.isOpened;
    this.panelNode.disabled = this.isOpened;
  };

  function Plugin() {
    this.isOpened = false;
  }

  Plugin.prototype = {
    init: function () {
      this.ctaNode = this.el.querySelector("[" + ctaAttr + "]");
      this.panelNode = this.el.querySelector("[" + targetAttr + "]");

      _toggle.call(this);

      this.ctaNode.addEventListener("click", _toggle.bind(this));
    },
  };

  document.addEventListener("DOMContentLoaded", function () {
    E.factory.createPlugin(pluginName, attr, defaults, Plugin);
  });
})(window, document, window.E || {});
