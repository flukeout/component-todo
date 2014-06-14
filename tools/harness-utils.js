(function () {
  var __htmlbase = '';

  mocha.htmlbase = function (b) {__htmlbase = b;};

  window.harnessUtils = {
    createIframe: function (url, callback) {
      var handler;

      var iframe = document.createElement('iframe');
      var iframeWindow, iframeDocument;

      function callbackWrapper () {
        callback(iframe.contentWindow, iframe.contentWindow.document);
      }

      iframe.onload = function (e) {
        // expose very small test framework to the iframe
        iframe.contentWindow.test = function (name, testFn) {
          handler.iframeTests[name] = testFn;
        };
        iframe.contentWindow.chai = window.chai;

        iframeWindow = handler.window = iframe.contentWindow;
        iframeDocument = handler.document = iframe.contentWindow.document;

        if (iframeWindow.document.iframeTestUtils) {
          iframe.contentWindow.document.addEventListener('TestFrameworkReady', callbackWrapper, false);
        }
        else {
          iframe.contentWindow.document.addEventListener('WebComponentsReady', callbackWrapper, false);
        }
      };

      iframe.src = __htmlbase + url;
      iframe.className = 'harness-instance';
      document.body.appendChild(iframe);

      handler = {
        iframeTests: {},
        iframe: iframe,
        createBroadcastElement: function (onAttribute, fromAttribute) {
          var el = iframeDocument.createElement('ceci-broadcast');
          el.setAttribute('on', onAttribute);
          el.setAttribute('from', fromAttribute);
          return el;
        },
        createListenElement: function (onAttribute, forAttribute) {
          var el = iframeDocument.createElement('ceci-listen');
          el.setAttribute('on', onAttribute);
          el.setAttribute('for', forAttribute);
          return el;
        },
        broadcast: function (onAttribute, data) {
          data = data || '';
          iframeDocument.dispatchEvent(new iframeWindow.CustomEvent(onAttribute, {detail: {data: data}}));
        },
        runIframeTest: function (name, callback) {
          if (handler.iframeTests[name]) {
            handler.iframeTests[name](callback);
          }
          else {
            console.error('No iframe test named ' + name + '.');
          }
        },
        testListeners: function (element, done, opts) {
          var listeners = element.ceci.listeners;
          var listenerKeys = Object.keys(listeners);
          var completedListeners = 0;

          var checkFunctions = opts.check || {};
          var executeFunctions = opts.execute || {};

          function checkForDone () {
            if (++completedListeners === listenerKeys.length) {
              done();
            }
          }

          listenerKeys.forEach(function (key, index) {
            var channel = 'Channel' + index;
            var listenElement = element.querySelector('ceci-listen[for="' + key + '"]');

            if (!listenElement) {
              listenElement = handler.createListenElement(iframeDocument, channel, key);
              element.appendChild(listenElement);
            }
            else {
              listenElement.setAttribute('on', channel);
            }

            iframeDocument.addEventListener(channel, function (e) {
              checkFunctions[key] && checkFunctions[key](e, channel);
              checkForDone();
            }, false);

            executeFunctions[key] = executeFunctions[key] || function () {
              var e = new iframeWindow.CustomEvent(channel, {detail: Math.random()} );
              iframeDocument.dispatchEvent(e);
            };

            executeFunctions[key](channel);
          });
        },
        testBroadcasts: function (element, done, opts) {
          var broadcasts = element.ceci.broadcasts;
          var broadcastKeys = Object.keys(broadcasts);
          var completedBroadcasts = 0;

          var checkFunctions = opts.check || {};
          var executeFunctions = opts.execute || {};

          function checkForDone () {
            if (++completedBroadcasts === broadcastKeys.length) {
              done();
            }
          }

          broadcastKeys.forEach(function (key, index) {
            var channel = 'Channel' + index;
            var broadcastElement = element.querySelector('ceci-broadcast[from="' + key + '"]');

            if (!broadcastElement) {
              broadcastElement = handler.createBroadcastElement(iframeDocument, channel, key);
              element.appendChild(broadcastElement);
            }
            else {
              broadcastElement.setAttribute('on', channel);
            }

            iframeDocument.addEventListener(channel, function (e) {
              checkFunctions[key] && checkFunctions[key](e, channel);
              checkForDone();
            }, false);

            executeFunctions[key] && executeFunctions[key]();
          });
        }
      };

      return handler;
    }
  };
})();
