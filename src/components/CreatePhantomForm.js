import React, { useState } from 'react';
import './CreatePhantomForm.css';
import PhantomIcon from '../assets/PhantomIcon2.png';
import InternetIcon from '../assets/Internet.png';

const CreatePhantomForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    phantomName: '',
    websiteUrl: '',
  });
  const [formErrors, setFormErrors] = useState({
    phantomName: '',
    websiteUrl: '',
  });

  // Validate URL function
  const isValidUrl = (url) => {
    try {
      // Add https:// prefix if the URL doesn't start with http:// or https://
      const urlToValidate = /^https?:\/\//i.test(url) ? url : `https://${url}`;
      new URL(urlToValidate);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {
      phantomName: '',
      websiteUrl: '',
    };
    let isValid = true;

    if (!formData.phantomName.trim()) {
      errors.phantomName = 'Phantom name is required';
      isValid = false;
    }

    if (!formData.websiteUrl.trim()) {
      errors.websiteUrl = 'Website URL is required';
      isValid = false;
    } else if (!isValidUrl(formData.websiteUrl)) {
      errors.websiteUrl = 'Please enter a valid URL';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Ensure the URL has https:// prefix before submitting
    const websiteUrl = /^https?:\/\//i.test(formData.websiteUrl)
      ? formData.websiteUrl
      : `https://${formData.websiteUrl}`;

    onSubmit({
      ...formData,
      websiteUrl,
    });
  };

  return (
    <div className='create-phantom-form'>
      <h2>Create a New Phantom</h2>
      <form onSubmit={handleSubmit}>
        <div className='form-group'>
          <label htmlFor='phantomName'>
            <div className='label-content'>
              <img src={PhantomIcon} alt='' className='field-icon' />
              <span>Phantom Name</span>
            </div>
          </label>
          <div className='input-wrapper'>
            <input
              type='text'
              id='phantomName'
              name='phantomName'
              value={formData.phantomName}
              onChange={handleInputChange}
              placeholder='Enter phantom name'
            />
            {formErrors.phantomName && (
              <span className='error-message'>{formErrors.phantomName}</span>
            )}
          </div>
        </div>
        <div className='form-group'>
          <label htmlFor='websiteUrl'>
            <div className='label-content'>
              <img src={InternetIcon} alt='' className='field-icon' />
              <span>Website URL</span>
            </div>
          </label>
          <div className='input-wrapper'>
            <input
              type='url'
              id='websiteUrl'
              name='websiteUrl'
              value={formData.websiteUrl}
              onChange={handleInputChange}
              placeholder='https://example.com'
            />
            {formErrors.websiteUrl && (
              <span className='error-message'>{formErrors.websiteUrl}</span>
            )}
          </div>
        </div>
        <div className='form-actions'>
          <button type='button' className='cancel-button' onClick={onCancel}>
            Cancel
          </button>
          <button
            type='submit'
            className='submit-button'
            disabled={
              !formData.phantomName.trim() || !isValidUrl(formData.websiteUrl)
            }
          >
            Create Phantom
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePhantomForm;
