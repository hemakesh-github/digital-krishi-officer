import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

import Login from "./pages/Login";
import LanguageSelection from "./pages/LanguageSelection";
import Home from "./pages/Home";
import AskDoubt from "./pages/AskDoubt";
import SelectCrop from "./pages/SelectCrop";
import History from "./pages/History";
import Result from "./pages/Result";
import QueryDetails from "./pages/QueryDetails";
import Escalation from "./pages/Escalation";
import About from "./pages/About";
import Logout from "./pages/Logout";
import CropDetails from "./pages/CropDetails";
import MarketPrices from "./pages/Market_Prices";
import './App.css';
import { submitQuery } from "./api_services/api_services";

function Profile() {
    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-white">
            <h1 className="text-3xl font-bold text-green-700 mb-4">Profile</h1>
            <p className="text-gray-600">This is a placeholder profile page.</p>
        </div>
    );
}

const ProtectedRoute = ({ children }) => {
    const isAuth = !!localStorage.getItem("token");
    return isAuth ? children : <Navigate to="/login" replace />;
};

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("token"));
    const [language, setLanguage] = useState(null);

    return (
        <Router>
            <Routes>
                <Route path="/" element={isLoggedIn ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />} />
                <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/about" element={<About />} />
                <Route path="/language" element={isLoggedIn ? <LanguageSelection onSelect={(lang) => setLanguage(lang)} /> : <Navigate to="/login" replace />} />

                {/* Protected Routes */}
                <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/market-prices" element={<ProtectedRoute><MarketPrices /></ProtectedRoute>} />
                <Route path="/history" element={<ProtectedRoute><HistoryWrapper /></ProtectedRoute>} />
                <Route path="/ask-doubt" element={<ProtectedRoute><AskDoubtWrapper /></ProtectedRoute>} />
                <Route path="/select-crop" element={<ProtectedRoute><SelectCropWrapper /></ProtectedRoute>} />
                <Route path="/crop-details" element={<ProtectedRoute><CropDetailsWrapper /></ProtectedRoute>} />
                <Route path="/result" element={<ProtectedRoute><ResultWrapper /></ProtectedRoute>} />
                <Route path="/query-details" element={<ProtectedRoute><QueryDetails /></ProtectedRoute>} />
                <Route path="/escalation" element={<ProtectedRoute><EscalationWrapper /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            </Routes>
        </Router>
    );
}

function ContextRouteWrapper() {
    const location = useLocation();
    const navigate = useNavigate();
    const mode = location.state?.mode;
    // If you want to keep Context page, update navigation as needed
    // Assuming Context component is missing or not used, commenting out return to avoid error
    // return <Context mode={mode} onBack={() => navigate(-1)} onSubmit={() => navigate("/home")} />;
    return null;
}

function AskDoubtWrapper() {
    const location = useLocation();
    const navigate = useNavigate();
    const mode = location.state?.mode;
    return <AskDoubt mode={mode} onNext={(question) => navigate("/select-crop", { state: { mode, question } })} />;
}

function SelectCropWrapper() {
    const location = useLocation();
    const navigate = useNavigate();
    const { mode, question } = location.state || {};
    return <SelectCrop mode={mode} question={question} onNext={(crop) => navigate("/crop-details", { state: { mode, question, crop } })} />;
}

function CropDetailsWrapper() {
    const location = useLocation();
    const navigate = useNavigate();
    const { mode, question, crop } = location.state || {};
    const handleNext = async ({ location: loc, stage }) => {
        let payload = {};
        if (mode === "weather") {
            payload = { location: loc, crop, stage };
        } else if (mode === "scheme") {
            payload = { location: loc, crop };
        } else {
            payload = { question, crop, location: loc, stage };
        }
        const result = await submitQuery(payload);
        navigate("/result", { state: { result, mode, question, crop, location: loc, stage } });
    };
    return <CropDetails mode={mode} question={question} crop={crop} onNext={handleNext} />;
}

function ResultWrapper() {
    const location = useLocation();
    const navigate = useNavigate();
    const { result, mode, question, crop } = location.state || {};
    return <Result result={result} onHelpful={() => navigate("/home")} onEscalate={(status) => navigate("/escalation", { state: { status } })} />;
}

function EscalationWrapper() {
    const location = useLocation();
    const navigate = useNavigate();
    const { status } = location.state || {};
    return <Escalation status={status} onGoHome={() => navigate("/home")} />;
}

function HistoryWrapper() {
    const navigate = useNavigate();
    return <History onBack={() => navigate(-1)} />;
}

export default App;
