(function() {
  var adsr, wavetable;

  wavetable = require('./wave-tables/dyna-ep-bright.json');

  adsr = function(ctx, time, aVal, aTime, dVal, dTime, sTime, rTime) {
    ctx.setValueAtTime(0.0, time);
    ctx.linearRampToValueAtTime(aVal, time + aTime);
    ctx.exponentialRampToValueAtTime(dVal, time + aTime + dTime);
    ctx.exponentialRampToValueAtTime(dVal, time + aTime + dTime + sTime);
    return ctx.exponentialRampToValueAtTime(0.00001, time + aTime + dTime + sTime + rTime);
  };

  module.exports = {
    Voice: function(audio, settings) {
      var currentInstance, key, node, ref, voice, wave;
      wave = audio.createPeriodicWave(wavetable.real, wavetable.imag);
      currentInstance = null;
      voice = {};
      ref = settings.voice;
      for (key in ref) {
        node = ref[key];
        voice[key] = new window[node.type + 'Node'](audio, node.settings);
        if (voice[key].start) {
          voice[key].start(audio.currentTime);
        }
      }
      return {
        play: function(startTime, noteNo, vel, length, global) {
          var instance, ref1, ref2, results;
          instance = {};
          ref1 = settings.instance;
          for (key in ref1) {
            node = ref1[key];
            instance[key] = new window[node.type + 'Node'](audio, node.settings);
          }
          this.instance = instance;
          this.instanceFn(startTime, noteNo, vel, length, global);
          ref2 = this.instance;
          results = [];
          for (key in ref2) {
            node = ref2[key];
            if (node.start) {
              node.start(startTime);
            }
            if (node.stop) {
              results.push(node.stop(startTime + length));
            } else {
              results.push(void 0);
            }
          }
          return results;
        },
        voiceFn: new Function('output', settings.voiceFn),
        instanceFn: new Function('startTime,noteNo,vel,length,global', settings.instanceFn),
        voice: voice,
        instance: null
      };
    }
  };

}).call(this);

//# sourceMappingURL=voice.js.map
