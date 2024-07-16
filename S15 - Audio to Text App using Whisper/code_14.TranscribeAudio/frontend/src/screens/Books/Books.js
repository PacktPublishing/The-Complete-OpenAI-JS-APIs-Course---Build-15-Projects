import React, { useState } from 'react';
import './style/style.css';

function Books() {
    const [inputValue, setInputValue] = useState('');
    const [result, setResult] = useState('');
    const [prompt, setPrompt] = useState('');
    const [jresult, setJresult] = useState('');
    const [responseok, setResponseok] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [books, setBooks] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!inputValue) {
            setError('Please enter a prompt!');
            setPrompt('');
            setResult('');
            setJresult('');
            return;
        }

        setLoading(true);
        const response = await fetch('/api/books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: inputValue }),
        });

        try {
            if (response.ok) {
                setResponseok(true);
                const data = await response.json();
                console.log(data);
                setPrompt(inputValue);
                setResult('Book recommendations:');
                setBooks(data.nearestNeighbours || []);
                setJresult(JSON.stringify(data, null, 2));
                setInputValue('');
                setError('');
            } else {
                setResponseok(false);
                throw new Error('An error occurred');
            }
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
                <h1 className='display-4'>Welcome to Book Recommendations</h1>
                <p className='lead'>Get personalized book recommendations based on your input</p>
                <form className="form-horizontal w-100" onSubmit={handleSubmit}>
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
                            <button type="submit" className="btn btn-primary custom-button">
                                {loading ? (
                                    <span className='spinner-border spinner-border-sm' role='status' aria-hidden="true"></span>
                                ) : (
                                    'Submit'
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            {error && <div className="alert alert-danger mt-3">{error}</div>}
            {prompt && <div className="alert alert-secondary mt-3">{prompt}</div>}
            {result && <div className="alert alert-success mt-3">{result}</div>}
            {responseok && (<div className='row mt-3'>
                {books.map((book, index) => (
                    <div key={index} className='col-md-4 mb-4 d-flex'>
                        <div className="card flex-fill">
                        <div className="row no-gutters">
                                <div className="col-md-4">
                                    <img src={book.image} className="card-img" alt="Book cover" />
                                </div>
                                <div className="col-md-8">
                                    <div className="card-body">
                                            <h5 className='card-title'>{book.title}</h5>
                                            <p className='card-text'>{book.text}</p>
                                            <p className='card-text'>Author(s): {book.authors}</p>
                                            <p className='card-text'>Publisher: {book.publisher}</p>
                                            <a href={book.infoLink} className='btn btn-primary'>Buy Now</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>)}
            {responseok && (
                <pre className="alert alert-info mt-3">
                    <code>{jresult}</code>
                </pre>
            )}
        </div>
    );
}

export default Books;
