/*
_rgpd.js
*/

(function (window, document, E, undefined) {
  "use strict";

  var pluginName = "eRgpd";
  var attr = "data-e-rgpd";
  var attrMaster = attr + "-master";
  var attrSlave = attr + "-slave";
  var attrLegal = attr + "-legal";
  var attrfieldset = attr + "-fieldset";
  var defaults = {};

  function Plugin() {}

  Plugin.prototype = {
    init: function () {
      this.legalNodes = this.el.querySelectorAll("[" + attrLegal + "]");
      this.masterNode = this.el.querySelector("[" + attrMaster + "]");
      this.slaveNode = this.el.querySelector("[" + attrSlave + "]");
      this.fieldsetNode = this.el.querySelector("[" + attrfieldset + "]");

      this.initialValue = this.slaveNode.value;

      // affichage selon connecté/déconnecté
      this.updateDisplay();

      // mise à jour input hidden mirroir
      this.updateSlave();
      this.masterNode.addEventListener("change", this.updateSlave.bind(this));
    },

    updateSlave: function () {
      if (this.masterNode.checked) this.slaveNode.value = this.masterNode.value;
      else this.slaveNode.value = this.initialValue;
    },

    updateDisplay: function () {
      if (E.storage.getItem("CEL_MOM")) {
        this.legalNodes.forEach(function (node) {
          node.hidden = !node.hidden;
        });

        this.fieldsetNode.disabled = true;
        this.fieldsetNode.hidden = true;
      } else {
        this.fieldsetNode.disabled = false;
        this.fieldsetNode.hidden = false;
      }
    },
  };

  document.addEventListener("DOMContentLoaded", function () {
    E.factory.createPlugin(pluginName, attr, defaults, Plugin);
  });
})(window, document, window.E || {});
