(function() {
  var Global, Voice, audio, indexByNote, noteByKey, song;

  ({Voice, Global} = require('./voice'));

  ({noteByKey, indexByNote} = require('./notefreq'));

  audio = new AudioContext();

  song = {
    patterns: {
      pattern1: {
        tracks: [
          {
            name: 'track1',
            steps: [[0,
          indexByNote('C',
          3),
          0.5,
          1],
          [0,
          indexByNote('C',
          4),
          0.5,
          1],
          [0,
          indexByNote('E',
          3),
          0.5,
          1],
          [0,
          indexByNote('D',
          3),
          0.5,
          1]]
          },
          {
            name: 'track2',
            steps: [null,
          [1,
          43,
          0.5,
          1],
          null,
          [1,
          43,
          0.5,
          1]]
          }
        ]
      }
    },
    global: Global(audio, {
      nodes: {
        gain: {
          type: 'Gain',
          settings: {
            gain: 0.8
          }
        },
        delay: {
          type: 'Delay',
          settings: {
            delayTime: 0.5
          }
        },
        filter: {
          type: 'BiquadFilter',
          settings: {
            type: 'lowpass',
            frequency: 600
          }
        }
      },
      globalFn: "this.gain.connect(output);\nthis.gain.connect(this.filter);\nthis.input = this.gain;"
    }),
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
              gain: 0.7
            }
          }
        },
        instance: {
          osc1: {
            type: 'Oscillator',
            settings: {
              frequency: 500
            }
          },
          osc2: {
            type: 'Oscillator',
            settings: {
              type: 'square'
            }
          },
          gain1: {
            type: 'Gain',
            settings: {
              gain: 0.7
            }
          }
        },
        voiceFn: "this.voice.gain.connect(output);",
        instanceFn: "console.log(this.freqByIndex(noteNo), startTime);\nthis.instance.osc1.frequency.value = this.freqByIndex(noteNo);\nthis.instance.osc1.connect(this.instance.gain1);\nthis.instance.osc2.frequency.value = this.freqByIndex(noteNo + 7)\nthis.instance.osc2.connect(this.instance.gain1);\nthis.instance.gain1.connect(this.voice.gain);\nthis.voice.lfo.connect(this.instance.osc1.frequency);\nthis.adsr(this.instance.gain1.gain, startTime, 0.9, 0, 0.1, 0.01, length - 0.03, 0.01);"
      }),
      Voice(audio,
      {
        voice: {
          gain: {
            type: 'Gain',
            settings: {
              gain: 0.7
            }
          }
        },
        instance: {
          buff: {
            type: 'AudioBufferSource'
          }
        },
        voiceFn: "this.sample = await this.getFile('./15593__lewis__snaremathard.wav');\nthis.voice.gain.connect(output);",
        instanceFn: "this.instance.buff.buffer = this.sample;\nthis.instance.buff.connect(this.voice.gain);"
      })
    ]
  };

  module.exports = {
    Tracker: async function() {
      var analyzer, bpm, i, keydown, len, nextStepTime, pattern, process, ref, secsPerBeat, secsPerStep, stepIndex, stepsPerBeat, viz, voice;
      analyzer = new AnalyserNode(audio);
      analyzer.connect(audio.destination);
      viz = require('./viz')(analyzer);
      song.global.globalFn(analyzer);
      ref = song.voices;
      for (i = 0, len = ref.length; i < len; i++) {
        voice = ref[i];
        await voice.voiceFn(song.global.input);
      }
      keydown = function(e) {
        var note;
        note = noteByKey(e.key);
        if (note) {
          return song.voices[0].play(audio.currentTime, indexByNote(note.note, note.octave + 4), 0.5, 1.0, null);
        }
      };
      window.addEventListener('keydown', keydown);
      bpm = 120;
      stepsPerBeat = 1;
      secsPerBeat = 60 / bpm;
      secsPerStep = secsPerBeat / stepsPerBeat;
      nextStepTime = 0;
      pattern = 'pattern1';
      stepIndex = 0;
      process = function() {
        var j, len1, note, ref1, track;
        requestAnimationFrame(process);
        if (audio.currentTime >= nextStepTime) {
          ref1 = song.patterns[pattern].tracks;
          for (j = 0, len1 = ref1.length; j < len1; j++) {
            track = ref1[j];
            if (note = track.steps[stepIndex]) {
              song.voices[note[0]].play(audio.currentTime, note[1], note[2], note[3], null);
            }
          }
          nextStepTime += secsPerStep;
          stepIndex++;
          if (stepIndex === song.patterns[pattern].tracks[0].steps.length) {
            stepIndex = 0;
          }
        }
        return viz.draw();
      };
      return process();
    }
  };

}).call(this);

//# sourceMappingURL=tracker.js.map
