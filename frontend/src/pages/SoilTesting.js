import React, { useState } from "react";
import SoilTestForm from "../components/SoilTestForm";
import SoilResults from "../components/SoilResults";

export default function SoilTestingPage() {
  const [results, setResults] = useState(null);

  return (
    <div className="page-shell">
      <h2 className="page-title">Soil Testing</h2>
      <p className="page-sub">Analyse your soil and get farming recommendations.</p>

      {!results ? (
        <SoilTestForm onResults={setResults} />
      ) : (
        <SoilResults results={results} onRetry={() => setResults(null)} />
      )}
    </div>
  );
}