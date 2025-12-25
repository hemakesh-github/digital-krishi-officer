import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
// import Input from "./pages/Input";
import About from "./pages/About";
import Logout from "./pages/Logout";
import CropDetails from "./pages/CropDetails";
import './App.css';

function Profile() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-3xl font-bold text-green-700 mb-4">Profile</h1>
      <p className="text-gray-600">This is a placeholder profile page.</p>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [language, setLanguage] = useState(null);
  const [showHome, setShowHome] = useState(false);
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState(null);
  const [crop, setCrop] = useState(null);
  const [result, setResult] = useState(null);
  const [escalationStatus, setEscalationStatus] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/about" element={<About />} />
        <Route path="/language" element={isLoggedIn ? <LanguageSelection onSelect={(lang) => { setLanguage(lang); setShowHome(true); }} /> : <Navigate to="/login" replace />} />
        <Route path="/home" element={showHome ? <Home /> : <Navigate to="/language" replace />} />
        <Route path="/history" element={<HistoryWrapper />} />
        <Route path="/ask-doubt" element={<AskDoubtWrapper />} />
        <Route path="/select-crop" element={<SelectCropWrapper />} />
        <Route path="/crop-details" element={<CropDetailsWrapper />} />

        <Route path="/result" element={<ResultWrapper />} />
        <Route path="/query-details" element={<QueryDetails />} />
        <Route path="/escalation" element={<EscalationWrapper />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}


import { useLocation, useNavigate } from "react-router-dom";

function ContextRouteWrapper() {
  const location = useLocation();
  const navigate = useNavigate();
  const mode = location.state?.mode;
  // If you want to keep Context page, update navigation as needed
  return <Context mode={mode} onBack={() => navigate(-1)} onSubmit={() => navigate("/home")} />;
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


import { submitQuery } from "./api_services/api_services";
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

export default App
