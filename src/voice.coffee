wavetable = require './wave-tables/dyna-ep-bright.json'
adsr = (ctx, time, aVal, aTime, dVal, dTime, sTime, rTime) ->
  ctx.setValueAtTime 0.0, time
  ctx.linearRampToValueAtTime aVal, time + aTime
  ctx.exponentialRampToValueAtTime dVal, time + aTime + dTime
  ctx.exponentialRampToValueAtTime dVal, time + aTime + dTime + sTime
  ctx.exponentialRampToValueAtTime 0.00001, time + aTime + dTime + sTime + rTime
module.exports =
  Voice: (audio, settings) ->
    wave = audio.createPeriodicWave wavetable.real, wavetable.imag
    currentInstance = null
    
    voice = {}
    for key, node of settings.voice
      voice[key] = new window[node.type + 'Node'] audio, node.settings
      voice[key].start audio.currentTime if voice[key].start
    
    play: (startTime, noteNo, vel, length, global) -> 
      instance = {}
      for key, node of settings.instance
        instance[key] = new window[node.type + 'Node'] audio, node.settings
      @.instance = instance
      @.instanceFn startTime, noteNo, vel, length, global
      for key, node of @.instance
        node.start startTime if node.start
        node.stop startTime + length if node.stop
    voiceFn: new Function 'output', settings.voiceFn
    instanceFn: new Function 'startTime,noteNo,vel,length,global', settings.instanceFn
    voice: voice
    instance: null