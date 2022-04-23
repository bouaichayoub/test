/*
legalMention3.js
*/

(function (window, document, E, undefined) {
  "use strict";

  var pluginName = "eLegalMention3";
  var attr = "data-e-legalmention3";
  var defaults = {};

  var _onClick = function () {
    this.expanded = !this.expanded;
    this.nodes.button.setAttribute("aria-expanded", this.expanded);
    this.nodes.content.setAttribute("aria-hidden", !this.expanded);
  };

  var _request = function () {
    var that = this;
    var request = new XMLHttpRequest();

    request.open("GET", this.settings.url, true);
    request.setRequestHeader("Content-Type", "text/plain; charset=utf-8");

    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        var mentionContent = request.response;

        that.nodes.queryTarget.innerHTML = mentionContent + "";
      } else {
        console.log("Request failed");
      }
    };

    request.onerror = function () {
      console.log("Request failed");
    };

    request.send();
  };

  function Plugin() {
    this.expanded = true;
  }

  Plugin.prototype = {
    init: function () {
      this.nodes = {
        button: this.el.querySelector("[data-e-legalmention3-btn]"),
        content: this.el.querySelector("[data-e-legalmention3-content]"),
        queryTarget: this.el.querySelector("[data-e-legalmention3-query]"),
      };

      if (this.nodes.button) {
        this.nodes.button.addEventListener("click", _onClick.bind(this));
      }

      if (!this.nodes.queryTarget) return;

      _request.call(this);
    },
  };

  document.addEventListener("DOMContentLoaded", function () {
    E.factory.createPlugin(pluginName, attr, defaults, Plugin);
  });
})(window, document, window.E || {});
