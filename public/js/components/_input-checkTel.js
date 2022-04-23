/*
JIRA: STUDIO-2487

  _input-checkTel.js
  ---------

  Description:
  -----------
  Fait appel à un service pour vérifier la validité d'un numéro de téléphone
  !!! à noter qu'en l'état on ne bloque pas l'utilisateur s'il continue de soumettre le même après avoir épuisé ses essais
*/

(function (window, document, E, undefined) {
  "use strict";

  var pluginName = "eInputChecktel";
  var attr = "data-e-input-checktel";
  var defaults = {
    service: "",
    retry: 2,
    message: "Le format du numéro semble incorrect",
  };

  var _disable = function () {
    this.el.classList.add("is-waiting");
    this.inputNode.readonly = true;
    this.el.dispatchEvent(new CustomEvent(pluginName + ".disable"));
  };

  var _enable = function () {
    this.el.classList.remove("is-waiting");
    this.inputNode.readonly = false;
    this.el.dispatchEvent(new CustomEvent(pluginName + ".enable"));
  };

  var _setError = function () {
    _enable.call(this);
    this.customError = true;
    this.el.eField.setCustomError(this.settings.message);
  };

  var _requestPage = function () {
    var that = this;
    var request = new XMLHttpRequest();
    var urlParam =
      "?pays=FRA&tel=" +
      this.inputNode.value +
      "&format=0&module=" +
      this.settings.Module;

    this.retry--;
    _disable.call(this);

    request.open("GET", this.settings.service + urlParam, true);

    request.timeout = 2000;

    request.ontimeout = function () {
      that.validTrigger();
    };

    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        if (!E.isJson(request.response)) {
          that.validTrigger();
          return;
        }

        var response = JSON.parse(request.response);
        var errorCode = response.reponse[1].idError;

        if (response.statut === "OK" && errorCode === 0) {
          _setError.call(that);
          return;
        }
      }

      that.validTrigger();
    };

    request.onerror = function (e) {
      that.validTrigger();
    };

    request.send(null);
  };

  function Plugin() {}

  Plugin.prototype = {
    init: function () {
      this.inputNode = this.el.querySelector("input");
      this.retry = this.settings.retry;
      this.previousValue = "";
      this.customError = false;

      this.el.addEventListener("eField.change", this.check.bind(this));
    },

    check: function () {
      // reset d'une eventuelle customError...
      this.el.eField.removeCustomError();

      if (!this.el.eField.isValid) {
        this.customError = false;
        this.el.eField.setInvalid();
        return;
      }

      // si value n'a pas changée, on remet le customError
      if (this.previousValue === this.inputNode.value && this.customError) {
        this.el.eField.setCustomError(this.settings.message);
        return;
      }

      this.previousValue = this.inputNode.value;

      // on arrête la vérification
      if (!this.retry) {
        this.validTrigger();
        return;
      }

      _requestPage.call(this);
    },

    validTrigger: function () {
      this.retry = 0;
      _enable.call(this);
      this.customError = false;

      // mise à jour statut du champs
      this.el.eField.setValid();
      this.el.eField.updateStatus();
    },
  };

  document.addEventListener("DOMContentLoaded", function () {
    E.factory.createPlugin(pluginName, attr, defaults, Plugin);
  });
})(window, document, window.E || {});
