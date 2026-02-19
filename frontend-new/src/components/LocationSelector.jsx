import { useEffect, useRef, useState } from 'react'
import { getDistricts, getCities } from '../api_services/api_services'

// ─────────────────────────────────────────────────────────────────────────────
// Shared select style
// ─────────────────────────────────────────────────────────────────────────────
const sel = (accent) =>
    `w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 bg-white
     focus:outline-none focus:ring-2 ${accent} focus:border-transparent
     disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
     transition-all duration-150 appearance-none cursor-pointer`

// ─────────────────────────────────────────────────────────────────────────────
// LocationSelector
// Props: accent, state, setState, district, setDistrict, city, setCity
// ─────────────────────────────────────────────────────────────────────────────
export default function LocationSelector({
    accent = 'focus:ring-green-300',
    state, setState,
    district, setDistrict,
    city, setCity,
}) {
    const [districts, setDistricts] = useState([])
    const [citySuggestions, setCitySuggestions] = useState([])
    const [cityInput, setCityInput] = useState(city || '')
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const cityRef = useRef(null)

    // Close city dropdown on outside click
    useEffect(() => {
        const handler = (e) => { if (cityRef.current && !cityRef.current.contains(e.target)) setDropdownOpen(false) }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    // Fetch districts when state changes
    useEffect(() => {
        if (!state) { setDistricts([]); return }
        getDistricts(state).then(data => setDistricts(data || []))
    }, [state])

    // Fetch city suggestions as user types
    useEffect(() => {
        if (!district) { setCitySuggestions([]); return }
        getCities(district, cityInput.trim()).then(data => setCitySuggestions(data || []))
    }, [district, cityInput])

    const handleState = (v) => {
        setState(v)
        setDistrict('')
        setCity('')
        setCityInput('')
    }

    const handleDistrict = (v) => {
        setDistrict(v)
        setCity('')
        setCityInput('')
    }

    const handleCitySelect = (val) => {
        setCityInput(val)
        setCity(val)
        setDropdownOpen(false)
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">

            {/* State — plain select */}
            <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">State</label>
                <div className="relative">
                    <select value={state} onChange={e => handleState(e.target.value)} className={sel(accent)}>
                        <option value="">Select...</option>
                        {/* TODO: replace with API-fetched states */}
                        {['Andhra Pradesh', 'Telangana', 'Maharashtra', 'Karnataka', 'Tamil Nadu',
                            'Punjab', 'Uttar Pradesh', 'Rajasthan', 'Gujarat', 'Madhya Pradesh',
                            'Bihar', 'Odisha', 'West Bengal', 'Haryana', 'Assam'].map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                    </select>
                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
                </div>
            </div>

            {/* District — plain select, populated from API */}
            <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">District</label>
                <div className="relative">
                    <select value={district} onChange={e => handleDistrict(e.target.value)} disabled={!state} className={sel(accent)}>
                        <option value="">Select...</option>
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
                </div>
            </div>

            {/* City — type-ahead input with suggestions */}
            <div className="flex flex-col gap-1" ref={cityRef}>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">City/Mandal</label>
                <div className="relative">
                    <input
                        type="text"
                        value={cityInput}
                        disabled={!district}
                        placeholder={district ? 'Type to search...' : 'Select district first'}
                        onChange={e => { setCityInput(e.target.value); setCity(''); setDropdownOpen(true) }}
                        onFocus={() => { if (citySuggestions.length > 0) setDropdownOpen(true) }}
                        className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 bg-white
                            focus:outline-none focus:ring-2 ${accent} focus:border-transparent
                            disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
                            transition-all duration-150`}
                    />

                    {/* Suggestions dropdown */}
                    {dropdownOpen && citySuggestions.length > 0 && (
                        <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                            {citySuggestions.map(c => (
                                <li
                                    key={c}
                                    onMouseDown={() => handleCitySelect(c)}
                                    className={`px-3 py-2 text-sm cursor-pointer transition-colors duration-100
                                        ${city === c ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    {c}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

        </div>
    )
}
