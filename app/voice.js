(function() {
  //wavetable = require './wave-tables/dyna-ep-bright.json'
  var adsr, freqByIndex, fs;

  ({freqByIndex} = require('./notefreq'));

  fs = require('fs-extra');

  adsr = function(ctx, time, aVal, aTime, dVal, dTime, sTime, rTime) {
    ctx.setValueAtTime(0.0, time);
    ctx.linearRampToValueAtTime(aVal, time + aTime);
    ctx.exponentialRampToValueAtTime(dVal, time + aTime + dTime);
    ctx.exponentialRampToValueAtTime(dVal, time + aTime + dTime + sTime);
    return ctx.exponentialRampToValueAtTime(0.00001, time + aTime + dTime + sTime + rTime);
  };

  module.exports = {
    Global: function(audio, settings) {
      var key, node, ref;
      ref = settings.nodes;
      for (key in ref) {
        node = ref[key];
        this[key] = new window[node.type + 'Node'](audio, node.settings);
        if (this[key].start) {
          this[key].start(audio.currentTime);
        }
      }
      this.globalFn = new AsyncFunction('output', settings.globalFn);
      return this;
    },
    Voice: function(audio, settings) {
      var currentInstance, key, node, ref, voice;
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
        getFile: async function(filePath) {
          var response;
          console.log('get file', filePath);
          response = (await fs.readFile(filePath));
          return (await audio.decodeAudioData(response.buffer));
        },
        play: function(startTime, noteNo, vel, length, global) {
          var instance, ref1, ref2, results;
          console.log(this.instance);
          instance = {};
          Object.values(this.instance).forEach(function(node) {
            if (node.gain && node.gain.value) {
              node.gain.cancelAndHoldAtTime(startTime);
              return node.gain.linearRampToValueAtTime(0, startTime + 0.01);
            }
          });
          ref1 = settings.instance;
          for (key in ref1) {
            node = ref1[key];
            instance[key] = new window[node.type + 'Node'](audio, node.settings);
          }
          this.instance = instance;
          console.log('noteNo', noteNo);
          this.instanceFn(startTime, noteNo, vel, length, global);
          ref2 = this.instance;
          results = [];
          for (key in ref2) {
            node = ref2[key];
            if (node.start) {
              node.start(startTime);
            }
            if (node.stop) {
              results.push(node.stop(startTime + length + 0.01));
            } else {
              results.push(void 0);
            }
          }
          return results;
        },
        voiceFn: new AsyncFunction('output', settings.voiceFn),
        instanceFn: new Function('startTime,noteNo,vel,length,global', settings.instanceFn),
        voice: voice,
        instance: {},
        adsr: adsr,
        freqByIndex: freqByIndex
      };
    }
  };

}).call(this);

//# sourceMappingURL=voice.js.map
