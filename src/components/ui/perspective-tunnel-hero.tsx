import { createPortal } from 'react-dom'
import { motion } from 'motion/react'
import type { Project } from '../../data/projects'
import { withBase } from '../../lib/paths'

// Adapted from Daiwiik Harihar's Perspective Tunnel Hero (MIT, 21st.dev).
export const PROJECT_TUNNEL_DURATION_MS = 2000

export default function PerspectiveTunnelTransition({ projects }: { projects: Project[] }) {
  const width = window.innerWidth
  const height = window.innerHeight
  const isMobile = width < 768
  const cardWidth = isMobile ? Math.min(160, width * 0.38) : Math.min(260, width * 0.19)
  const cardHeight = cardWidth * 0.75

  return createPortal(
    <div className="project-tunnel" role="status" aria-live="polite" aria-label="Opening all projects">
      <div className="project-tunnel__stage" style={{ perspective: isMobile ? 850 : 1200 }}>
        <motion.div
          className="project-tunnel__ring project-tunnel__ring--inner"
          initial={{ scale: 0.65, opacity: 0 }}
          animate={{ scale: 1.9, opacity: [0, 0.6, 0] }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
          aria-hidden="true"
        />
        <motion.div
          className="project-tunnel__ring project-tunnel__ring--outer"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 2.1, opacity: [0, 0.4, 0] }}
          transition={{ duration: 1.8, delay: 0.12, ease: 'easeOut' }}
          aria-hidden="true"
        />

        <div className="project-tunnel__plane" aria-hidden="true">
          {projects.map((project, index) => {
            const angle = index * 137.5 * (Math.PI / 180)
            const baseX = Math.cos(angle) * width * (0.24 + (index % 3) * 0.065)
            const baseY = Math.sin(angle) * height * (0.22 + (index % 2) * 0.095)
            const rotation = (index % 2 === 0 ? 1 : -1) * (3 + (index % 5) * 2)

            return (
              <motion.div
                key={project.index}
                className="project-tunnel__card"
                style={{
                  width: cardWidth,
                  height: cardHeight,
                  marginLeft: -cardWidth / 2,
                  marginTop: -cardHeight / 2,
                  zIndex: index + 1,
                }}
                initial={{ x: baseX * 0.75, y: baseY * 0.75, z: -1300, rotateZ: rotation, opacity: 0 }}
                animate={{
                  x: [baseX * 0.75, baseX, baseX * 1.12, baseX * 1.5],
                  y: [baseY * 0.75, baseY, baseY * 1.12, baseY * 1.5],
                  z: [-1300, -500, 280, 950],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{ duration: 1.5, delay: index * 0.035, times: [0, 0.22, 0.72, 1], ease: 'easeInOut' }}
              >
                <img src={withBase(project.image)} alt="" draggable={false} />
                <span className="project-tunnel__card-label">
                  <small>{project.index} / {project.label}</small>
                  <strong>{project.title}</strong>
                </span>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          className="project-tunnel__title"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: [0.85, 1, 1.05, 1.25], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.75, times: [0, 0.18, 0.72, 1], ease: 'easeInOut' }}
        >
          <p>PROJECTS / {String(projects.length).padStart(2, '0')}</p>
          <h2>ENTERING<br />THE ARCHIVE<span>.</span></h2>
          <span>Taking you through the work</span>
        </motion.div>
      </div>
    </div>,
    document.body,
  )
}
