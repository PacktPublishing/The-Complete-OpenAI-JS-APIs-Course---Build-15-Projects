import React, { useState } from 'react';
import './style/style.css'

const DisplayImages = ({ imageUrls }) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);
    const [imageName, setImageName] = useState('');
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState('');

    const handleSelectImage = index => {
        if (selectedImageIndex === index) {
            setSelectedImageIndex(null);
        } else {
            setSelectedImageIndex(index);
        }
    }

    const handleSaveImage = async (event) => {
        event.preventDefault();
        setSaveSuccess(false);
        setSaveError('');
        setLoading(true);
        const fileName = `${inputValue}.png`;

        try {
            const imgURL = imageUrls[selectedImageIndex];
            const response = await fetch('/api/saveimage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fileName, imgURL }),
            });
            if (response.ok) {
                setSaveSuccess(true);
                setSaveError('');
                setTimeout(() => {setSaveSuccess(false)}, 3000);// hide success message after 3 seconds
            } else {
                throw new Error('An error occurred');
            }
        } catch (error) {
            console.log(error);
            setSaveSuccess(false);
            setSaveError('An error occurred while saving the image.');
            setTimeout(() => {setSaveError('false')}, 3000);// hide error message after 3 seconds
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            {saveSuccess && <div className="alert alert-success">Image saved successfully!</div>}
            {saveError && <div className="alert alert-danger">{saveError}</div>}
            {selectedImageIndex !== null && (
                <form className="form-horizontal" onSubmit={handleSaveImage}>
                    <div className="form-group row">
                        <div className="col-sm-10 mt-2">
                            <div className="form-floating input-group mb-3">
                                <input
                                    className="form-control custom-input"
                                    id="floatingInput"
                                    placeholder="Enter a value"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                />

                                <label htmlFor="floatingInput">Input</label>
                                <span className='input-group-text' id='image-extension'>.png</span>
                            </div>
                        </div>
                        <div className="col-sm-2 mt-2">
                            <button type="submit" className="btn btn-primary custom-button">{loading ? (<span className='spinner-border spinner-border-sm' role='status' aria-hidden="true"></span>) : ('Submit')}</button>
                        </div>
                    </div>
                </form>
            )}
            <div className="row">
                {imageUrls.map((imageUrl, index) =>
                    <div
                        key={index}
                        className={`col-md-4 image-container ${selectedImageIndex === index ? 'selected' : ''}`}
                        onClick={() => handleSelectImage(index)}
                    >
                        <img src={imageUrl} alt={`Result ${index + 1}`} className='img-fluid' />

                    </div>
                )}
            </div>
        </>
    );
};

export default DisplayImages;
