import React, { useState } from 'react';
import './style/style.css';

function Home() {
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState('');
  const [prompt, setPrompt] = useState('');
  const [jresult, setJresult] = useState('');
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

    const response = await fetch('/api/chatgpt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: inputValue }),
    });

    try {
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setPrompt(inputValue);
        setResult(data.data.choices[0].text);
        setJresult(JSON.stringify(data.data, null, 2));
        setInputValue('');
        setError('');
      } else {
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
          <div className="col-sm-10 mt-2">
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
          <div className="col-sm-2 mt-2">
            <button type="submit" className="btn btn-primary custom-button">Submit</button>
          </div>
        </div>
      </form>
      {error && <div className="alert alert-danger mt-3">{error}</div>}
      {prompt && <div className="alert alert-secondary mt-3">{prompt}</div>}
      {result && <div className="alert alert-success mt-3">{result}</div>}
      {result && (
        <pre className="alert alert-info mt-3">
          <code>{jresult}</code>
        </pre>
      )}
    </div>
  );
}

export default Home;
