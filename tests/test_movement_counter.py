"""Tests for MovementCounter behaviour."""
import math
import pytest
from ocra.analysis.movement_counter import MovementCounter


def make_pulse(start, duration, value=1.0, step=0.01):
    # generate samples from start to start+duration with given step
    ts = start
    samples = []
    while ts <= start + duration:
        samples.append((round(ts, 6), value))
        ts += step
    return samples


def make_baseline(start, duration, value=0.0, step=0.01):
    ts = start
    samples = []
    while ts <= start + duration:
        samples.append((round(ts, 6), value))
        ts += step
    return samples


def test_single_repetition():
    c = MovementCounter(threshold=0.5, hysteresis=0.1, min_duration=0.05)
    samples = []
    samples += make_baseline(0.0, 0.05)
    samples += make_pulse(0.06, 0.12, value=1.0)
    samples += make_baseline(0.19, 0.05)
    c.add_samples(samples)
    c.complete()
    assert c.count == 1
    ev = c.events[0]
    assert ev.amplitude >= 1.0


def test_multiple_repetitions():
    c = MovementCounter(threshold=0.5, hysteresis=0.1, min_duration=0.02)
    samples = []
    t = 0.0
    for _ in range(3):
        samples += make_baseline(t, 0.02)
        t += 0.02
        samples += make_pulse(t, 0.06, value=1.0)
        t += 0.06
    samples += make_baseline(t, 0.02)
    c.add_samples(samples)
    c.complete()
    assert c.count == 3


def test_incomplete_movements_are_not_counted():
    c = MovementCounter(threshold=0.5, hysteresis=0.1, min_duration=0.05)
    samples = []
    samples += make_baseline(0.0, 0.05)
    # start a pulse but never drop below low threshold
    samples += make_pulse(0.06, 0.2, value=1.0)
    c.add_samples(samples)
    # no falling edge provided
    c.complete()
    assert c.count == 0


def test_noise_spikes_do_not_count():
    c = MovementCounter(threshold=0.5, hysteresis=0.1, min_duration=0.05)
    samples = []
    # lots of baseline
    samples += make_baseline(0.0, 0.1)
    # a few noisy spikes that do not sustain above threshold
    samples.append((0.11, 0.6))
    samples.append((0.12, 0.4))
    samples.append((0.13, 0.55))
    samples.append((0.135, 0.2))
    samples += make_baseline(0.14, 0.05)
    c.add_samples(samples)
    c.complete()
    # none of the brief spikes reach min_duration
    assert c.count == 0


def test_hysteresis_prevents_multiple_counts_for_small_oscillations():
    c = MovementCounter(threshold=0.5, hysteresis=0.2, min_duration=0.01)
    # oscillate around threshold but stay within hysteresis window
    samples = [
        (0.0, 0.4),
        (0.01, 0.6),
        (0.02, 0.45),
        (0.03, 0.55),
        (0.04, 0.35),
        (0.05, 0.2),
    ]
    c.add_samples(samples)
    c.complete()
    assert c.count == 1
