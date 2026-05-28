import { useEffect, useMemo, useState } from "react";
import "./cke.css";

const API = "http://localhost:3001/api";

type Key = {
  _id: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  keyType: string;
  price: number;
  imagesUrls: string[];
  thumbnailsUrls: string[];
};

const CKE = () => {
  const [keys, setKeys] = useState<Key[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedKey, setSelectedKey] = useState<Key | null>(null);
  const [isLoading, setIsLoading] = useState(false);
 
  const models = useMemo(() => [...new Set(keys.map((k) => k.model))], [keys]);

  const years = useMemo(
    () =>
      [
        ...new Set(
          keys.filter((k) => k.model === selectedModel).map((k) => k.year),
        ),
      ].sort((a, b) => b - a),
    [keys, selectedModel],
  );

  const availableKeys = useMemo(
    () =>
      keys.filter((k) => k.model === selectedModel && k.year === selectedYear),
    [keys, selectedModel, selectedYear],
  );

  useEffect(() => {
    if (!selectedBrand) return;
    setIsLoading(true);
    fetch(`${API}/keys/brands/${selectedBrand}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data: { keys: Key[] }) => setKeys(data.keys))
      .finally(() => setIsLoading(false));
  }, [selectedBrand]);

  useEffect(() => {
    fetch(`${API}/keys/brands`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data: { brands: string[] }) => setBrands(data.brands));
  }, []);

  const handleReset = () => {
    setSelectedBrand("");
    setSelectedModel("");
    setSelectedYear(null);
    setSelectedKey(null);
    setKeys([]);
  };

  if (!brands || brands.length === 0) return (
    <div className="cke-loading-state">
      <div className="loading-spinner"></div>
      <span>Loading keys database...</span>
    </div>
  );

  return (
    <>
      <header className="loco-header">
        <span style={{ fontSize: 20, color: "#e05a2b" }}>🔑</span>
        <span className="loco-logo">
          PHOBO LO<span>C</span>O
        </span>
        <span className="loco-tagline">Key Database</span>
      </header>

      <div className="cke-container">
        {/* Step 1: Brand Selection */}
        <div className={`step-card ${selectedBrand ? "completed" : ""}`}>
          <div className="step-header">
            <span className="step-num">01</span>
            <span className="step-title">Select Brand</span>
            {selectedBrand && (
              <span className="step-badge">{selectedBrand}</span>
            )}
          </div>
          <div className="step-body">
            <select 
              className="cke-select"
              value={selectedBrand}
              onChange={(e) => {
                const brand = e.currentTarget.value;
                if (!brand || brand.length === 0) {
                  handleReset();
                  return;
                }
                setSelectedBrand(brand);
                setSelectedModel("");
                setSelectedYear(null);
                setSelectedKey(null);
                setKeys([]);
              }}
            >
              <option value="">Choose a brand...</option>
              {brands.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 2: Model Selection */}
        <div className={`step-card ${!selectedBrand ? "inactive" : ""} ${selectedModel ? "completed" : ""}`}>
          <div className="step-header">
            <span className="step-num">02</span>
            <span className="step-title">Select Model</span>
            {selectedModel && (
              <span className="step-badge">{selectedModel}</span>
            )}
          </div>
          <div className="step-body">
            {isLoading ? (
              <div className="loading-state">loading models...</div>
            ) : models.length === 0 ? (
              <div className="empty-state">no models available</div>
            ) : (
              <div className="models-grid">
                {models.map((model) => (
                  <div
                    key={model}
                    className={`model-item ${selectedModel === model ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedModel(model);
                      setSelectedYear(null);
                      setSelectedKey(null);
                    }}
                  >
                    <div className="model-name">{model}</div>
                    {selectedModel === model && (
                      <div className="model-check">✓</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Year Selection */}
        <div className={`step-card ${!selectedModel ? "inactive" : ""} ${selectedYear ? "completed" : ""}`}>
          <div className="step-header">
            <span className="step-num">03</span>
            <span className="step-title">Select Year</span>
            {selectedYear && (
              <span className="step-badge">{selectedYear}</span>
            )}
          </div>
          <div className="step-body">
            {years.length === 0 ? (
              <div className="empty-state">no years available</div>
            ) : (
              <div className="years-grid">
                {years.map((year) => (
                  <div
                    key={year}
                    className={`year-item ${selectedYear === year ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedYear(year);
                      setSelectedKey(null);
                    }}
                  >
                    {year}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results Section - Available Keys */}
        {availableKeys.length > 0 && (
          <div className="results-section">
            <div className="results-header">
              <span className="results-title">Available Keys</span>
              <span className="results-count">{availableKeys.length} found</span>
            </div>
            <div className="keys-grid">
              {availableKeys.map((key) => (
                <div
                  key={key._id}
                  className={`key-card ${selectedKey?._id === key._id ? "selected" : ""}`}
                  onClick={() => setSelectedKey(key)}
                >
                  <div className="key-image-wrapper">
                    <img 
                      src={key.thumbnailsUrls[0]} 
                      alt={key.keyType}
                      className="key-image"
                    />
                  </div>
                  <div className="key-info">
                    <h3 className="key-type">{key.keyType}</h3>
                    <div className="key-price">${key.price}</div>
                    <button className={`key-select-btn ${selectedKey?._id === key._id ? "selected" : ""}`}>
                      {selectedKey?._id === key._id ? "✓ Selected" : "Select Key"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {selectedBrand && selectedModel && selectedYear && availableKeys.length === 0 && !isLoading && (
          <div className="empty-state-full">
            <span className="empty-icon">🔍</span>
            <p>No keys found for {selectedBrand} {selectedModel} ({selectedYear})</p>
            <button className="reset-btn" onClick={handleReset}>
              Start Over
            </button>
          </div>
        )}

        {/* Confirmation Bar */}
        {selectedKey && (
          <div className="confirm-bar">
            <div className="confirm-summary">
              <div className="confirm-field">
                <span className="confirm-label">Brand</span>
                <span className="confirm-value">{selectedKey.brand}</span>
              </div>
              <div className="confirm-field">
                <span className="confirm-label">Model</span>
                <span className="confirm-value">{selectedKey.model}</span>
              </div>
              <div className="confirm-field">
                <span className="confirm-label">Year</span>
                <span className="confirm-value">{selectedKey.year}</span>
              </div>
              <div className="confirm-field">
                <span className="confirm-label">Key Type</span>
                <span className="confirm-value">{selectedKey.keyType}</span>
              </div>
              <div className="confirm-field">
                <span className="confirm-label">Price</span>
                <span className="confirm-value">${selectedKey.price}</span>
              </div>
            </div>
            <button 
              className="confirm-btn"
              onClick={() => {
                console.log("Selected key:", selectedKey);
                alert(`Key selected: ${selectedKey.keyType} - $${selectedKey.price}`);
              }}
            >
              proceed with this key →
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CKE;