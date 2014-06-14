(function() {
  window.iframeTestUtils = function (callback) {
    function callbackWrapper () {
      callback();
      document.dispatchEvent(new CustomEvent('TestFrameworkReady'));
    }

    document.addEventListener('WebComponentsReady', callbackWrapper, false);
  };
})();