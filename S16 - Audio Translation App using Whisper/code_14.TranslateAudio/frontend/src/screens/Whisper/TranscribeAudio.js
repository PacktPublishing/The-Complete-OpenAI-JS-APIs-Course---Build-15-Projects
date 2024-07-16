import React, { useState, useRef } from 'react';
import '../style/style.css';
import axios from 'axios';

function TranscribeAudio() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [language, setLanguage] = useState('');
    const [prompt, setPrompt] = useState('');
    const [transcription, setTranscription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [jresult, setJresult] = useState('');

    const fileInputRef = useRef(null);
    const audioRef = useRef(null);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        if (audioRef.current) {
            audioRef.current.src = URL.createObjectURL(file);
        }
    };
    const resetSelectedFile = () => {
        setSelectedFile(null);
        if (audioRef.current) {
            audioRef.current.src = '';
        }
    };
    const handleTranscription = async (event) => {
        event.preventDefault();
        setError('');
        setTranscription('');
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('audio', selectedFile);
            formData.append('language', language);
            formData.append('prompt', prompt);

            //send request to server
            const response = await axios.post('/api/whisper', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200) {
                setTranscription(response.data.text);
                setJresult(response.data);
            }

        } catch (error) {
            console.error(error);
            setError('An error occurred while submitting the form.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div>
            <div className='container mb-3 mt-3'>
                {error && <div className='alert alert-danger'>{error}</div>}
            </div>
            <div className='container mb-2'>
                <form className='form-horizontal'>
                    <div className='form-group row'>
                        <label className='col-sm-2 col-form-label'>Choose audio file</label>
                        <div className='col-sm-10'>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="audio/*"
                                onChange={handleFileUpload}
                            />
                            {selectedFile && (
                                <div>
                                    <audio ref={audioRef} controls>
                                        <source src={URL.createObjectURL(selectedFile)} type={selectedFile.type} />
                                        Your browser does not support the audio element.
                                    </audio>
                                    <button onClick={resetSelectedFile}>Clear File</button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className='form-group row'>
                        <div className="col-sm-4 mt-2">
                            <div className="form-floating">
                                <input
                                    type="text"
                                    id="floatingInput"
                                    placeholder='language'
                                    className="form-control"
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                />
                                <label htmlFor="floatingInput">Audio Language</label>
                            </div>
                        </div>
                        <div className="col-sm-6 mt-2">
                            <div className="form-floating">
                                <input
                                    type="text"
                                    id="prompt"
                                    placeholder='Prompt'
                                    className="form-control"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                />
                                <label htmlFor="prompt">Prompt</label>
                            </div>
                        </div>
                        <div className="col-sm-2 mt-2">
                            <button
                                className="btn btn-primary custom-button"
                                onClick={handleTranscription}
                                disabled={!selectedFile || loading}
                            >
                                {loading ? 'Transcribing...' : 'Transcribe Audio'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            <div className='container mb-3'>
                {transcription && <div className='alert alert-success'>{transcription}</div>}
            </div>
            <div className='container'>
                {jresult && (
                    <pre className="alert alert-info">
                        <code>{JSON.stringify(jresult, null, 2)}</code>
                    </pre>
                )}
            </div>

        </div>
    );
}

export default TranscribeAudio;
