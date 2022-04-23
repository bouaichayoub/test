/*
  Date-picker vendor flatepickr : https://chmln.github.io/flatpickr/
  - datePicker.input et datePicker.calendarContainer sont deux méthodes de flatepickr :
    * input renvoie à l'input associé au flatpickr
    * calendarContainer renvoie à l'élément div.flatpickr-calendar du datepicker

    $0._flatpickr permet d'accéder au flatpickr sur un input

    minDate: 'tomorrow' est une option rajoutée par ce script (pas native)
    disable: tableau de dates non disponible, le format de date dépend de `dateFormat`
    noWorkingDays: tableau de jours non travaillés
*/

(function (window, document, E, undefined) {
  "use strict";

  var attr = "data-e-input-date";

  if (!window.flatpickr) return;

  function initFlatpickr(el) {
    var inputNode = el.querySelector("input");
    var dataOptions = E.isJson(el.getAttribute(attr))
      ? JSON.parse(el.getAttribute(attr))
      : {};
    var defaultOptions = {
      dateFormat: "d/m/Y",
      allowInput: true,
      locale: "fr",
      disableMobile: true,
      monthSelectorType: "static", // dropdown est actuellement buggué (flatpickr 4.6.3 et 4.6.6 a un bug sur l'ouverture)
      disable: [],
    };
    var today = new Date();
    var settings = E.extend(true, defaultOptions, dataOptions);

    settings.onChange = [
      // déclencher valdiation du champs
      function (selectedDates, dateStr, instance) {
        var event = new CustomEvent("change", {
          detail: {
            selectedDates: selectedDates,
            dateStr: dateStr,
            instance: instance,
          },
        });
        inputNode.dispatchEvent(event);
      },
    ];

    // ajout d'une option 'tomorrow' non prévue par flatpickr
    if (settings.minDate && settings.minDate === "tomorrow") {
      settings.minDate = new Date().fp_incr(1);
    }

    if (settings.dayMin) {
      settings.minDate = today.fp_incr(settings.dayMin);
    }

    if (settings.dayMax) {
      settings.maxDate = today.fp_incr(settings.dayMax);
    }

    if (settings.noWorkingDays) {
      settings.noWorkingDays.forEach(function (elem) {
        switch (elem) {
          case "dim":
            settings.disable.push(function (date) {
              return date.getDay() === 0;
            });
            break;
          case "lun":
            settings.disable.push(function (date) {
              return date.getDay() === 1;
            });
            break;
          case "mar":
            settings.disable.push(function (date) {
              return date.getDay() === 2;
            });
            break;
          case "mer":
            settings.disable.push(function (date) {
              return date.getDay() === 3;
            });
            break;
          case "jeu":
            settings.disable.push(function (date) {
              return date.getDay() === 4;
            });
            break;
          case "ven":
            settings.disable.push(function (date) {
              return date.getDay() === 5;
            });
            break;
          case "sam":
            settings.disable.push(function (date) {
              return date.getDay() === 6;
            });
            break;
        }
      });
    }

    window.flatpickr(inputNode, settings);

    if (!AB.mediaQuery.is("smallOnly")) {
      flatepickrTheme(el, inputNode);
    }
  }

  function flatepickrTheme(el, inputNode) {
    var regex = /u-theme-/;
    var inputClass = el.classList;

    // recherche d'un thème pour le copier sur flatpickr
    for (var i = 0, len = inputClass.length; i < len; i++) {
      if (regex.test(inputClass[i])) {
        inputNode._flatpickr.calendarContainer.classList.add(inputClass[i]);
      }
    }
  }

  document.addEventListener("DOMContentLoaded", function (ev) {
    var elements = document.querySelectorAll("[" + attr + "]");

    elements.forEach(function (node) {
      initFlatpickr(node);
    });
  });
})(window, document, window.E || {});
