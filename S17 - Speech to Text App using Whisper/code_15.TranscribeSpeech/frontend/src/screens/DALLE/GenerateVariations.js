import React, { useState, useRef, useEffect } from 'react';
import '../style/style.css';
import DisplayImages from './components/DisplayImages';
import axios from 'axios';

function GenerateVariations() {
    const [jresult, setJresult] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [imageUrls, setImageUrls] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagesGenerated, setImagesGenerated] = useState(false);
    // Create a reference to the canvas element using useRef hook
    const canvasRef = useRef(null);

    const generateVariations = async (e) => {
        e.preventDefault();

        setLoading(true);



        try {
            // Send a POST request to the backend API to apply the mask and edit the image
            const response = await axios.post('/api/imagevariations', {
                imageURL: selectedImage,
            });
            if (response.status === 200) {
                if (response.data.data && response.data.data.length > 0) {
                    const urls = response.data.data.map(item => item.url);
                    setImageUrls(urls);
                }
                setJresult(JSON.stringify(response.data, null, 2));
                setError('');
            } else {
                throw new Error('An error occurred');
            }
        } catch (error) {
            console.log(error);
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
    }, [selectedImage]);


    return (
        <div>
            <div className="container mb-3 mt-3">
                <form className="form-horizontal">
                    <input
                        type='file'
                        accept='image/*'
                        onChange={handleImageUpload}
                    />
                    {imagesGenerated && (
                        <div className="alert alert-success mt-3">Images Generated successfully!</div>
                    )}
                    <div className="form-group row">
                        <div className="col-sm-2 mt-2">
                            <button
                                className="btn btn-primary custom-button"
                                onClick={generateVariations}
                                disabled={loading || !selectedImage}
                            >{loading ? ('Generating Variations ...') : ('Generate Variations')}</button>
                        </div>

                    </div>
                </form>
                {error && <div className="alert alert-danger mt-3">{error}</div>}
            </div>
            {selectedImage && (
                <div style={{ position: 'relative' }}>
                    <canvas
                        ref={canvasRef}
                    />
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

export default GenerateVariations;
