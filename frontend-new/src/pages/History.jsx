import { useState, useEffect, useContext } from "react";
import { useNavigate } from 'react-router-dom'
import { getHistory } from "../api_services/api_services";
import { UserContextData } from "../context/UserContext";

const MicroscopeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 18h8" /><path d="M3 21h18" /><path d="M14 21v-4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v4" />
        <path d="M14 7l-1-4" /><path d="M10 7l1-4" /><circle cx="12" cy="7" r="4" />
    </svg>
);

const LeafIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
);

const PinIcon = () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
);

const ArrowIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
);

function ConfidenceBadge({ value }) {
    const color = value >= 90 ? "text-red-600 bg-red-100" : value >= 80 ? "text-orange-600 bg-orange-100" : "text-amber-600 bg-amber-100";
    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${color}`}>
            {value}%
        </span>
    );
}


function HistoryRow({ item, handleDetails }) {
    const isDisease = item.type === "disease_detection";



    return (
        <div className="group flex items-center gap-4 bg-white hover:bg-slate-50 border-b border-slate-100 px-4 py-3 transition-colors last:border-0 first:rounded-t-xl last:rounded-b-xl">
            {/* Icon Column */}
            <div className={`flex-none w-8 h-8 rounded-lg flex items-center justify-center ${isDisease ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                {isDisease ? <MicroscopeIcon /> : <LeafIcon />}
            </div>

            {/* Crop Column */}
            <div className="flex-none w-24">
                <div className="text-sm font-bold text-slate-900 truncate">{item.crop}</div>
                {(item.location && item.location != "string") && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium lowercase italic ml-5">
                        <PinIcon /> {item.location.length > 10 ? item.location.slice(0, 10) + "..." : item.location}
                    </div>
                )}
            </div>

            {/* Result Column - Takes available space */}
            {isDisease ?
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">

                        <span className={`text-[13px] font-semibold truncate 'text-slate-700'}`}>
                            {item.result}
                        </span>
                        <ConfidenceBadge value={item.confidence} />
                    </div>
                </div> : <div className="flex-1 min-w-0"></div>}

            {/* Date Column */}
            <div className="flex-none w-28 text-right hidden sm:block">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">{item.date}</div>
                <div className="text-[10px] text-slate-300 tabular-nums">{item.time}</div>
            </div>

            {/* Action Column */}
            <div className="flex-none">
                <button className={`w-28 h-7 py-4 rounded-full flex items-center justify-center border transition-all hover:scale-110 cursor-pointer active:scale-90 ${isDisease ? 'border-red-200 text-red-500 hover:bg-red-500 hover:text-white' : 'border-green-200 text-green-600 hover:bg-green-600 hover:text-white'}`} onClick={() => handleDetails(item)}>
                    Details
                    <ArrowIcon />
                </button>
            </div>
        </div>
    );
}

function SectionHeader({ label, count, colorClass }) {
    return (
        <div className="flex items-center gap-3 mb-3 px-1">
            <h2 className={`text-xs font-black uppercase tracking-[0.2em] ${colorClass}`}>
                {label}
            </h2>
            <span className="h-px flex-1 bg-slate-100" />
            <span className="text-[10px] font-bold text-slate-300">{count} ITEMS</span>
        </div>
    );
}

export default function History() {
    const navigate = useNavigate();

    const [queries, setQueries] = useState([]);
    const [diseaseItems, setDiseaseItems] = useState([]);
    const [cropItems, setCropItems] = useState([]);


    function handleDetails(item) {
        if (item.type === "disease_detection") {
            navigate(`/chat?session=${item.id}`);
        } else {
            navigate(`/chat?session=${item.id}`);
        }
    }
    const { userId } = useContext(UserContextData);
    useEffect(() => {
        async function fetch() {
            try {
                console.log(userId)
                let response = await getHistory(userId);
                console.log(response)
                setCropItems([])
                setDiseaseItems([])
                response = response.map((item) => {
                    const dateObj = new Date(item.created_at);
                    const date = dateObj.toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });
                    const time = dateObj.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    item = {
                        ...item,
                        crop: item.cropdata.crop,
                        location: item.cropdata.location,
                        query: item.cropdata.query,
                        date,
                        time,
                    }

                    if (item.type === "disease_detection") {
                        setDiseaseItems((prev) => [...prev, item]);
                    } else {
                        setCropItems((prev) => [...prev, item]);
                    }
                    return item;
                });

                setQueries(response);

            } catch (error) {
                console.error('Error fetching history:', error)
            }
        }
        fetch();
    }, [userId]);

    console.log("diseaseItems", diseaseItems)
    console.log("cropItems", cropItems)


    return (
        <div className="min-h-screen bg-slate-50/50 p-4 sm:p-8 font-sans antialiased text-slate-900">
            <div className="max-w-4xl mx-auto">

                {/* Compact Header */}
                <header className="mb-8 flex items-center justify-between border-b border-slate-200 pb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-8 bg-slate-900 rounded-full" />
                        <h1 className="text-2xl font-black tracking-tighter uppercase">History</h1>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Queries</span>
                        <span className="text-lg font-black leading-none">{queries.length}</span>
                    </div>
                </header>

                <main className="space-y-8">
                    {/* Disease Section */}
                    <section>
                        <SectionHeader label="Disease Detection" count={diseaseItems.length} colorClass="text-red-500" />
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                            {diseaseItems.map((item) => (
                                <HistoryRow key={item.id} item={item} handleDetails={handleDetails} />
                            ))}
                        </div>
                    </section>

                    {/* Crop Advice Section */}
                    <section>
                        <SectionHeader label="Crop Advice/Problem" count={cropItems.length} colorClass="text-green-600" />
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                            {cropItems.map((item) => (
                                <HistoryRow key={item.id} item={item} handleDetails={handleDetails} />
                            ))}
                        </div>
                    </section>
                </main>


            </div>
        </div>
    );
}