# Biomechanical Core v1.0 (Frozen Core)

**Version:** 1.0  
**Status:** Frozen  
**Project:** OCRA Video Analyzer  
**Repository:** clopez-spmas/ocra-video-analyzer

---

# Overview

This release establishes the first stable version of the Biomechanical Core used by the OCRA Video Analyzer project.

The objective of this release is to freeze the biomechanical computation layer before starting the implementation of the OCRA analysis engine.

From this version onward, all new functionality should be implemented outside the Biomechanical Core unless an explicit maintenance release is approved.

---

# Scope

The frozen core includes every component responsible for biomechanical processing, including:

- Pose representation
- Landmark data model
- Joint angle computation
- Anatomical reference system
- Biomechanical measurements
- Frame analysis
- Processing pipeline
- Output data structures

The frozen core explicitly excludes:

- OCRA calculations
- Ergonomic metrics
- Risk assessment
- Automatic action counting
- Reporting
- Visualization
- User interface

---

# Included Components

## Geometry

- Anatomical reference system
- Coordinate transformations
- Local anatomical axes
- Mathematical geometry utilities

---

## Kinematics

- JointAngleCalculator
- Shoulder angle calculation
- Elbow angle calculation
- Wrist angle calculation

---

## Biomechanics

- Landmark model
- PoseFrame
- BiomechanicalMeasurement
- BiomechanicalFrame
- BiomechanicalAnalyzer

---

## Pipeline

- Video processing pipeline
- Pose estimation integration
- FrameResult generation
- JSON export
- CSV export

---

# Validation

The Biomechanical Core has been validated using automated regression tests covering:

- Joint angle computation
- Mathematical consistency
- Reference system integrity
- Pipeline integrity
- Frame traceability
- Export consistency
- Data model contracts

The validation suite completes successfully.

Current validation status:

- Automated tests: **32 passed**
- Failed tests: **0**
- Core modifications after validation: **None**

---

# Design Principles

The Biomechanical Core follows the following principles:

- Deterministic calculations
- Reproducible results
- Complete traceability
- Separation of concerns
- No ergonomic logic
- No OCRA calculations
- Stable public API

---

# Freeze Policy

From this release onward the following components are considered frozen:

- Geometry
- ReferenceSystem
- JointAngleCalculator
- Landmark
- PoseFrame
- BiomechanicalMeasurement
- BiomechanicalFrame
- BiomechanicalAnalyzer
- Pipeline public interfaces
- FrameResult

Changes to these components must only occur when:

- a bug affecting biomechanical correctness is demonstrated;
- regression tests are added;
- backward compatibility is preserved whenever possible;
- the modification is explicitly approved.

---

# Future Development

Future work will be implemented outside the frozen core.

Planned development includes:

- OCRA Engine
- Technical action detection
- Automatic repetition counting
- Recovery time analysis
- Force classification
- OCRA Index computation
- Risk classification
- Report generation
- Visualization tools

These components must depend on the Biomechanical Core without modifying it.

---

# Compatibility

This release becomes the reference implementation for future versions of the project.

All future developments should remain compatible with this version unless a new major version of the Biomechanical Core is intentionally released.

---

# Version Information

Release:

**Biomechanical Core v1.0 (Frozen Core)**

Recommended Git Tag:

```
Biomechanical-Core-v1.0
```

Recommended development branch after this release:

```
feature/ocra-engine
```

---

# Approval

This release freezes the biomechanical computation layer and establishes the stable baseline upon which the complete OCRA automatic analysis engine will be developed.

Any future modification of the Biomechanical Core should be treated as a controlled change and accompanied by appropriate regression tests.

---

**End of document**
