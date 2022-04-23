/*
_form.js
*/

(function (window, document, E, undefined) {
  "use strict";

  var pluginName = "eForm";
  var attr = "data-e-form";
  var attrSubmit = attr + "-submit";
  var defaults = {
    switchBtnState: false,
  };

  var _scroll2Error = function () {
    var that = this;
    clearTimeout(this.errorTimeout);

    this.errorTimeout = setTimeout(function () {
      var target = that.el.querySelector("[data-e-field].is-error");
      if (target) {
        E.scrollTo({
          next: target,
          offset: 110,
        });
      }
    }, 500);
  };

  var _onSubmit = function (ev) {
    if (ev) ev.preventDefault();

    this.fields = this.getEnabledFields();
    var onChange = new CustomEvent(pluginName + ".change");

    this.isWaiting = true;
    this.el.classList.add("is-waiting");

    this.fields.forEach(function (field) {
      field.node.dispatchEvent(onChange);
    });
  };

  function Plugin() {
    var that = this;
    this.timeout;
    this.fields = [];
    this.isWaiting = false; // peut être utile
    this.callback;
    this.errorTimeout;
  }

  Plugin.prototype = {
    init: function () {
      this.submitBtn = this.el.querySelector("[" + attrSubmit + "]");

      if (this.settings.switchBtnState) {
        this.submitBtn.classList.add("is-disabled");
      }

      this.el.addEventListener("submit", _onSubmit.bind(this));
    },

    isValid: function () {
      return (
        this.fields.length > 0 &&
        this.fields.every(function (item) {
          return item.isValid;
        })
      );
    },

    // permet de valider le formulaire et de lancer le callback si pas d'erreurs
    ifValid: function (callback) {
      this.callback = callback;
      _onSubmit.call(this);
    },

    getStatus: function (field, isValid) {
      if (!this.fields.length || typeof isValid !== "boolean") return;

      // on cherche si déjà présent dans this.fields
      var fieldIndex = this.fields.findIndex(function (item) {
        return item.node === field;
      });

      // sinon, on l'ajoute
      if (typeof fieldIndex === "undefined") {
        this.fields.push({ node: field, isValid: isValid });
      } else {
        this.fields[fieldIndex].isValid = isValid;
      }

      // si tout this.fields sont validées (true ou false)
      if (
        this.fields.every(function (item) {
          return typeof item.isValid === "boolean";
        })
      ) {
        this.isWaiting = false;
        this.el.classList.remove("is-waiting");

        this.updateFormStatus();
      } else {
        _scroll2Error.call(this);
      }
    },

    updateFormStatus: function () {
      if (this.isValid) {
        var sendForm = new CustomEvent(pluginName + ".send", { detail: this });
        this.el.dispatchEvent(sendForm);
        if (this.callback) {
          this.callback();
        }
      } else {
        this.el.dispatchEvent(
          new CustomEvent(pluginName + ".error", { detail: this })
        );
        _scroll2Error.call(this);
      }

      // pas de callback si des erreurs
      this.callback = null;
    },

    getEnabledFields: function () {
      var fields = [];
      var fieldNodes = [].slice.call(
        this.el.querySelectorAll("[data-e-field]")
      );

      var enabledFields = fieldNodes.filter(function (node) {
        return !node.closest("[disabled]");
      });

      enabledFields.forEach(function (field) {
        fields.push({ node: field });
      });

      return fields;
    },
  };

  document.addEventListener("DOMContentLoaded", function () {
    E.factory.createPlugin(pluginName, attr, defaults, Plugin);
  });
})(window, document, window.E);
