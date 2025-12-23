import { useState } from "react";
import "./App.css";
import Login from "./pages/Login";
import LanguageSelection from "./pages/LanguageSelection";
import Home from "./pages/Home";
import Context from "./pages/Context";
import Input from "./pages/Input";
import Result from "./pages/Result";
import Escalation from "./pages/Escalation";
import History from "./pages/History";

function App() {
  // Navigation state
  const [currentPage, setCurrentPage] = useState("login");

  // User data
  const [user, setUser] = useState(null);
  const [language, setLanguage] = useState(null);

  // Query flow data
  const [selectedMode, setSelectedMode] = useState(null);
  const [context, setContext] = useState(null);
  const [queryResult, setQueryResult] = useState(null);
  const [escalationStatus, setEscalationStatus] = useState(null);

  // Handle login
  const handleLoginSuccess = (response) => {
    setUser(response);
    setCurrentPage("languageSelection");
  };

  // Handle language selection
  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    setCurrentPage("home");
  };

  // Handle mode selection
  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
    setCurrentPage("context");
  };

  // Handle context submission
  const handleContextSubmit = (contextData) => {
    setContext(contextData);
    setCurrentPage("input");
  };

  // Handle query submission
  const handleQuerySubmit = (result) => {
    setQueryResult(result);
    setCurrentPage("result");
  };

  // Handle escalation
  const handleEscalate = (status) => {
    setEscalationStatus(status);
    setCurrentPage("escalation");
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    setLanguage(null);
    setSelectedMode(null);
    setContext(null);
    setQueryResult(null);
    setEscalationStatus(null);
    setCurrentPage("login");
  };

  // Handle back navigation
  const handleBack = () => {
    if (currentPage === "context") setCurrentPage("home");
    else if (currentPage === "input") setCurrentPage("context");
    else if (currentPage === "result") setCurrentPage("input");
  };

  // Handle show history
  const handleShowHistory = () => {
    setCurrentPage("history");
  };

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case "login":
        return <Login onLoginSuccess={handleLoginSuccess} />;

      case "languageSelection":
        return <LanguageSelection onLanguageSelect={handleLanguageSelect} />;

      case "home":
        return (
          <Home
            onModeSelect={handleModeSelect}
            onShowHistory={handleShowHistory}
            onLogout={handleLogout}
          />
        );

      case "context":
        return (
          <Context
            mode={selectedMode}
            onContextSubmit={handleContextSubmit}
            onBack={handleBack}
          />
        );

      case "input":
        return (
          <Input
            context={context}
            mode={selectedMode}
            onQuerySubmit={handleQuerySubmit}
            onBack={handleBack}
          />
        );

      case "result":
        return (
          <Result
            result={queryResult}
            onEscalate={handleEscalate}
            onBack={handleBack}
          />
        );

      case "escalation":
        return (
          <Escalation
            escalationStatus={escalationStatus}
            onGoHome={() => setCurrentPage("home")}
          />
        );

      case "history":
        return <History onBack={() => setCurrentPage("home")} />;

      default:
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return <div className="app">{renderPage()}</div>;
}

export default App;
