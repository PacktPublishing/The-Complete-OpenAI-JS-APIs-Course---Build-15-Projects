import React, { useState } from 'react';
import './style/style.css';

function Stream() {
    const [inputValue, setInputValue] = useState('');
    const [result, setResult] = useState('');
    const [prompt, setPrompt] = useState('');
    const [jresult, setJresult] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!inputValue) {
            setError('Please enter a prompt!');
            setPrompt('');
            setResult('');
            setJresult('');
            return;
        }


        try {
            //Creates a new instance of AbortController
            //This controller will be used to cancel our request when needed
            const controller = new AbortController();
            //It will allow us to communicate and control the request cancellation
            const signal = controller.signal; //Get the siganl from the controller
            const response = await fetch('/api/chatgpt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: inputValue }),
                signal: signal, //pass the abort signal
            });
            if (response.ok) {
                //read the response incrementally
                const reader = response.body.getReader();
                let resultData = '';
                let jresultData = [];
                setPrompt(inputValue);
                setResult(resultData);
                setInputValue('');
                setError('');

                let readerDone = false;
                while (!readerDone) {
                    //The value property represents the data read from the stream.
                    //The done property indicates whether the reader has reached the end of the stream.
                    //It is set to false initially, when we reach the end of the stream it is set to true.
                    //reader.read(); //value,done {value: , done: , other parameters}
                    const { value, done } = await reader.read();

                    if(done){
                        readerDone = true;
                    }else{
                        let chunk = new TextDecoder('utf-8').decode(value);
                        chunk = chunk
                        .replaceAll('{"event": "done"}', '')
                        .replaceAll('data: [DONE]', '')
                        .replace(/\}\s*data:\s*\{/g, '}{')
                        .replaceAll('}{','},{');
                        chunk = `[${chunk}]`;
                        console.log(chunk);
                        chunk = JSON.parse(chunk);
                        console.log(chunk);

                        //Add text to result
                        let text = '';
                        for(let i = 0; i < chunk.length; i++){
                            const choices = chunk[i].choices;
                            if(choices && choices.length > 0){
                                text += choices[0].text;
                            }
                        }
                        resultData += text;
                        setResult((prevResult) => (prevResult + text).replaceAll('\n\n','\n'));
                        
                        //display the chunk array
                        jresultData.push(chunk);
                        setJresult(JSON.stringify(jresultData, null, 2));
                    }
                }
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
            {result && <div className="alert alert-success mt-3" style={{ whiteSpace: 'pre-line' }} dangerouslySetInnerHTML={{__html: result}}></div>}
            {result && (
                <pre className="alert alert-info mt-3">
                    <code>{jresult}</code>
                </pre>
            )}
        </div>
    );
}

export default Stream;