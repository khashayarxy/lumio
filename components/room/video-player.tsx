'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
} from 'lucide-react'
import type { Movie } from '@/lib/lumio-data'

const SAMPLE_SRC =
  'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function VideoPlayer({
  movie,
  onPlaybackChange,
}: {
  movie: Movie
  onPlaybackChange?: (playing: boolean) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [muted, setMuted] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [ready, setReady] = useState(false)

  const showControls = useCallback(() => {
    setControlsVisible(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setControlsVisible(false)
    }, 2800)
  }, [])

  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      void v.play()
    } else {
      v.pause()
    }
  }, [])

  const seekBy = useCallback((delta: number) => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = Math.min(Math.max(0, v.currentTime + delta), v.duration || 0)
    showControls()
  }, [showControls])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onPlay = () => {
      setPlaying(true)
      onPlaybackChange?.(true)
      showControls()
    }
    const onPause = () => {
      setPlaying(false)
      onPlaybackChange?.(false)
      setControlsVisible(true)
    }
    const onTime = () => setCurrent(v.currentTime)
    const onMeta = () => {
      setDuration(v.duration)
      setReady(true)
    }
    v.addEventListener('play', onPlay)
    v.addEventListener('pause', onPause)
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('loadedmetadata', onMeta)
    return () => {
      v.removeEventListener('play', onPlay)
      v.removeEventListener('pause', onPause)
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('loadedmetadata', onMeta)
    }
  }, [onPlaybackChange, showControls])

  useEffect(() => {
    const v = videoRef.current
    if (v) v.volume = volume
  }, [volume])

  useEffect(() => {
    const v = videoRef.current
    if (v) v.muted = muted
  }, [muted])

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      void containerRef.current?.requestFullscreen()
    } else {
      void document.exitFullscreen()
    }
  }, [])

  function onScrub(e: React.ChangeEvent<HTMLInputElement>) {
    const v = videoRef.current
    if (!v) return
    const time = (Number(e.target.value) / 100) * (v.duration || 0)
    v.currentTime = time
    setCurrent(time)
  }

  const progress = duration ? (current / duration) * 100 : 0

  return (
    <div
      ref={containerRef}
      onMouseMove={showControls}
      onMouseLeave={() => playing && setControlsVisible(false)}
      className="group relative aspect-video w-full overflow-hidden rounded-3xl bg-black"
    >
      <video
        ref={videoRef}
        src={SAMPLE_SRC}
        poster={movie.poster}
        playsInline
        className="size-full object-contain"
        onClick={togglePlay}
      />

      {/* gradient scrims */}
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 transition-opacity duration-300 ${
          controlsVisible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* top: sync status */}
      <div
        className={`absolute inset-x-0 top-0 flex items-center justify-between p-4 transition-all duration-300 ${
          controlsVisible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
        }`}
      >
        <span className="flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur-md">
          <span className="relative flex size-2">
            <span className="animate-pulse-ring absolute inline-flex size-full rounded-full bg-success" />
            <span className="relative inline-flex size-2 rounded-full bg-success" />
          </span>
          In sync with room
        </span>
        <span className="rounded-full bg-black/40 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-md">
          {movie.title}
        </span>
      </div>

      {/* center controls */}
      <div
        className={`absolute inset-0 flex items-center justify-center gap-8 transition-opacity duration-300 ${
          controlsVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button
          type="button"
          onClick={() => seekBy(-10)}
          aria-label="Rewind 10 seconds"
          className="grid size-12 place-items-center rounded-full bg-black/40 text-foreground backdrop-blur-md transition-transform hover:scale-105 active:scale-95"
        >
          <RotateCcw className="size-5" />
        </button>
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? 'Pause' : 'Play'}
          className="grid size-20 place-items-center rounded-full bg-primary/90 text-primary-foreground shadow-[0_16px_50px_-12px_rgba(124,92,255,0.9)] backdrop-blur-sm transition-transform hover:scale-105 active:scale-95"
        >
          {playing ? (
            <Pause className="size-9 fill-current" />
          ) : (
            <Play className="size-9 translate-x-0.5 fill-current" />
          )}
        </button>
        <button
          type="button"
          onClick={() => seekBy(10)}
          aria-label="Forward 10 seconds"
          className="grid size-12 place-items-center rounded-full bg-black/40 text-foreground backdrop-blur-md transition-transform hover:scale-105 active:scale-95"
        >
          <RotateCw className="size-5" />
        </button>
      </div>

      {/* bottom bar */}
      <div
        className={`absolute inset-x-0 bottom-0 p-4 transition-all duration-300 ${
          controlsVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
      >
        <div className="rounded-2xl bg-black/40 p-3 backdrop-blur-md">
          {/* scrubber */}
          <div className="relative flex items-center">
            <div className="absolute inset-x-0 h-1.5 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${progress}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={progress}
              onChange={onScrub}
              aria-label="Seek"
              className="relative z-10 h-1.5 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-foreground [&::-webkit-slider-thumb]:shadow"
            />
          </div>

          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? 'Pause' : 'Play'}
              className="grid size-9 place-items-center rounded-full text-foreground transition-colors hover:bg-white/10"
            >
              {playing ? (
                <Pause className="size-5 fill-current" />
              ) : (
                <Play className="size-5 translate-x-px fill-current" />
              )}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMuted((m) => !m)}
                aria-label={muted ? 'Unmute' : 'Mute'}
                className="grid size-9 place-items-center rounded-full text-foreground transition-colors hover:bg-white/10"
              >
                {muted || volume === 0 ? (
                  <VolumeX className="size-5" />
                ) : (
                  <Volume2 className="size-5" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={muted ? 0 : volume}
                onChange={(e) => {
                  setVolume(Number(e.target.value))
                  setMuted(false)
                }}
                aria-label="Volume"
                className="hidden h-1 w-20 cursor-pointer appearance-none rounded-full bg-white/20 sm:block [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-foreground"
              />
            </div>

            <span className="ml-1 text-sm tabular-nums text-muted-foreground">
              {formatTime(current)}{' '}
              <span className="text-muted-foreground/50">/ {formatTime(duration)}</span>
            </span>

            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              className="ml-auto grid size-9 place-items-center rounded-full text-foreground transition-colors hover:bg-white/10"
            >
              {fullscreen ? (
                <Minimize className="size-5" />
              ) : (
                <Maximize className="size-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {!ready && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <span className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-primary" />
        </div>
      )}
    </div>
  )
}
