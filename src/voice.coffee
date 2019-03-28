#wavetable = require './wave-tables/dyna-ep-bright.json'
{freqByIndex} = require './notefreq'
fs = require 'fs-extra'
adsr = (ctx, time, aVal, aTime, dVal, dTime, sTime, rTime) ->
  ctx.setValueAtTime 0.0, time
  ctx.linearRampToValueAtTime aVal, time + aTime
  ctx.exponentialRampToValueAtTime dVal, time + aTime + dTime
  ctx.exponentialRampToValueAtTime dVal, time + aTime + dTime + sTime
  ctx.exponentialRampToValueAtTime 0.00001, time + aTime + dTime + sTime + rTime
module.exports =
  Global: (audio, settings) ->
    for key, node of settings.nodes
      this[key] = new window[node.type + 'Node'] audio, node.settings
      this[key].start audio.currentTime if this[key].start
    this.globalFn = new AsyncFunction 'output', settings.globalFn
    this
  Voice: (audio, settings) ->
    currentInstance = null
    
    voice = {}
    for key, node of settings.voice
      voice[key] = new window[node.type + 'Node'] audio, node.settings
      voice[key].start audio.currentTime if voice[key].start
        
    getFile: (filePath) ->
      console.log 'get file', filePath
      response = await fs.readFile filePath
      await audio.decodeAudioData response.buffer
    
    play: (startTime, noteNo, vel, length, global) -> 
      console.log @.instance
      instance = {}
      Object.values(this.instance).forEach (node) ->
        if node.gain and node.gain.value
          node.gain.cancelAndHoldAtTime startTime
          node.gain.linearRampToValueAtTime 0, startTime + 0.01
      for key, node of settings.instance
        instance[key] = new window[node.type + 'Node'] audio, node.settings
      @.instance = instance
      console.log 'noteNo', noteNo
      @.instanceFn startTime, noteNo, vel, length, global
      for key, node of @.instance
        node.start startTime if node.start
        node.stop startTime + length + 0.01 if node.stop
    voiceFn: new AsyncFunction 'output', settings.voiceFn
    instanceFn: new Function 'startTime,noteNo,vel,length,global', settings.instanceFn
    voice: voice
    instance: {}
    adsr: adsr
    freqByIndex: freqByIndex