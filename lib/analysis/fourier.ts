/**
 * Fourier Transform Analysis
 * FFT and frequency domain analysis for electrochemistry data
 */

export interface FFTResult {
  frequencies: number[]
  magnitudes: number[]
  phases: number[]
  powerSpectrum: number[]
  dominantFrequency: number
  dominantMagnitude: number
}

export interface WindowFunction {
  name: 'rectangular' | 'hamming' | 'hanning' | 'blackman'
  apply: (data: number[]) => number[]
}

/**
 * Window functions for FFT
 */
export const WindowFunctions: Record<WindowFunction['name'], (data: number[]) => number[]> = {
  rectangular: (data: number[]) => data,

  hamming: (data: number[]) => {
    const N = data.length
    return data.map((val, n) => val * (0.54 - 0.46 * Math.cos((2 * Math.PI * n) / (N - 1))))
  },

  hanning: (data: number[]) => {
    const N = data.length
    return data.map((val, n) => val * 0.5 * (1 - Math.cos((2 * Math.PI * n) / (N - 1))))
  },

  blackman: (data: number[]) => {
    const N = data.length
    const a0 = 0.42
    const a1 = 0.5
    const a2 = 0.08
    return data.map(
      (val, n) =>
        val *
        (a0 - a1 * Math.cos((2 * Math.PI * n) / (N - 1)) + a2 * Math.cos((4 * Math.PI * n) / (N - 1)))
    )
  },
}

/**
 * Perform Fast Fourier Transform
 * Simplified implementation - would use FFTW or similar in production
 */
export function performFFT(
  timeData: number[],
  samplingRate: number,
  windowFunction: WindowFunction['name'] = 'hanning'
): FFTResult {
  // Apply window function
  const windowedData = WindowFunctions[windowFunction](timeData)

  const N = windowedData.length
  const frequencies: number[] = []
  const magnitudes: number[] = []
  const phases: number[] = []
  const powerSpectrum: number[] = []

  // Calculate only positive frequencies (up to Nyquist)
  const nyquist = Math.floor(N / 2)

  for (let k = 0; k < nyquist; k++) {
    const freq = (k * samplingRate) / N
    frequencies.push(freq)

    // Calculate DFT for frequency k
    let real = 0
    let imag = 0

    for (let n = 0; n < N; n++) {
      const angle = (-2 * Math.PI * k * n) / N
      real += windowedData[n] * Math.cos(angle)
      imag += windowedData[n] * Math.sin(angle)
    }

    const magnitude = Math.sqrt(real * real + imag * imag) / N
    const phase = Math.atan2(imag, real)
    const power = magnitude * magnitude

    magnitudes.push(magnitude)
    phases.push(phase)
    powerSpectrum.push(power)
  }

  // Find dominant frequency
  const maxMagnitudeIndex = magnitudes.indexOf(Math.max(...magnitudes))
  const dominantFrequency = frequencies[maxMagnitudeIndex]
  const dominantMagnitude = magnitudes[maxMagnitudeIndex]

  return {
    frequencies,
    magnitudes,
    phases,
    powerSpectrum,
    dominantFrequency,
    dominantMagnitude,
  }
}

/**
 * Perform Inverse FFT (simplified)
 */
export function performIFFT(frequencies: number[], magnitudes: number[], phases: number[]): number[] {
  const N = frequencies.length * 2
  const timeData: number[] = []

  for (let n = 0; n < N; n++) {
    let value = 0

    for (let k = 0; k < frequencies.length; k++) {
      const angle = (2 * Math.PI * k * n) / N + phases[k]
      value += magnitudes[k] * Math.cos(angle)
    }

    timeData.push(value)
  }

  return timeData
}

/**
 * Calculate power spectral density
 */
