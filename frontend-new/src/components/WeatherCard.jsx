import { useState, useEffect } from 'react'
import LocationSelector from './LocationSelector'

// TODO: Replace with real weather API call
// async function fetchWeather(state, district, city) { ... }
const DUMMY_WEATHER = {
    temp: '28°C',
    condition: 'Partly Cloudy',
    icon: '⛅',
    humidity: '65%',
    wind: '12 km/h',
    rainfall: '2.5 mm',
    forecast: [
        { day: 'Today', temp: '28°C', sky: 'Partly Cloudy', rain: '10%', icon: '⛅' },
        { day: 'Tomorrow', temp: '30°C', sky: 'Sunny', rain: '0%', icon: '☀️' },
        { day: 'Day 3', temp: '26°C', sky: 'Rainy', rain: '80%', icon: '🌧️' },
    ],
}


export default function WeatherCard() {
    const [state, setState] = useState('')
    const [district, setDistrict] = useState('')
    const [city, setCity] = useState('')

    const locationSet = state && district && city
    const [weather, setWeather] = useState(DUMMY_WEATHER)
        
    useEffect(()=> {
        async function fetchWeather() {
            if (state && district && city){
                const w = await getWeather(state, district, city);
                setWeather(w);
            }
        }

        fetchWeather()
        
    }, [state, district, city])

    return (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col w-full">

            {/* Card header band */}
            <div className="bg-linear-to-r from-sky-500 to-blue-600 px-5 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-lg">🌤️</div>
                <div>
                    <div className="font-bold text-white text-sm">Weather Conditions</div>
                    <div className="text-sky-100 text-xs mt-0.5">
                        {locationSet ? `${city}, ${district}` : 'Select your location'}
                    </div>
                </div>
            </div>

            <div className="p-5 flex flex-col gap-4 flex-1">

                {/* Location picker */}
                <LocationSelector
                    accent="focus:ring-sky-300"
                    state={state} setState={setState}
                    district={district} setDistrict={setDistrict}
                    city={city} setCity={setCity}
                />

                {locationSet ? (
                    <>
                        {/* Current temp */}
                        <div className="flex justify-between items-center bg-sky-50 rounded-xl px-4 py-3">
                            <div>
                                <div className="text-4xl font-extrabold text-gray-900 leading-none">{weather.temp}</div>
                                <div className="text-sm text-gray-500 mt-1">{weather.condition}</div>
                            </div>
                            <span className="text-5xl">{weather.icon}</span>
                        </div>

                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                ['💧', 'Humidity', weather.humidity],
                                ['💨', 'Wind', weather.wind],
                                ['🌧️', 'Rainfall', weather.rainfall],
                            ].map(([ico, lbl, val]) => (
                                <div key={lbl} className="bg-gray-50 rounded-xl py-2.5 flex flex-col items-center gap-0.5">
                                    <span className="text-base">{ico}</span>
                                    <span className="text-[10px] text-gray-400 font-medium">{lbl}</span>
                                    <span className="text-xs font-bold text-gray-700">{val}</span>
                                </div>
                            ))}
                        </div>

                        {/* Forecast */}
                        <div>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">3-Day Forecast</div>
                            <div className="flex flex-col gap-1">
                                {weather.forecast.map(({ day, temp, sky, rain, icon }) => (
                                    <div key={day} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 text-xs">
                                        <span className="text-gray-600 font-medium w-16">{day}</span>
                                        <span className="text-base">{icon}</span>
                                        <span className="font-bold text-gray-900 w-10 text-center">{temp}</span>
                                        <span className="text-blue-500 font-semibold w-8 text-right">{rain}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-8 gap-3 border-2 border-dashed border-gray-100 rounded-xl">
                        <span className="text-4xl">📍</span>
                        <p className="text-xs text-gray-400 text-center leading-relaxed">
                            Select your state, district<br />and city to view weather
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
