# Koi movement references

The Skills pond is an interactive animation, not a biological simulation or a trained model. Its behavioral states combine Dijkstra routing with bounded steering and per-fish, seeded decisions.

- Yang et al., *A study on flow physics of burst-and-coast swimming of koi carp* (2010): https://www.jstage.jst.go.jp/article/jabmech/1/1/1_1_30/_article
  - Observed multiple-tail-beat and half-tail-beat bursts informed alternating propulsion and coasting. Animation timing is tuned for the page; it is not measured koi data.
- Wu et al., *Routine turning maneuvers of koi carp* (2007): https://pubmed.ncbi.nlm.nih.gov/18055627/
  - Body/tail-driven turns informed bending the skeleton into a turn, easing forward speed, and recoiling into acceleration.
- Reynolds, *Steering Behaviors for Autonomous Characters* (1999): https://www.red3d.com/cwr/steer/gdc99/
  - Stateful wander, arrival, separation, obstacle avoidance, and flee behavior.

The fish first inspect an icon, briefly grip it, then tug it along with their mouths. Icons remain in their accessible DOM slots and spring back on release. Every Stack & Code group participates. Pointer taps near fish interrupt any activity and trigger an escape toward open water. Tail frequency and wake strength follow effort and speed, with separate timing for each fish. The surface wakes are stylized canvas effects, not CFD.

The animation clock, skeletons, water buffers, and icon springs pause offscreen instead of remounting. Reduced motion disables the decorative pond. Water shares the existing animation loop and renders at most 30 times per second; no extra packages are required.
