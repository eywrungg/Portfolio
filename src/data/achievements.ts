import { withBase } from '../lib/paths'

export type Achievement = {
  id: string
  eyebrow: string
  title: string
  summary: string
  meta: string
  accent: string
  image: string
  certificateImage?: string
  certificateUrl?: string
  imageWidth?: number
  imageHeight?: number
}

export const achievements: Achievement[] = [
  {
    id: 'ai-literacy-responsible-use',
    eyebrow: 'Certificate of completion',
    title: 'AI Literacy and Responsible Use',
    summary: 'Completed the Introduction to AI Literacy and Responsible Use micro-credentials course.',
    meta: 'ACHIEVE micro-credentials - September 15, 2026',
    accent: '#173b88',
    image: '/certificates/ai-literacy-responsible-use.png',
    certificateImage: '/certificates/ai-literacy-responsible-use.png',
    certificateUrl: '/certificates/ClassOf2026__issued (1).pdf',
    imageWidth: 1500,
    imageHeight: 1062,
  },
  {
    id: 'ai-evaluations-education',
    eyebrow: 'Certificate of participation',
    title: 'AI Evaluations in Education',
    summary: 'Participated in the Dialogues for Design AI in Learning webinar on safety, effectiveness, and impact in education.',
    meta: 'ASU University Design Institute - October 28, 2026',
    accent: '#ffc627',
    image: '/certificates/ai-evaluations-education.png',
    certificateImage: '/certificates/ai-evaluations-education.png',
    certificateUrl: '/certificates/Charles Arone_Participation.pdf',
    imageWidth: 1500,
    imageHeight: 844,
  },
  {
    id: 'data-privacy-awareness',
    eyebrow: 'Certificate of attendance',
    title: 'Data Privacy Awareness',
    summary: 'Attended the four-hour Data Privacy Awareness webinar hosted by the Department of Information and Communications Technology, Region XI.',
    meta: 'DICT Region XI - October 7, 2026',
    accent: '#205780',
    image: '/certificates/data-privacy-awareness.png',
    certificateImage: '/certificates/data-privacy-awareness.png',
    certificateUrl: '/certificates/CHARLES ARONE R. ALCEBAR_signed.pdf',
    imageWidth: 1500,
    imageHeight: 1061,
  },
  {
    id: 'agma-service-appreciation',
    eyebrow: 'Certificate of appreciation',
    title: 'AGMA Registration Service',
    summary: 'Recognized for support, active participation, and service as an AGMA Registration Operator during DASURECO’s 47th Annual General Membership Assembly.',
    meta: 'Davao del Sur Electric Cooperative, Inc. - July 26, 2026',
    accent: '#9f1620',
    image: '/certificates/Certificate of Appreciation for AGMA Service.png',
    certificateImage: '/certificates/Certificate of Appreciation for AGMA Service.png',
    imageWidth: 1055,
    imageHeight: 1491,
  },
  {
    id: 'google-ai',
    eyebrow: 'Milestone',
    title: 'Google AI Program',
    summary:
      "Completed Google's AI learning track and strengthened my foundation in practical AI tools, workflows, and product thinking.",
    meta: '2026 - Intensive AI learning path',
    accent: '#fb923c',
    image: '/Projects/canvaportfolio.png',
  },
  {
    id: 'harmonics-club',
    eyebrow: 'Community',
    title: 'Harmonics Club Member',
    summary:
      "Singing with the Harmonics Club in church and during school Masses, campus gatherings, and community moments.",
    meta: "St. Mary's College",
    accent: '#38bdf8',
    image: '/PHOTO.jpeg',
  },
  {
    id: 'deans-lister',
    eyebrow: 'Academic',
    title: "Dean's Lister / Honors",
    summary:
      "Currently maintaining Dean's Lister standing and academic honors while continuing project, research, and creative work.",
    meta: 'Academic consistency',
    accent: '#a855f7',
    image: '/Projects/Pyrowatch_apk_auto.jpg',
  },
  {
    id: 'capstone',
    eyebrow: 'Leadership',
    title: 'Capstone Lead',
    summary:
      'Led project work that blended interface design, technical implementation, and research-backed execution.',
    meta: 'Research + product delivery',
    accent: '#22c55e',
    image: '/Projects/Pyrowatch_apk_manual.jpg',
  },
].map((achievement) => ({
  ...achievement,
  image: withBase(achievement.image),
}))
