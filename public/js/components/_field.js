/*
_field.js
*/

(function (window, document, E, undefined) {
  "use strict";

  var pluginName = "eField";
  var attr = "data-e-field";
  var attrStatus = attr + "-status";
  var attrInfo = attr + "-info";
  var attrExclude = attr + "-exclude";
  var defaults = {
    typing: false,
    expect: "",
    validations: {
      badInput: "badInput",
      typeMismatch: "typeMismatch",
      patternMismatch: "patternMismatch",
      rangeOverflow: "rangeOverflow",
      rangeUnderflow: "rangeUnderflow",
      stepMismatch: "stepMismatch",
      tooLong: "tooLong",
      tooShort: "tooShort",
      valueMissing: "Ce champ est obligatoire",
      customError: "customError",
    },
  };

  var _onUserInput = function (ev) {
    // ne pas checker sur 'enter', c'est un submit
    var keyupEnter =
      ev.type && ev.type === "keyup" && E.keyNames[ev.keyCode] === "enter";

    if (keyupEnter) return;

    // la validation se fera par un autre script
    if (this.asyncValidation) {
      this.el.dispatchEvent(new CustomEvent(pluginName + ".change"));
    } else {
      this.checkValidity();
    }
  };

  var _onFormChange = function () {
    // la validation se fera par un autre script
    if (this.asyncValidation) {
      this.el.dispatchEvent(new CustomEvent(pluginName + ".change"));
    } else {
      this.checkValidity(true);
    }
  };

  var _build = function () {
    var statusId = this.statusNode.id;
    var infoId = "";

    if (this.infoNode) infoId = this.infoNode.id;

    this.inputEls.forEach(function (node) {
      var describedby = statusId;
      if (infoId) describedby += " " + infoId;
      node.setAttribute("aria-describedby", describedby);
    });
  };

  var _events = function () {
    var that = this;

    if (this.settings.typing) {
      this.inputEl.addEventListener("keyup", _onUserInput.bind(this));
    }

    this.el.addEventListener("eForm.change", _onFormChange.bind(that));

    this.inputEls.forEach(function (node) {
      node.addEventListener("change", _onUserInput.bind(that));
    });
  };

  function Plugin() {}

  Plugin.prototype = {
    init: function () {
      this.inputEls = this.el.querySelectorAll(
        "input:not([" + attrExclude + "]), select, textarea"
      );
      this.inputEl = this.inputEls[0];
      this.inputElName = this.inputEl.name;
      this.formNode = this.el.closest("[data-e-form]");
      this.statusNode = this.el.querySelector("[" + attrStatus + "]");
      this.infoNode = this.el.querySelector("[" + attrInfo + "]");
      this.isValid = this.inputEl.validity.valid;
      this.asyncValidation =
        !!this.el.getAttribute("data-e-input-checkemail") ||
        !!this.el.getAttribute("data-e-input-checktel") ||
        !!this.el.getAttribute("data-e-upload");

      _build.call(this);
      _events.call(this);
    },

    checkValidity: function (onFormChange) {
      // firefox et IE valides même dans fieldset disabled...
      var dontValidate =
        !this.inputEl.willValidate || this.el.closest("[disabled]");
      if (dontValidate) return;

      // chrome et Firefox/IE ne gèrent pas les espace de fin de la même façon malgrès la regex... shame
      if (this.inputEl.type === "email") {
        this.inputEl.value = this.inputEl.value.trim();
      }

      // Le champs doit avoir une valeur précise si "expect" renseigné
      if (this.settings.expect && this.getValue() !== this.settings.expect) {
        this.setCustomError();
      }

      this.updateValidity();

      if (onFormChange) {
        this.updateStatus();
      }
    },

    updateValidity: function () {
      this.isValid = this.inputEl.validity.valid;
      this.isValid ? this.setValid() : this.setInvalid();
    },

    updateStatus: function () {
      this.formNode.eForm.getStatus(this.el, this.isValid);
    },

    getValue: function () {
      var value = "";

      if (this.inputEls.length > 1) {
        this.inputEls.forEach(function (node) {
          if (node.checked) {
            value = node.value;
          }
        });
      } else {
        value = this.inputEl.value;
      }

      return value;
    },

    setInvalid: function (mode) {
      var newList = "";
      this.isValid = false; // nécessaire si appel direct de la méthode

      // loop sur toutes les validités
      /*jshint forin:false */
      for (var prop in this.inputEl.validity) {
        // on boucle sur les propriété natives de 'validity'
        if (!this.inputEl.validity.hasOwnProperty(prop)) {
          if (
            prop === "valid" ||
            prop === "typeMismatch" ||
            prop === "customError"
          ) {
            continue;
          }

          if (this.inputEl.validity[prop]) {
            newList += "<p>" + this.settings.validations[prop] + "</p>";
          }
        }
      }
      /*jshint forin:true */

      this.inputEl.setAttribute("aria-invalid", "true");
      this.statusNode.innerHTML = newList;
      this.el.classList.add("is-error");
      this.el.classList.remove("is-success");
      this.el.dispatchEvent(new CustomEvent(pluginName + ".error"));
    },

    setValid: function () {
      this.isValid = true; // nécessaire si appel direct de la méthode

      this.inputEl.setCustomValidity("");
      this.statusNode.innerHTML = "";
      this.inputEl.removeAttribute("aria-invalid");

      this.el.classList.remove("is-error");
      if (this.inputEl.value) {
        this.el.classList.add("is-success");
      }
    },

    setCustomError: function (message, invisible) {
      this.isValid = false; // nécessaire si appel direct de la méthode

      var errorMessage = message
        ? message
        : this.settings.validations.customError;

      if (invisible) {
        this.statusNode.innerHTML = "";
        this.el.classList.remove("is-error");
        this.el.classList.remove("is-success");
      }

      this.el.classList.add("is-customError");
      this.el.classList.remove("is-success");

      this.inputEl.setCustomValidity(errorMessage);
      this.inputEl.setAttribute("aria-invalid", "true");

      if (!invisible) {
        this.el.classList.add("is-error");

        if (errorMessage) {
          this.statusNode.innerHTML = "<p>" + errorMessage + "</p>";
        }
      }
      this.el.dispatchEvent(new CustomEvent(pluginName + ".error"));
    },

    removeCustomError: function () {
      this.el.classList.remove("is-error");
      this.el.classList.remove("is-customError");

      this.inputEl.setCustomValidity("");
      this.statusNode.innerHTML = "";

      this.updateValidity();
    },
  };

  document.addEventListener("DOMContentLoaded", function () {
    E.factory.createPlugin(pluginName, attr, defaults, Plugin);
  });
})(window, document, window.E || {});
