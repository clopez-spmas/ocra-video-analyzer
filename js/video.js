/**
 * ==========================================================
 * OCRA Video Analyzer v5
 * Archivo: video.js
 * Controlador de vídeo
 * ==========================================================
 */

'use strict';

import { VIDEO_CONFIG } from "./config.js";
import { clamp } from "./utils.js";

export class VideoController {

    constructor(videoElement) {

        this.video = videoElement;

        this.fps = 25;

        this.frameDuration = 1 / this.fps;

        this.loaded = false;

        this.callbacks = {};

        this.init();

    }

    /* ====================================================== */

    init() {

        this.video.addEventListener("loadedmetadata", () => {

            this.loaded = true;

            this.emit("loaded");

        });

        this.video.addEventListener("timeupdate", () => {

            this.emit("timeupdate");

        });

        this.video.addEventListener("play", () => {

            this.emit("play");

        });

        this.video.addEventListener("pause", () => {

            this.emit("pause");

        });

        this.video.addEventListener("ended", () => {

            this.emit("ended");

        });

    }

    /* ====================================================== */

    load(file) {

        const url = URL.createObjectURL(file);

        this.video.src = url;

        this.video.load();

    }

    /* ====================================================== */

    play() {

        this.video.play();

    }

    pause() {

        this.video.pause();

    }

    toggle() {

        if (this.video.paused)
            this.play();
        else
            this.pause();

    }

    /* ====================================================== */

    setFPS(fps) {

        this.fps = fps;

        this.frameDuration = 1 / fps;

    }

    /* ====================================================== */

    nextFrame() {

        this.seekFrames(1);

    }

    previousFrame() {

        this.seekFrames(-1);

    }

    forward5() {

        this.seekFrames(5);

    }

    backward5() {

        this.seekFrames(-5);

    }

    forward10() {

        this.seekFrames(10);

    }

    backward10() {

        this.seekFrames(-10);

    }

    /* ====================================================== */

    seekFrames(frames) {

        this.pause();

        this.video.currentTime += frames * this.frameDuration;

        this.video.currentTime = clamp(

            this.video.currentTime,

            0,

            this.video.duration

        );

    }

    /* ====================================================== */

    seek(seconds) {

        this.video.currentTime = clamp(

            seconds,

            0,

            this.video.duration

        );

    }

    /* ====================================================== */

    setPlaybackRate(rate) {

        rate = clamp(

            rate,

            VIDEO_CONFIG.MIN_SPEED,

            VIDEO_CONFIG.MAX_SPEED

        );

        this.video.playbackRate = rate;

    }

    /* ====================================================== */

    increaseSpeed() {

        this.setPlaybackRate(

            this.video.playbackRate +

            VIDEO_CONFIG.SPEED_STEP

        );

    }

    decreaseSpeed() {

        this.setPlaybackRate(

            this.video.playbackRate -

            VIDEO_CONFIG.SPEED_STEP

        );

    }

    /* ====================================================== */

    get currentFrame() {

        return Math.round(

            this.video.currentTime * this.fps

        );

    }

    get currentTime() {

        return this.video.currentTime;

    }

    get duration() {

        return this.video.duration;

    }

    get paused() {

        return this.video.paused;

    }

    /* ====================================================== */

    fullscreen() {

        if (this.video.requestFullscreen)

            this.video.requestFullscreen();

    }

    /* ====================================================== */

    on(event, callback) {

        this.callbacks[event] = callback;

    }

    emit(event) {

        if (this.callbacks[event])

            this.callbacks[event](this);

    }

}
