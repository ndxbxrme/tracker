{Voice, Global} = require './voice'
{noteByKey, indexByNote} = require './notefreq'
audio = new AudioContext()
song =
  patterns:
    pattern1:
      tracks: [
        name: 'track1'
        steps: [
          [0,indexByNote('C',3),0.5,1]
          [0,indexByNote('C',4),0.5,1]
          [0,indexByNote('E',3),0.5,1]
          [0,indexByNote('D',3),0.5,1]
        ]
      ,
        name: 'track2'
        steps: [
          [2,43, 0.5,1]
          [1,43, 0.5,1]
          null
          [1,43, 0.5,1]
        ]
      ]
  global: Global audio,
    nodes:
      gain:
        type: 'Gain'
        settings:
          gain: 0.8
      delay:
        type: 'Delay'
        settings:
          delayTime: 0.5
      filter:
        type: 'BiquadFilter'
        settings:
          type: 'lowpass'
          frequency: 600
    globalFn: """
      this.gain.connect(output);
      this.gain.connect(this.filter);
      this.input = this.gain;
    """
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
            gain: 0.02
      instance:
        osc1:
          type: 'Oscillator'
          settings:
            frequency: 500
        osc2:
          type: 'Oscillator'
          settings:
            type: 'square'
        gain1:
          type: 'Gain'
          settings:
            gain: 0.7
      voiceFn: """
        this.voice.gain.connect(output);
      """
      instanceFn: """
        console.log(this.freqByIndex(noteNo), startTime);
        this.instance.osc1.frequency.value = this.freqByIndex(noteNo);
        this.instance.osc1.connect(this.instance.gain1);
        this.instance.osc2.frequency.value = this.freqByIndex(noteNo + 7)
        this.instance.osc2.connect(this.instance.gain1);
        this.instance.gain1.connect(this.voice.gain);
        this.voice.lfo.connect(this.instance.osc1.frequency);
        this.adsr(this.instance.gain1.gain, startTime, 0.9, 0.2, 0.1, 0.01, length - 0.03, 0.01);
      """
    Voice audio,
      voice:
        gain:
          type: 'Gain'
          settings:
            gain: 0.7
      instance:
        buff:
          type: 'AudioBufferSource'
      voiceFn: """
        this.sample = await this.getFile('./app/15593__lewis__snaremathard.wav');
        this.voice.gain.connect(output);
      """
      instanceFn: """
        this.instance.buff.buffer = this.sample;
        this.instance.buff.connect(this.voice.gain);
      """
    Voice audio,
      voice:
        gain:
          type: 'Gain'
          settings:
            gain: 0.7
      instance:
        buff:
          type: 'AudioBufferSource'
      voiceFn: """
        this.sample = await this.getFile('./app/BEATUe5-10.wav');
        this.voice.gain.connect(output);
      """
      instanceFn: """
        this.instance.buff.buffer = this.sample;
        this.instance.buff.connect(this.voice.gain);
      """
          
  ]

module.exports =
  Tracker: ->
    analyzer = new AnalyserNode audio
    analyzer.connect audio.destination
    viz = require('./viz') analyzer
    song.global.globalFn analyzer
    for voice in song.voices
      await voice.voiceFn song.global.input
    keydown = (e) ->
      note = noteByKey e.key
      if note
        song.voices[0].play audio.currentTime, indexByNote(note.note, note.octave + 4), 0.5, 1.0, null
    window.addEventListener 'keydown', keydown

    bpm = 120
    stepsPerBeat = 1
    secsPerBeat = 60 / bpm
    secsPerStep = secsPerBeat / stepsPerBeat
    nextStepTime = 0
    pattern = 'pattern1'
    stepIndex = 0
    process = ->
      requestAnimationFrame process
      if audio.currentTime >= nextStepTime
        for track in song.patterns[pattern].tracks
          if note = track.steps[stepIndex]
            song.voices[note[0]].play audio.currentTime, note[1], note[2], note[3], null
        nextStepTime += secsPerStep
        stepIndex++
        stepIndex = 0 if stepIndex is song.patterns[pattern].tracks[0].steps.length
      viz.draw()
    process()