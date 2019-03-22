{Voice} = require './voice'
audio = new AudioContext()
song =
  voices: [
    Voice audio, 
      voice:
        lfo:
          type: 'Oscillator'
          settings:
            frequency: 2.0
        gain:
          type: 'Gain'
          settings:
            gain: 0.4
      instance:
        osc1:
          type: 'Oscillator'
          settings:
            frequency: 100
        gain1:
          type: 'Gain'
          settings:
            gain: 0.2
      voiceFn: """
        this.voice.gain.connect(output);
      """
      instanceFn: """
        this.instance.osc1.connect(this.instance.gain1);
        this.instance.gain1.connect(this.voice.gain);
      """
          
  ]
for voice in song.voices
  voice.voiceFn audio.destination
module.exports =
  Tracker: ->
    process = ->
      requestAnimationFrame process
    process()
    song.voices[0].play audio.currentTime, 35, 0.5, 1.0, null
    click: ->
      song.voices[0].play audio.currentTime, 35, 0.5, 1.0, null