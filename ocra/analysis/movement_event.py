from dataclasses import dataclass


@dataclass
class MovementEvent:
    start_time: float
    peak_time: float
    end_time: float
    amplitude: float
