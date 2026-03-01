import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import LocationSelector from './LocationSelector'
import { getWeather } from '../api_services/api_services'

/* ── helpers ─────────────────────────────────────────────── */

/** Group hourly entries by calendar date (YYYY-MM-DD) */
function groupByDay(hourly) {
    const map = {}
    hourly.forEach(h => {
        const key = new Date(h.Date * 1000).toLocaleDateString('en-CA') // YYYY-MM-DD
        if (!map[key]) map[key] = []
        map[key].push(h)
    })
    return map
}

/** Pick the entry with the highest temperature for the day (peak daily temp) */
function dayRepresentative(entries) {
    return entries.reduce((max, e) => e.temperature > max.temperature ? e : max, entries[0])
}

/** Derive a simple weather icon from the condition string */
function weatherIcon(condition = '') {
    const c = condition.toLowerCase()
    if (c.includes('snow')) return '🌨️'
    if (c.includes('rain') || c.includes('drizzle')) return '🌧️'
    if (c.includes('thunderstorm')) return '⛈️'
    if (c.includes('mist') || c.includes('fog') || c.includes('haze')) return '🌫️'
    if (c.includes('overcast')) return '☁️'
    if (c.includes('cloud')) return '⛅'
    return '☀️'
}

function dayLabel(unixTs, index, t, i18n) {
    if (index === 0) return t('dashboard.weather.today', 'Today')
    if (index === 1) return t('dashboard.weather.tomorrow', 'Tomorrow')
    return new Date(unixTs * 1000).toLocaleDateString(i18n.language === 'te' ? 'te-IN' : 'en-IN', { weekday: 'short' })
}