export function calculatePSD(
  timeData: number[],
  samplingRate: number,
  windowSize: number = 256,
  overlap: number = 0.5
): { frequencies: number[]; psd: number[] } {
  const step = Math.floor(windowSize * (1 - overlap))
  const segments: number[][] = []

  // Split into overlapping segments
  for (let i = 0; i + windowSize <= timeData.length; i += step) {
    segments.push(timeData.slice(i, i + windowSize))
  }

  if (segments.length === 0) {
    // Not enough data for windowing
    const fft = performFFT(timeData, samplingRate)
    return { frequencies: fft.frequencies, psd: fft.powerSpectrum }
  }

  // Calculate FFT for each segment and average
  const fftResults = segments.map((segment) => performFFT(segment, samplingRate))

  const frequencies = fftResults[0].frequencies
  const avgPSD = frequencies.map((_, i) => {
    const sum = fftResults.reduce((acc, fft) => acc + fft.powerSpectrum[i], 0)
    return sum / fftResults.length
  })

  return { frequencies, psd: avgPSD }
}

/**
 * Find peaks in frequency spectrum
 */
export function findFrequencyPeaks(
  frequencies: number[],
  magnitudes: number[],
  minProminence: number = 0.1
): Array<{ frequency: number; magnitude: number; index: number }> {
  const peaks: Array<{ frequency: number; magnitude: number; index: number }> = []

  for (let i = 1; i < magnitudes.length - 1; i++) {
    if (magnitudes[i] > magnitudes[i - 1] && magnitudes[i] > magnitudes[i + 1]) {
      const prominence = Math.min(magnitudes[i] - magnitudes[i - 1], magnitudes[i] - magnitudes[i + 1])

      if (prominence >= minProminence) {
        peaks.push({
          frequency: frequencies[i],
          magnitude: magnitudes[i],
          index: i,
        })
      }
    }
  }

  // Sort by magnitude (descending)
  return peaks.sort((a, b) => b.magnitude - a.magnitude)
}

/**
 * Apply frequency filter
 */
export function applyFrequencyFilter(
  timeData: number[],
  samplingRate: number,
  filterType: 'lowpass' | 'highpass' | 'bandpass' | 'bandstop',
  cutoffLow: number,
  cutoffHigh?: number
): number[] {
  // Perform FFT
  const fft = performFFT(timeData, samplingRate, 'hanning')

  // Apply filter in frequency domain
  const filteredMagnitudes = fft.magnitudes.map((mag, i) => {
    const freq = fft.frequencies[i]

    switch (filterType) {
      case 'lowpass':
        return freq <= cutoffLow ? mag : 0

      case 'highpass':
        return freq >= cutoffLow ? mag : 0

      case 'bandpass':
        return freq >= cutoffLow && freq <= (cutoffHigh || Infinity) ? mag : 0

      case 'bandstop':
        return freq < cutoffLow || freq > (cutoffHigh || Infinity) ? mag : 0

      default:
        return mag
    }
  })

  // Perform inverse FFT
  return performIFFT(fft.frequencies, filteredMagnitudes, fft.phases)
}

/**
 * Calculate signal-to-noise ratio
 */
export function calculateSNR(
  timeData: number[],
  samplingRate: number,
  signalBandLow: number,
  signalBandHigh: number
): number {
  const fft = performFFT(timeData, samplingRate)

  let signalPower = 0
  let noisePower = 0

  fft.frequencies.forEach((freq, i) => {
    const power = fft.powerSpectrum[i]

    if (freq >= signalBandLow && freq <= signalBandHigh) {
      signalPower += power
    } else {
      noisePower += power
    }
  })

  return signalPower / (noisePower || 1e-10)
}

/**
 * Detect periodic components
 */
export function detectPeriodicComponents(
  timeData: number[],
  samplingRate: number,
  minFrequency: number = 0,
  maxFrequency?: number
): Array<{ frequency: number; period: number; magnitude: number; snr: number }> {
  const fft = performFFT(timeData, samplingRate)
  const peaks = findFrequencyPeaks(fft.frequencies, fft.magnitudes, 0.05)

  const maxFreq = maxFrequency || samplingRate / 2

  return peaks
    .filter((peak) => peak.frequency >= minFrequency && peak.frequency <= maxFreq)
    .map((peak) => {
      // Calculate SNR for this component
      const bandwidth = samplingRate / timeData.length
      const snr = calculateSNR(timeData, samplingRate, peak.frequency - bandwidth, peak.frequency + bandwidth)

      return {
        frequency: peak.frequency,
        period: 1 / peak.frequency,
        magnitude: peak.magnitude,
        snr,
      }
    })
    .slice(0, 10) // Return top 10 components
}
