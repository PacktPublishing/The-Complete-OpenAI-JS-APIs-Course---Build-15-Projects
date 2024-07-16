import React, { useState, useEffect } from 'react';
import './style/style.css';
import axios from 'axios';

function Chatbot() {
    const [inputMessage, setInputMessage] = useState('');
    const [result, setResult] = useState('');
    const [prompt, setPrompt] = useState('');
    const [jresult, setJresult] = useState('');
    const [responseok, setResponseok] = useState('');
    const [error, setError] = useState('');
    const [selectedOption, setSelectedOption] = useState('');
    const [messages, setMessages] = useState([
        { role: "system", content: "You are an assistant" }
    ]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        //Send a request to the server only if there is  a user message
        if (inputMessage.trim() !== "") {
            try {
                //Add the user message to the messages array
                const updatedMessages = [...messages, { role: "user", content: inputMessage }]
                setMessages(updatedMessages);
                const response = await axios.post('/api/chatbot', { messages: updatedMessages });
                const serverResponse = response.data;

                //Add the server response to the messages array
                const updatedMessages2 = [...updatedMessages, { role: "assistant", content: serverResponse.data.choices[0].message.content }]
                setMessages(updatedMessages2);
                console.log(updatedMessages2);

                //clear input
                setInputMessage('');
                //Update jresult with the udpates messages array
                setJresult(JSON.stringify(updatedMessages2, null, 2));
            } catch (error) {
                console.log('An error occured', error);
                setError('An error occured');
            }
        }

    };

    const handleOptionSelect = (option) => {
        setMessages([
            { role: "system", content: `I want you to act as ${option}` }
        ]);
        setSelectedOption(option);
    }

    //scroll to the bottom of the chatContainer whenever the messages array changes
    useEffect(() => {
        const chatContainer = document.getElementById('chatContainer');
        const scrollOptions = {
            top: chatContainer.scrollHeight,
            behavior: 'smooth'
        }
        chatContainer.scrollTo(scrollOptions);
    }, [messages]);

    const personalities = [
        {
            title: "Einstein",
            description: "German physicist",
        },
        {
            title: "Christopher Columbus",
            description: "Italian explorer"
        },
        {
            title: "Steve Jobs",
            description: "Entrepreneur who led digital revolution"
        },
        {
            title: "Thomas Edison",
            description: "Inventor and businessman"
        },
        {
            title: "Bill Gates",
            description: "Founder of Microsoft"
        },
        {
            title: "Louis Pasteur",
            description: "French chemist and Biologist"
        },
        {
            title: "Muhammed Ali",
            description: "American boxer and human rights activist"
        },
        {
            title: "Tim Berners Lee",
            description: "Inventor of World Wide Web"
        },
        {
            title: "Michael Faraday",
            description: "English scientist"
        },
        {
            title: "Mean assistant",
            description: "You'd better not chat with me"
        },
    ];

    return (
        <div>
            <div className='d-flex flex-column chat-page'>
                <div id='personalities' className='text-center'>
                    <h3>{selectedOption ? "You are chatting with:" : "Please select a character:"}</h3>
                    <div className='d-flex justify-content-center'>
                        {personalities.map((personality, index) => (
                            <div
                                key={index}
                                className='text-center'
                            >
                                <img
                                    src={`images/personalities/${index+1}.png`}
                                    alt={personality.title}
                                    className={`img-fluid rounded-circle ${selectedOption === personality.title ? 'selected' : '' }`}
                                    onClick={() => handleOptionSelect(personality.title)}
                                />
                                <h6>{personality.title}</h6>
                                <p>{personality.description}</p>


                            </div>
                        ))}
                    </div>
                </div>

                <div id='chatContainer' className='flex-fill overflow-auto'>
                    {messages.map((message, index) => message.role !== "system" && (
                        <div
                            key={index}
                            className={`${message.role === 'user' ? 'alert alert-info' : 'alert alert-success'}`}
                        >
                            {message.content}
                        </div>
                    ))}
                    {error && <div className="alert alert-danger mt-3">{error}</div>}
                    {prompt && <div className="alert alert-secondary mt-3">{prompt}</div>}
                    {result && <div className="alert alert-success mt-3">{result}</div>}
                </div>

                <form className="form-horizontal mb-3 container-fluid" onSubmit={handleSubmit}>
                    <div className="form-group row">
                        <div className="col-sm-11 mt-2">
                            <div className="form-floating">
                                <input
                                    className="form-control custom-input"
                                    id="floatingInput"
                                    placeholder="Enter a value"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                />

                                <label htmlFor="floatingInput">Input</label>
                            </div>
                        </div>
                        <div className="col-sm-1 mt-2">
                            <button type="submit" className="btn btn-primary custom-button">Submit</button>
                        </div>
                    </div>
                </form>
            </div>
            {jresult && (
                <pre className="alert alert-info mt-3">
                    <code>{jresult}</code>
                </pre>
            )}
        </div>
    );
}

export default Chatbot;
