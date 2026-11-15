/**
 * Separated IX (Interaction) Layer for Pure HTML/CSS Blueprints
 * Hydrates copy tokens from window.SS_TEXT and binds interactive UI events.
 */

(function () {
  function applySeparatedText() {
    var dict = window.SS_TEXT || {};
    document.querySelectorAll('[data-ss-text]').forEach(function (el) {
      var path = el.getAttribute('data-ss-text').split('.');
      var val = dict;
      for (var i = 0; i < path.length; i++) {
        val = val ? val[path[i]] : undefined;
      }
      if (typeof val === 'string') {
        el.textContent = val;
      }
    });
  }

  function bindCurrencyToggleIX() {
    document.querySelectorAll('[data-ss-ix="toggle-currency"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var next = btn.getAttribute('data-currency') === 'PHP' ? 'USD' : 'PHP';
        btn.setAttribute('data-currency', next);
        btn.textContent = next === 'USD' ? 'Showing USD ($)' : 'Showing PHP (₱)';
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    applySeparatedText();
    bindCurrencyToggleIX();
  });
})();
