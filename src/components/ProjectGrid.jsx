/**
 * ProjectGrid.jsx — Renders a grid of ProjectCard components
 *
 * Props:
 *   projects — array of project objects
 */

import ProjectCard from './ProjectCard'

export default function ProjectGrid({ projects = [] }) {
  if (projects.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
      {projects.map((project, index) => (
        <ProjectCard key={index} {...project} />
      ))}
    </div>
  )
}
