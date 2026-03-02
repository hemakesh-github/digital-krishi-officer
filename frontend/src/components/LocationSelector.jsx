import { useEffect, useRef, useState } from 'react'
import { getDistricts, getCities } from '../api_services/api_services'

const FIXED_STATE = 'Andhra Pradesh'

const selCls = `w-full border border-border rounded-xl px-3 py-2.5 text-sm text-foreground bg-card
    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
    disabled:bg-muted disabled:text-muted-fg disabled:cursor-not-allowed
    transition-all duration-150 appearance-none cursor-pointer`

const inputCls = `w-full border border-border rounded-xl px-3 py-2.5 text-sm text-foreground bg-card
    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
    disabled:bg-muted disabled:text-muted-fg disabled:cursor-not-allowed
    transition-all duration-150`

export default function LocationSelector({
    state, setState, district, setDistrict, city, setCity,
}) {
    const [districts, setDistricts] = useState([])
    const [citySuggestions, setCitySuggestions] = useState([])
    const [cityInput, setCityInput] = useState(city || '')
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const cityRef = useRef(null)

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => { if (cityRef.current && !cityRef.current.contains(e.target)) setDropdownOpen(false) }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    useEffect(() => {
        if (!state) {
            setState(FIXED_STATE)
        }
    }, [state, setState])

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

    const handleDistrict = (v) => { setDistrict(v); setCity(''); setCityInput('') }
    const handleCitySelect = (val) => { setCityInput(val); setCity(val); setDropdownOpen(false) }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">

            {/* State — fixed Andhra Pradesh */}
            <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-muted-fg uppercase tracking-wide">State</label>
                <input value={FIXED_STATE} disabled className={inputCls} />
            </div>

            {/* District — plain select */}
            <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-muted-fg uppercase tracking-wide">District</label>
                <div className="relative">
                    <select value={district} onChange={e => handleDistrict(e.target.value)} disabled={!state} className={selCls}>
                        <option value="">Select...</option>
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-fg text-xs">▾</span>
                </div>
            </div>

            {/* City — type-ahead */}
            <div className="flex flex-col gap-1" ref={cityRef}>
                <label className="text-[11px] font-semibold text-muted-fg uppercase tracking-wide">City/Mandal</label>
                <div className="relative">
                    <input
                        type="text"
                        value={cityInput}
                        disabled={!district}
                        placeholder={district ? 'Type to search...' : 'Select district first'}
                        onChange={e => { setCityInput(e.target.value); setCity(''); setDropdownOpen(true) }}
                        onFocus={() => { if (citySuggestions.length > 0) setDropdownOpen(true) }}
                        className={inputCls}
                    />

                    {dropdownOpen && citySuggestions.length > 0 && (
                        <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-elevated overflow-hidden max-h-48 overflow-y-auto">
                            {citySuggestions.map(c => (
                                <li
                                    key={c}
                                    onMouseDown={() => handleCitySelect(c)}
                                    className={`px-3 py-2 text-sm cursor-pointer transition-colors duration-100
                                        ${city === c ? 'bg-accent text-accent-fg font-semibold' : 'text-foreground hover:bg-muted'}`}
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
