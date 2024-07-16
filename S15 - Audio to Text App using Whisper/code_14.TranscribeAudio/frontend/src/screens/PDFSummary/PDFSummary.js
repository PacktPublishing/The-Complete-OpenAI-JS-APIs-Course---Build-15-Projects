import React, { useState } from 'react';
import './style/style.css';
import axios from 'axios';

function PDFSummary() {
    const [inputValue, setInputValue] = useState('');
    const [result, setResult] = useState('');
    const [jresult, setJresult] = useState('');
    const [error, setError] = useState('');
    const [maxWords, setMaxWords] = useState(100);
    const [selectedFile, setSelectedFile] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        if (!maxWords) {
            setError('Please enter a number of words for the summary.');
            setResult('');
            setJresult('');
            return;
        }


        try {
            const formData = new FormData();
            formData.append('pdf', selectedFile);
            formData.append('maxWords', maxWords);

            const response = await axios.post('/api/pdfsummary', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log(response.data);
            if(response.data.error){
                setError(response.data.error);
                return;
            }
            setError('');
            setResult(response.data.summarisedText);
            setJresult(JSON.stringify(response.data, null, 2));
            // if (response.ok) {
            //     const data = await response.json();
            //     console.log(data);
            //     setResult(data.data.choices[0].text);
            //     setJresult(JSON.stringify(data.data, null, 2));
            //     setInputValue('');
            //     setError('');
            // } else {
            //     throw new Error('An error occurred');
            // }
        } catch (error) {
            console.log(error);
            setResult('');
            setError('An error occurred while submitting the form.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className='hero d-flex align-items-center justify-content-center text-center flex-column p-3'>
                <h1 className='display-4'>PDF Book Summariser.</h1>
                <p className='lead'>Summarise PDF Books for Efficient Reading!</p>
                <form className='w-100' onSubmit={handleSubmit}>
                    <input type='file' accept='.pdf' onChange={handleFileChange}></input>
                    <div className="form-group row">
                        <div className='col-sm-4 offset-sm-4 mt-3'>
                            <input
                                type='number'
                                min='10'
                                value={maxWords}
                                onChange={(e) => setMaxWords(e.target.value)}
                                className='form-control'
                            ></input>
                        </div>
                        <button
                            type='submit'
                            disabled={!selectedFile || loading}
                            className='btn btn-primary custom-button mt-1'
                        >
                            {loading ? 'Analysing PDF...' : `Summarise PDF in about ${maxWords} words`}

                        </button>
                    </div>

                </form>
            </div>
            {error && <div className="alert alert-danger mt-3">{error}</div>}
            {result && <div className="alert alert-success mt-3">{result}</div>}
            {jresult && (
                <pre className="alert alert-info mt-3">
                    <code>{jresult}</code>
                </pre>
            )}
        </div>
    );
}

export default PDFSummary;
