import React, { useState } from 'react';
import './EditPhantomForm.css';
import ChatPhantomLogo from '../assets/ChapPhantom Logo No Background.png';

const EditPhantomForm = ({ phantom, onClose, onSave, onDelete, onReCrawl }) => {
  const [formData, setFormData] = useState({
    phantomName: phantom.phantom_name || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.phantomName.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        ...phantom,
        phantom_name: formData.phantomName,
      });
      onClose();
    } catch (error) {
      console.error('Error updating phantom:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete this phantom? This action cannot be undone.'
      )
    ) {
      try {
        await onDelete(phantom);
        onClose();
      } catch (error) {
        console.error('Error deleting phantom:', error);
      }
    }
  };

  return (
    <div className='modal-overlay'>
      <div className='edit-phantom-form'>
        <h2>Edit Phantom</h2>
        <div className='phantom-profile'>
          <img
            src={ChatPhantomLogo}
            alt='Phantom Profile'
            className='phantom-profile-pic'
          />
          <button className='change-profile-pic'>Change Profile Picture</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className='form-group'>
            <label htmlFor='phantomName'>Phantom Name</label>
            <input
              type='text'
              id='phantomName'
              name='phantomName'
              value={formData.phantomName}
              onChange={handleInputChange}
              placeholder='Enter phantom name'
              disabled={isSubmitting}
            />
          </div>
          <div className='form-group'>
            <label htmlFor='websiteUrl'>Website URL</label>
            <input
              type='url'
              id='websiteUrl'
              value={phantom.website_url}
              disabled
              className='disabled-input'
            />
          </div>
          <div className='form-actions'>
            <div className='action-row'>
              <button
                type='submit'
                className='save-button'
                disabled={isSubmitting || !formData.phantomName.trim()}
              >
                Save Changes
              </button>
              <button
                type='button'
                className='recrawl-button'
                onClick={onReCrawl}
              >
                Re-Crawl
              </button>
            </div>
            <button
              type='button'
              className='delete-button'
              onClick={handleDelete}
            >
              Delete Phantom
            </button>
          </div>
        </form>
        <button className='close-button' onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
};

export default EditPhantomForm;
