# Biomechanical Core v1.0 — Frozen Core

Release date: (to be filled at validation time)

Summary
-------
This release freezes the Biomechanical Core v1.0: the stable set of modules implementing
geometry, reference systems and biomechanical computations. The frozen core includes:

- Geometry (vector math, angles, reference system construction)
- ReferenceSystem (project coordinate/frame conventions)
- Biomechanics (virtual landmarks, biomechanical measurements and measurement catalog)
- AnalysisPipeline (Kinovea JSON ingestion -> PoseFrame -> BiomechanicalFrame -> AnalysisResult)
- AnalysisResult (stable container with pose_frames, biomechanical_frames and metadata)

Purpose of the freeze
---------------------
- Provide a reproducible, auditable baseline for downstream analysis and metrics.
- Prevent accidental modification of core algorithms affecting biomechanical calculations.
- Force new features to be implemented in higher layers (analyzers, exporters, metrics) rather than the core.

Validation criteria (must be satisfied before merging)
-----------------------------------------------------
1. The entire test suite (pytest) passes without failures.
2. No public API of the frozen core modules is modified (Geometry, ReferenceSystem, Biomechanics, AnalysisPipeline, AnalysisResult).
3. No geometric algorithms are modified.
4. No biomechanical calculation logic is modified.
5. No OCRA metrics or ergonomic logic are added into the core modules.
6. Strict separation between Geometry, Biomechanics and Analysis packages must be maintained.

Tagging and post-merge policy
-----------------------------
- After validating the PR and passing tests, create the tag: `Biomechanical Core v1.0 (Frozen Core)`.
- New functionality must be added only in layers above the frozen core; any core fixes must go through an explicit approval and testing process ensuring backwards compatibility.
