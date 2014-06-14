(function() {

  var __channels = 0;

  document.addEventListener('WebComponentsReady', function (e) {

    var element = document.querySelector("*[data-analyze]");

    if (element && typeof element.ceci === 'object') {

      var gui = new dat.GUI();

      var editableFolder = gui.addFolder('Editable');
      var broadcastsFolder = gui.addFolder('Broadcasts');
      var listenersFolder = gui.addFolder('Listeners');

      Object.keys(element.ceci.listeners).forEach(function (listenerKey) {
        var model = {};

        var listenerLabel = 'Send';
        var inputLabel = 'Value';
        var toggleControllerName = 'Listen';

        var subFolder = listenersFolder.addFolder(listenerKey);

        model[inputLabel] = element.getAttribute(listenerKey.substr(3)) || '';

        model[listenerLabel] = function (v) {
          var broadcastElement = document.querySelector('ceci-broadcast[from="Broadcast ' + listenerKey + '"]');
          if (broadcastElement) {
            broadcastElement.fire(model[inputLabel]);
          }
          else {
            console.error('No broadcast element for Broadcast ' + listenerKey + '.');
          }
        };

        subFolder.add(model, inputLabel);
        subFolder.add(model, listenerLabel);

        var channel = 'Channel ' + __channels++;

        var broadcastElement = document.createElement('ceci-broadcast');
        broadcastElement.setAttribute('from', 'Broadcast ' + listenerKey);
        broadcastElement.setAttribute('on', channel);

        document.body.appendChild(broadcastElement);

        model[toggleControllerName] = !!element.ceci.listeners[listenerKey]['default'];

        var controller = subFolder.add(model, toggleControllerName);
        controller.onChange(function (value) {
          value ? element.setListener(listenerKey, channel) : element.removeListener(listenerKey, channel);
        });

        if (model[toggleControllerName]) {
          element.setListener(listenerKey, channel);
          subFolder.open();
        }
      });

      Object.keys(element.ceci.broadcasts).forEach(function (broadcastKey) {
        var model = {};
        var subFolder = broadcastsFolder.addFolder(broadcastKey);
        var channel = 'Channel ' + __channels++;
        var broadcastLabel = 'Broadcast';
        model[broadcastLabel] = !!element.ceci.broadcasts[broadcastKey]['default'];
        model['Output'] = '';

        var controller = subFolder.add(model, broadcastLabel);

        controller.onChange(function (value) {
          value ? element.setBroadcast(broadcastKey, channel) : element.removeBroadcast(broadcastKey, channel);
        });

        var outputController = subFolder.add(model, 'Output');

        document.addEventListener(channel, function (e) {
          model['Output'] = e.detail.data;
          outputController.updateDisplay();
        }, false);

        if (model[broadcastLabel]) {
          element.setBroadcast(broadcastKey, channel);
          subFolder.open();
        }
      });

      Object.keys(element.ceci.editables).forEach(function (editableKey) {
        var subFolder = editableFolder.addFolder(editableKey);
        var model = {};
        var controller;

        model[editableKey] = element.getAttribute(editableKey) || '';
        if (model[editableKey] && element.ceci.editables[editableKey].type === 'color') {
          controller = subFolder.addColor(model, editableKey);
        }
        else {
          controller = subFolder.add(model, editableKey)
        }

        controller.onChange(function (value) {
          element.setAttribute(editableKey, value);
        });
        subFolder.open();
      });

      listenersFolder.open();
      broadcastsFolder.open();
      editableFolder.open();

      var descriptionElement = document.querySelector('#description');
      descriptionElement.querySelector('h1').innerHTML = element.localName;
      var thumbnailImage = document.createElement('img');
      thumbnailImage.src = element.ceci.thumbnail;
      descriptionElement.querySelector('#thumbnail').appendChild(thumbnailImage);
      descriptionElement.querySelector('#tags').appendChild(document.createTextNode(element.ceci.tags.join(', ')));
    }
    else {
      console.error('No ceci element marked with data-analyze');
    }

  }, false);

})();
