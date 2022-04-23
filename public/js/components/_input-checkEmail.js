/*
JIRA: STUDIO-2487

  _input-checkEmail.js
  ---------

  Description:
  -----------
  Fait appel à un service pour vérifier la validité d'un email
  !!! à noter qu'en l'état on ne bloque pas l'utilisateur s'il continue de soumettre le même email après avoir épuisé ses essais
*/

(function (window, document, E, undefined) {
  "use strict";

  var pluginName = "eInputCheckemail";
  var attr = "data-e-input-checkemail";
  var defaults = {
    service: "",
    retry: 2,
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

  var _checkError = function (code) {
    switch (code) {
      case "02":
        this.errorMessage =
          "L'email saisi n'existe pas (nom de domaine). Renseignez un email valide pour continuer.";
        break;
      case "04":
        this.errorMessage = "Saisir un email.";
        break;
      case "91":
        this.errorMessage = "Le format de l'email est invalide.";
        break;
      case "92":
        this.errorMessage =
          "Il semble que le format de votre adresse email soit incorrect.";
        break;
      case "93":
      case "94":
        this.errorMessage =
          "Votre email est considéré comme un spam. Veuillez renseigner un email valide pour continuer.";
        break;
      case "95":
        this.errorMessage =
          "Merci de renseigner un email non jetable pour continuer.";
        break;
      default:
        break;
    }

    if (this.errorMessage) {
      _enable.call(this);
      this.el.eField.setCustomError(this.errorMessage);

      if (code === "92") {
        this.el.dispatchEvent(new CustomEvent(pluginName + ".isWarning"));
      }
    } else {
      this.validTrigger();
    }
  };

  var _request = function () {
    var that = this;
    var request = new XMLHttpRequest();
    var urlParam =
      "?Module=" +
      this.settings.Module +
      "&Email=" +
      this.inputNode.value +
      "&Rectify=1";

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

        that.response = JSON.parse(request.response);

        if (that.response.statut === "OK") {
          _checkError.call(that, that.response.reponse[1].IdError);
        } else {
          that.validTrigger();
        }
      } else {
        that.validTrigger();
      }
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
      this.formNode = this.el.closest("form");
      this.retry = this.settings.retry;
      this.previousValue = "";
      this.errorMessage = "";

      this.el.addEventListener("eField.change", this.check.bind(this));
    },

    check: function () {
      // reset d'une eventuelle customError...
      this.el.eField.removeCustomError();

      // ... pour gérer erreur natives
      if (!this.el.eField.isValid) {
        this.errorMessage = "";
        this.el.eField.setInvalid();
        return;
      }

      // si value n'a pas changée, on remet le customError
      if (this.previousValue === this.inputNode.value && this.errorMessage) {
        this.el.eField.setCustomError(this.errorMessage);
        return;
      }

      this.previousValue = this.inputNode.value;

      // on laisse passer si plus de retry
      if (!this.retry) {
        this.validTrigger();
        return;
      }

      // sinon appel service
      _request.call(this);
    },

    validTrigger: function () {
      this.retry = 0;
      _enable.call(this);
      this.errorMessage = "";

      // mise à jour statut du champs
      this.el.eField.setValid();
      this.el.eField.updateStatus();
    },
  };

  document.addEventListener("DOMContentLoaded", function () {
    E.factory.createPlugin(pluginName, attr, defaults, Plugin);
  });
})(window, document, window.E || {});
