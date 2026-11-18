// Web Audio API Synthesizer - 100% không phụ thuộc file ngoài, không lo lỗi 404

class SoundManager {
  private ctx: AudioContext | null = null
  private muted: boolean = false

  constructor() {
    // Sẽ init AudioContext khi user tương tác lần đầu
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  public setMuted(muted: boolean) {
    this.muted = muted
  }

  public isMuted() {
    return this.muted
  }

  // Âm thanh tạch tạch của bánh xe khi kim lướt qua nan quạt
  public playTick() {
    if (this.muted) return
    try {
      this.initCtx()
      if (!this.ctx) return

      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(600, this.ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.04)

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.04)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start()
      osc.stop(this.ctx.currentTime + 0.04)
    } catch {
      // Bỏ qua lỗi audio context nếu browser chặn autoplay
    }
  }

  // Âm thanh chúc mừng chiến thắng hoành tráng (Fanfare)
  public playWin() {
    if (this.muted) return
    try {
      this.initCtx()
      if (!this.ctx) return

      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99] // C4, E4, G4, C5, E5, G5
      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator()
        const gain = this.ctx!.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + i * 0.1)

        gain.gain.setValueAtTime(0, this.ctx!.currentTime + i * 0.1)
        gain.gain.linearRampToValueAtTime(0.35, this.ctx!.currentTime + i * 0.1 + 0.05)
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + i * 0.1 + 0.45)

        osc.connect(gain)
        gain.connect(this.ctx!.destination)

        osc.start(this.ctx!.currentTime + i * 0.1)
        osc.stop(this.ctx!.currentTime + i * 0.1 + 0.5)
      })
    } catch {
      //
    }
  }

  // Âm thanh còi xe cảnh sát / meme tuýt còi khi bị chặn quay lần 2
  public playSiren() {
    if (this.muted) return
    try {
      this.initCtx()
      if (!this.ctx) return

      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(700, this.ctx.currentTime)
      osc.frequency.linearRampToValueAtTime(1000, this.ctx.currentTime + 0.2)
      osc.frequency.linearRampToValueAtTime(700, this.ctx.currentTime + 0.4)
      osc.frequency.linearRampToValueAtTime(1000, this.ctx.currentTime + 0.6)

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.8)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start()
      osc.stop(this.ctx.currentTime + 0.8)
    } catch {
      //
    }
  }
}

export const soundManager = new SoundManager()
