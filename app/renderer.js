(function() {
  var Tracker, tracker;

  ({Tracker} = require('./tracker'));

  tracker = Tracker();

  document.body.addEventListener('click', tracker.click);

}).call(this);

//# sourceMappingURL=renderer.js.map
