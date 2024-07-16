import React, { useState, useRef, useEffect } from 'react';
import '../style/style.css';
import DisplayImages from './components/DisplayImages';
import axios from 'axios';

function EditImage() {
    const [inputValue, setInputValue] = useState('');
    const [result, setResult] = useState('');
    const [prompt, setPrompt] = useState('');
    const [jresult, setJresult] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [imageUrls, setImageUrls] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [maskPoints, setMaskPoints] = useState([]);
    const [imagesGenerated, setImagesGenerated] = useState(false);
    // Create a reference to the canvas element using useRef hook
    const canvasRef = useRef(null);

    const editImage = async (e) => {
        e.preventDefault();

        if (!inputValue) {
            setError('Please enter a prompt!');
            setPrompt('');
            setResult('');
            setJresult('');
            return;
        }
        setLoading(true);

        const scaledMaskPoints = maskPoints.map(point => ({
            x: point.x * 2 , 
            y: point.y * 2
        }));


        try {
            // Send a POST request to the backend API to apply the mask and edit the image
            const response = await axios.post('/api/editimage', {
                imageURL: selectedImage,
                points: scaledMaskPoints,
                prompt: inputValue
            });
            if (response.status === 200) {
                setPrompt(inputValue);
                if (response.data.data && response.data.data.length > 0) {
                    const urls = response.data.data.map(item => item.url);
                    setImageUrls(urls);
                }
                setJresult(JSON.stringify(response.data, null, 2));
                setInputValue('');
                setError('');
            } else {
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

    // Function to handle image upload from input file
    const handleImageUpload = (event) => {
        // Get the selected file from the event
        const file = event.target.files[0];

        // Create a new FileReader object
        const reader = new FileReader();

        // Set up a function to be executed when the FileReader finishes loading the file
        reader.onload = (e) => {
            // e.target.result contains the base64-encoded data URL of the uploaded image
            // Set the selected image using the data URL
            setSelectedImage(e.target.result);

            // Set the state variable 'imagesGenerated' to false
            setImagesGenerated(false);

        }



        // Read the file as a data URL (base64-encoded representation)
        reader.readAsDataURL(file);
    }

    const handleReset = () => {
        setMaskPoints([]);
    }

    // Function to handle clicks on the canvas element and update maskPoints state
    const handleCanvasClick = (event) => {

        // Get the reference to the canvas element from the ref object
        const canvas = canvasRef.current;

        // Get the position and size of the canvas relative to the viewport
        const rect = canvas.getBoundingClientRect();

        // Calculate the x and y coordinates of the click relative to the canvas
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;


        // Update the state variable 'maskPoints' with the new point
        setMaskPoints(prevPoints => [...prevPoints, { x, y }]);

    }

    // Create a reference to the canvas element using useRef hook


    // When selectedImage changes, set up the canvas background with the image
    useEffect(() => {

        if (selectedImage) {
            const image = new Image();
            image.src = selectedImage;
            image.onload = () => {
                const canvas = canvasRef.current;
                canvas.width = image.width / 2;
                canvas.height = image.height / 2;
                canvas.style.background = `url(${selectedImage})`;
                canvas.style.backgroundSize = 'cover';

            }
        }
        handleReset();
    }, [selectedImage]);

    // useEffect hook to draw the mask on the canvas whenever maskPoints changes
    useEffect(() => {
        if (canvasRef.current) {
            //access the canvas element
            const canvas = canvasRef.current;
            
            //create context to start drawing
            const context = canvas.getContext('2d');

            // Clear the canvas before drawing
            context.clearRect(0,0,canvas.width,canvas.height);
            
            // Begin drawing the mask shape
            context.beginPath();
            
            //For each point draw a line starting from the previous point
            maskPoints.forEach(point => {
                context.lineTo(point.x, point.y);
            })

            //drawing finished
            context.closePath();
            
            //Style the mask shape
            context.strokeStyle = '#000';
            context.lineWidth = 1;

            //render the path using the stroke method
            context.stroke();

            // Fill the mask shape with a grey color
            context.fillStyle = 'grey';
            context.fill();

        }
    }, [maskPoints]);

    return (
        <div>
            <div className="container mb-3">
                <form className="form-horizontal">
                    <div className="form-group row">
                        <div className="col-sm-8 mt-2">
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
                            <button
                                className="btn btn-primary custom-button"
                                onClick={editImage}
                                disabled={loading || !selectedImage || maskPoints.length < 3}
                            >{loading ? ('Editing Image ...') : ('Edit Image')}</button>
                        </div>
                        <div className="col-sm-2 mt-2">
                            <button
                                className="btn btn-secondary custom-button"
                                onClick={handleReset}
                            >Reset</button>
                        </div>
                        <div className="col-sm-2 mt-2">
                            <input
                                type='file'
                                accept='image/*'
                                onChange={handleImageUpload}
                            />
                        </div>
                    </div>
                    {imagesGenerated && (
                        <div className="alert alert-success mt-3">Images Generated successfully!</div>
                    )}
                </form>
                {error && <div className="alert alert-danger mt-3">{error}</div>}
                {prompt && <div className="alert alert-secondary mt-3">{prompt}</div>}
            </div>
            {selectedImage && (
                <div style={{ position: 'relative' }}>
                    <canvas
                        ref={canvasRef}
                        onClick={handleCanvasClick}
                        style={{ cursor: 'crosshair' }}
                    />
                    {maskPoints.map((point, index) => (
                        <div
                            key={index}
                            style={{
                                position: 'absolute',
                                top: point.y - 2,
                                left: point.x -2,
                                width: '4px',
                                height: '4px',
                                borderRadius: '50%',
                                backgroundColor: '#000'
                            }}
                        >


                        </div>
                    ))}
                </div>
            )}
            <DisplayImages imageUrls={imageUrls} />
            {jresult && (
                <pre className="alert alert-info mt-3">
                    <code>{jresult}</code>
                </pre>
            )}
        </div>
    );
}

export default EditImage;