/* ── component ─────────────────────────────────────────────── */
export default function WeatherCard() {
    const { t, i18n } = useTranslation()
    const [state, setState] = useState('Andhra Pradesh')
    const [district, setDistrict] = useState('')
    const [city, setCity] = useState('')

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [weather, setWeather] = useState(null)  // parsed { current, forecast[], advisory }

    const locationSet = state && district && city

    useEffect(() => {
        if (!locationSet) { setWeather(null); setError(null); return }

        let cancelled = false
        setLoading(true)
        setError(null)

        getWeather(state, district, city).then(data => {
            if (cancelled) return
            if (!data || !Array.isArray(data) || !Array.isArray(data[0])) {
                setError(t('dashboard.weather.error', 'Could not load weather data.'))
                setLoading(false)
                return
            }

            const hourly = data[0]        // array of hourly entries
            const advisory = data[1]        // { message, actions[] }
            const grouped = groupByDay(hourly)
            const days = Object.values(grouped)

            const current = hourly[0]      // most recent entry
            const forecast = days.slice(0, 5).map((entries, i) => {
                const rep = dayRepresentative(entries)
                return {
                    day: dayLabel(rep.Date, i, t, i18n),
                    temp: `${Math.round(rep.temperature)}°C`,
                    icon: weatherIcon(rep.weather),
                    rain: rep.rain > 0 ? `${rep.rain} mm` : '0 mm',
                }
            })

            setWeather({ current, forecast, advisory })
            setLoading(false)
        }).catch(() => {
            if (!cancelled) { setError(t('dashboard.weather.error', 'Failed to fetch weather.')); setLoading(false) }
        })

        return () => { cancelled = true }
    }, [state, district, city])

    /* ── render ── */
    return (
        <div className="bg-card rounded-xl border border-border flex flex-col overflow-hidden">

            {/* Header */}
            <div className="px-5 py-4 border-b border-border flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-base">🌤️</div>
                <div>
                    <div className="font-semibold text-foreground text-sm">{t('dashboard.weather.title')}</div>
                    <div className="text-muted-fg text-xs mt-0.5">
                        {locationSet
                            ? (weather?.current
                                ? `${city}, ${district}`
                                : loading ? t('dashboard.weather.loading', 'Loading...') : t('dashboard.weather.selectLocation', 'Select location below'))
                            : t('dashboard.weather.selectLocation', 'Select location below')}
                    </div>
                </div>
            </div>

            <div className="p-5 flex flex-col gap-4 flex-1">

                {/* Location picker */}
                <LocationSelector
                    state={state} setState={v => { setState(v); setWeather(null) }}
                    district={district} setDistrict={v => { setDistrict(v); setWeather(null) }}
                    city={city} setCity={setCity}
                />

                {/* ── States ── */}
                {!locationSet && (
                    <div className="flex-1 flex flex-col items-center justify-center py-8 gap-2 border-2 border-dashed border-border rounded-xl">
                        <span className="text-3xl">📍</span>
                        <p className="text-xs text-muted-fg text-center leading-relaxed">
                            {t('dashboard.weather.selectDistrict', 'Select your district & city to view weather')}
                        </p>
                    </div>
                )}

                {locationSet && loading && (
                    <div className="flex-1 flex flex-col items-center justify-center py-8 gap-3">
                        <svg className="animate-spin w-7 h-7 text-foreground/30" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        <p className="text-xs text-muted-fg">{t('dashboard.weather.fetching')}</p>
                    </div>
                )}

                {locationSet && error && !loading && (
                    <div className="flex flex-col items-center justify-center py-6 gap-2 border border-border rounded-xl bg-muted text-center">
                        <span className="text-2xl">⚠️</span>
                        <p className="text-xs text-muted-fg">{error}</p>
                    </div>
                )}

                {locationSet && weather && !loading && (
                    <>
                        {/* ── Current conditions ── */}
                        <div className="flex justify-between items-center bg-muted rounded-xl px-4 py-3 border border-border">
                            <div>
                                <div className="text-3xl font-extrabold text-foreground leading-none">
                                    {Math.round(weather.current.temperature)}°C
                                </div>
                                <div className="text-xs text-muted-fg mt-1 font-medium">{weather.current.weather}</div>
                            </div>
                            <span className="text-4xl">{weatherIcon(weather.current.weather)}</span>
                        </div>

                        {/* ── Stats row ── */}
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                ['💧', t('dashboard.weather.humidity'), `${weather.current.humidity}%`],
                                ['💨', t('dashboard.weather.wind'), `${weather.current.wind} m/s`],
                                ['🌧️', t('dashboard.weather.rainfall', 'Rainfall'), `${weather.current.rain} mm`],
                            ].map(([ico, lbl, val]) => (
                                <div key={lbl} className="rounded-xl py-3 px-2 flex flex-col items-center gap-1 border border-border bg-muted">
                                    <span className="text-sm">{ico}</span>
                                    <span className="text-[10px] text-muted-fg font-medium">{lbl}</span>
                                    <span className="text-xs font-bold text-foreground">{val}</span>
                                </div>
                            ))}
                        </div>

                        {/* ── Advisory banner ── */}
                        {weather.advisory?.message && (
                            <div className="rounded-xl border border-border bg-muted px-4 py-3 flex flex-col gap-2">
                                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                    <span>⚡</span> {weather.advisory.message}
                                </p>
                                {weather.advisory.actions?.length > 0 && (
                                    <ul className="flex flex-col gap-1">
                                        {weather.advisory.actions.map((a, i) => (
                                            <li key={i} className="text-[11px] text-muted-fg flex items-start gap-1.5">
                                                <span className="mt-0.5 shrink-0">•</span>{a}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}

                        {/* ── 3-day forecast ── */}
                        <div>
                            <p className="text-[11px] font-semibold text-muted-fg uppercase tracking-wider mb-2">{t('dashboard.weather.forecast5day', '5-Day Forecast')}</p>
                            <div className="flex items-center px-3 mb-1 gap-0">
                                <span className="text-[10px] text-muted-fg font-semibold uppercase tracking-wider w-16">{t('dashboard.weather.day', 'Day')}</span>
                                <span className="text-[10px] text-muted-fg font-semibold uppercase tracking-wider w-8 text-center"></span>
                                <span className="text-[10px] text-muted-fg font-semibold uppercase tracking-wider flex-1 text-center">{t('dashboard.weather.temp', 'Temp')}</span>
                                <span className="text-[10px] text-muted-fg font-semibold uppercase tracking-wider w-12 text-right">{t('dashboard.weather.rain', 'Rain')}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                {weather.forecast.map(({ day, temp, icon, rain }) => (
                                    <div key={day} className="flex items-center rounded-lg px-3 py-2 text-xs border border-border bg-muted gap-0">
                                        <span className="text-muted-fg font-medium w-16">{day}</span>
                                        <span className="text-base w-8 text-center">{icon}</span>
                                        <span className="font-bold text-foreground flex-1 text-center">{temp}</span>
                                        <span className="text-muted-fg font-semibold w-12 text-right">{rain}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
