// ─── Aegis Soundscapes Engine (Web Audio API Procedural Generator & Streamer) ───
// Zero network dependencies for ambient noises, 100% offline-ready, zero latency.

class SoundscapeEngine {
  private ctx: AudioContext | null = null
  private rainGain: GainNode | null = null
  private fireGain: GainNode | null = null
  private windGain: GainNode | null = null
  private brownGain: GainNode | null = null
  private masterGain: GainNode | null = null

  // Rain nodes
  private rainSource: AudioBufferSourceNode | null = null
  // Fire nodes
  private fireTimer: any = null
  // Wind nodes
  private windSource: AudioBufferSourceNode | null = null
  private windFilter: BiquadFilterNode | null = null
  private windLfo: OscillatorNode | null = null
  // Brown noise
  private brownSource: AudioBufferSourceNode | null = null

  private isInitialized = false

  private initContext() {
    if (this.ctx && this.ctx.state !== 'closed') {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume()
      }
      return this.ctx
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return null
    this.ctx = new AudioContextClass()

    this.masterGain = this.ctx.createGain()
    this.masterGain.gain.setValueAtTime(1, this.ctx.currentTime)
    this.masterGain.connect(this.ctx.destination)

    // Setup ambient gains
    this.rainGain = this.ctx.createGain()
    this.rainGain.gain.setValueAtTime(0, this.ctx.currentTime)
    this.rainGain.connect(this.masterGain)

    this.fireGain = this.ctx.createGain()
    this.fireGain.gain.setValueAtTime(0, this.ctx.currentTime)
    this.fireGain.connect(this.masterGain)

    this.windGain = this.ctx.createGain()
    this.windGain.gain.setValueAtTime(0, this.ctx.currentTime)
    this.windGain.connect(this.masterGain)

    this.brownGain = this.ctx.createGain()
    this.brownGain.gain.setValueAtTime(0, this.ctx.currentTime)
    this.brownGain.connect(this.masterGain)

    this.setupRain()
    this.setupFire()
    this.setupWind()
    this.setupBrownNoise()

    this.isInitialized = true
    return this.ctx
  }

  // 1. Procedural Rain generator (band-passed pink noise)
  private setupRain() {
    if (!this.ctx || !this.rainGain) return
    const bufferSize = this.ctx.sampleRate * 2
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.96900 * b2 + white * 0.1538520
      b3 = 0.86650 * b3 + white * 0.3104856
      b4 = 0.55000 * b4 + white * 0.5329522
      b5 = -0.7616 * b5 - white * 0.0168980
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
      b6 = white * 0.115926
    }

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime)

    const source = this.ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    source.connect(filter)
    filter.connect(this.rainGain)
    source.start(0)
    this.rainSource = source
  }

  // 2. Procedural Fireplace (low rumble + random crackle pops)
  private setupFire() {
    if (!this.ctx || !this.fireGain) return

    // Continuous low rumble
    const bufferSize = this.ctx.sampleRate * 2
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let lastOut = 0.0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      data[i] = (lastOut + 0.02 * white) / 1.02
      lastOut = data[i]
      data[i] *= 1.5
    }

    const rumbleFilter = this.ctx.createBiquadFilter()
    rumbleFilter.type = 'lowpass'
    rumbleFilter.frequency.setValueAtTime(250, this.ctx.currentTime)

    const rumbleSource = this.ctx.createBufferSource()
    rumbleSource.buffer = buffer
    rumbleSource.loop = true
    rumbleSource.connect(rumbleFilter)
    rumbleFilter.connect(this.fireGain)
    rumbleSource.start(0)

    // Intermittent crackles
    const triggerCrackle = () => {
      if (!this.ctx || !this.fireGain || this.fireGain.gain.value <= 0.01) {
        this.fireTimer = setTimeout(triggerCrackle, 100 + Math.random() * 300)
        return
      }

      try {
        const osc = this.ctx.createOscillator()
        const clickGain = this.ctx.createGain()
        const now = this.ctx.currentTime

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(800 + Math.random() * 2200, now)

        clickGain.gain.setValueAtTime(0, now)
        clickGain.gain.linearRampToValueAtTime(0.08 * (this.fireGain.gain.value || 1), now + 0.002)
        clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04)

        osc.connect(clickGain)
        clickGain.connect(this.fireGain)

        osc.start(now)
        osc.stop(now + 0.05)
      } catch {}

      this.fireTimer = setTimeout(triggerCrackle, 80 + Math.random() * 350)
    }

    this.fireTimer = setTimeout(triggerCrackle, 200)
  }

  // 3. Procedural Wind / Breeze (modulated bandpass sweep)
  private setupWind() {
    if (!this.ctx || !this.windGain) return
    const bufferSize = this.ctx.sampleRate * 2
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(400, this.ctx.currentTime)
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime)
    this.windFilter = filter

    // LFO to slowly shift wind frequency for organic gusting
    const lfo = this.ctx.createOscillator()
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime)
    const lfoGain = this.ctx.createGain()
    lfoGain.gain.setValueAtTime(200, this.ctx.currentTime)
    lfo.connect(lfoGain)
    lfoGain.connect(filter.frequency)
    lfo.start(0)
    this.windLfo = lfo

    const source = this.ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    source.connect(filter)
    filter.connect(this.windGain)
    source.start(0)
    this.windSource = source
  }

  // 4. Procedural Deep Brown Noise (1/f^2)
  private setupBrownNoise() {
    if (!this.ctx || !this.brownGain) return
    const bufferSize = this.ctx.sampleRate * 2
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let lastOut = 0.0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      data[i] = (lastOut + 0.02 * white) / 1.02
      lastOut = data[i]
      data[i] *= 2.5
    }

    const source = this.ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    source.connect(this.brownGain)
    source.start(0)
    this.brownSource = source
  }

  // Volume Controls (0 to 1)
  public setRain(volume: number) {
    this.initContext()
    if (this.rainGain && this.ctx) {
      this.rainGain.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime, 0.05)
    }
  }

  public setFire(volume: number) {
    this.initContext()
    if (this.fireGain && this.ctx) {
      this.fireGain.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime, 0.05)
    }
  }

  public setWind(volume: number) {
    this.initContext()
    if (this.windGain && this.ctx) {
      this.windGain.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime, 0.05)
    }
  }

  public setBrownNoise(volume: number) {
    this.initContext()
    if (this.brownGain && this.ctx) {
      this.brownGain.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime, 0.05)
    }
  }

  public stopAll() {
    if (!this.ctx) return
    this.setRain(0)
    this.setFire(0)
    this.setWind(0)
    this.setBrownNoise(0)
  }
}

// Global Singleton
export const soundscapeEngine = typeof window !== 'undefined' ? new SoundscapeEngine() : ({} as SoundscapeEngine)
