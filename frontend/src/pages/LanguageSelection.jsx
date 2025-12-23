import { useState } from "react";
import LanguageSelect from "../components/LanguageSelect";

export default function LanguageSelectionPage({ onLanguageSelect }) {
  const handleSelect = (lang) => {
    onLanguageSelect(lang);
  };

  return <LanguageSelect onSelect={handleSelect} />;
}
