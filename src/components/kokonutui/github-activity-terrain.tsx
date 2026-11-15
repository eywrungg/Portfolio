import { useEffect, useState } from 'react'
import ActivityTerrain from './activity-terrain'

const ACTIVITY_URL = 'https://github-contributions-api.jogruber.de/v4/eywrungg?y=last'

type ContributionDay = { date: string; count: number }
type ActivityResponse = { contributions?: ContributionDay[] }

export default function GithubActivityTerrain() {
  const [days, setDays] = useState<ContributionDay[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    fetch(ACTIVITY_URL, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('GitHub activity is unavailable')
        return response.json() as Promise<ActivityResponse>
      })
      .then((result) => {
        if (!result.contributions?.length) throw new Error('No public activity found')
        setDays(result.contributions)
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return
        setFailed(true)
      })

    return () => controller.abort()
  }, [])

  if (days) {
    return (
      <ActivityTerrain
        title="GitHub activity · last year"
        data={days.map((day) => day.count)}
        endDate={days[days.length - 1].date}
      />
    )
  }

  if (failed) {
    return (
      <p className="rounded-2xl border p-5 text-sm" style={{ borderColor: 'var(--border)', color: 'var(--ink-3)' }}>
        GitHub activity couldn’t load right now.{' '}
        <a href="https://github.com/eywrungg" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--ink)' }}>
          View my profile
        </a>
      </p>
    )
  }

  return (
    <div className="h-72 animate-pulse rounded-3xl border" aria-label="Loading GitHub activity" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }} />
  )
}
