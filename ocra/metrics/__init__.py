"""Biomechanical metrics extraction package for OCRA helpers.

This module collection provides lightweight functions to compute time-based
and movement-based statistics that an ergonomist can use to later fill the
OCRA checklist. The implementations are intentionally small and input-driven
(we don't impose specific data formats beyond sequences of (timestamp, value)
or lists of MovementEvent objects).
"""
