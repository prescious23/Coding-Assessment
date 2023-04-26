import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [inputData, setInputData] = useState({});
  const [outputData, setOutputData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://api.up2tom.com/v3/models', {
          headers: { 'Authorization': 'Token <key>' },
          contentType: 'application/vnd.api+json'
        });
        setModels(response.data.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const handleSelectModel = async (modelId) => {
    try {
      const response = await axios.get(`https://api.up2tom.com/v3/models/${modelId}`, {
        headers: { 'Authorization': 'Token <key>' },
        contentType: 'application/vnd.api+json'
      });
      setSelectedModel(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDecision = async () => {
    try {
      const response = await axios.post(`https://api.up2tom.com/v3/decision/${selectedModel.id}`, {
        data: inputData
      }, {
        headers: { 'Authorization': 'Token <key>' },
        contentType: 'application/vnd.api+json'
      });
      setOutputData(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setInputData(prevInputData => ({
      ...prevInputData,
      [name]: value
    }));
  };

  return (
    <div>
      <h1>Models</h1>
      <ul>
        {models.map(model => (
          <li key={model.id} onClick={() => handleSelectModel(model.id)}>
            {model.attributes.name}
          </li>
        ))}
      </ul>
      {selectedModel && (
        <div>
          <h2>{selectedModel.attributes.name}</h2>
          <p>{selectedModel.attributes.description}</p>
          <form onSubmit={(event) => { event.preventDefault(); handleDecision(); }}>
            {Object.entries(selectedModel.attributes.metadata).map(([key, value]) => (
              <div key={key}>
                <label htmlFor={key}>{value.question}</label>
                {value._cls === 'Nominal' ? (
                  <select name={key} onChange={handleInputChange}>
                    {value.domain.values.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input type="number" name={key} min={value.domain.lower} max={value.domain.upper} step={value.domain.interval} onChange={handleInputChange} />
                )}
              </div>
            ))}
            <button type="submit">Submit</button>
          </form>
          {Object.entries(outputData).length > 0 && (
            <div>
              <h2>Output</h2>
              {Object.entries(outputData).map(([key, value]) => (
                <div key={key}>
                  <label htmlFor={key}>{key}</label>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} export default App;