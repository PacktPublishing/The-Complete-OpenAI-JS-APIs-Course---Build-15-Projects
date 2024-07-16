import React, { useState } from 'react';
import './style/style.css';

function Similarity() {
  const [inputValue, setInputValue] = useState('');
  const [inputValue2, setInputValue2] = useState('');
  const [result, setResult] = useState('');
  const [prompt, setPrompt] = useState('');
  const [jresult, setJresult] = useState('');
  const [responseok, setResponseok] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(!inputValue){
      setError('Please enter a prompt!');
      setPrompt('');
      setResult('');
      setJresult('');
      return;
    }

    const response = await fetch('/api/similarity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text1: inputValue,  text2: inputValue2}),
    });

    try {
      if (response.ok) {
        setResponseok(true);
        const data = await response.json();
        console.log(data);
        setPrompt(`Similarity between ${inputValue} and ${inputValue2}.`);
        setResult(data.similarity);
        setJresult(JSON.stringify(data, null, 2));
        setInputValue('');
        setInputValue2('');
        setError('');
      } else {
        setResponseok(false);
        throw new Error('An error occurred');
      }
    } catch (error) {
      console.log(error);
      setResult('');
      setError('An error occurred while submitting the form.');
    }
  };

  return (
    <div className="container">
      <form className="form-horizontal" onSubmit={handleSubmit}>
        <div className="form-group row">
          <div className="col-sm-5 mt-2">
            <div className="form-floating">
              <textarea
                className="form-control custom-input"
                id="floatingInput"
                placeholder="Enter a value"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />

              <label htmlFor="floatingInput">Input</label>
            </div>
          </div>
          <div className="col-sm-5 mt-2">
            <div className="form-floating">
              <textarea
                className="form-control custom-input"
                id="floatingInput"
                placeholder="Enter a value"
                value={inputValue2}
                onChange={(e) => setInputValue2(e.target.value)}
              />

              <label htmlFor="floatingInput">Input</label>
            </div>
          </div>
          <div className="col-sm-2 mt-2">
            <button type="submit" className="btn btn-primary custom-button">Submit</button>
          </div>
        </div>
      </form>
      {error && <div className="alert alert-danger mt-3">{error}</div>}
      {prompt && <div className="alert alert-secondary mt-3">{prompt}</div>}
      {result && <div className="alert alert-success mt-3">{result}</div>}
      {responseok && (
        <pre className="alert alert-info mt-3">
          <code>{jresult}</code>
        </pre>
      )}
    </div>
  );
}

export default Similarity;
