(function() {
  var Voice, audio, i, len, ref, song, voice;

  ({Voice} = require('./voice'));

  audio = new AudioContext();

  song = {
    voices: [
      Voice(audio,
      {
        voice: {
          lfo: {
            type: 'Oscillator',
            settings: {
              frequency: 2.0
            }
          },
          gain: {
            type: 'Gain',
            settings: {
              gain: 0.4
            }
          }
        },
        instance: {
          osc1: {
            type: 'Oscillator',
            settings: {
              frequency: 100
            }
          },
          gain1: {
            type: 'Gain',
            settings: {
              gain: 0.2
            }
          }
        },
        voiceFn: "this.voice.gain.connect(output);",
        instanceFn: "this.instance.osc1.connect(this.instance.gain1);\nthis.instance.gain1.connect(this.voice.gain);"
      })
    ]
  };

  ref = song.voices;
  for (i = 0, len = ref.length; i < len; i++) {
    voice = ref[i];
    voice.voiceFn(audio.destination);
  }

  module.exports = {
    Tracker: function() {
      var process;
      process = function() {
        return requestAnimationFrame(process);
      };
      process();
      song.voices[0].play(audio.currentTime, 35, 0.5, 1.0, null);
      return {
        click: function() {
          return song.voices[0].play(audio.currentTime, 35, 0.5, 1.0, null);
        }
      };
    }
  };

}).call(this);

//# sourceMappingURL=tracker.js.map
