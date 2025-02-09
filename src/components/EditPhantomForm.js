import React, { useState, useEffect } from 'react';
import './EditPhantomForm.css';
import ChatPhantomLogo from '../assets/ChapPhantom Logo No Background.png';
import PhantomIcon from '../assets/PhantomIcon2.png';
import InternetIcon from '../assets/Internet.png';
import EditIcon from '../assets/EditIcon.png';

const EditPhantomForm = ({ phantom, onClose, onSave, onDelete, onReCrawl }) => {
  const [formData, setFormData] = useState({
    phantomName: phantom.phantom_name || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setHasChanges(formData.phantomName.trim() !== phantom.phantom_name);
  }, [formData.phantomName, phantom.phantom_name]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.phantomName.trim() || !hasChanges) return;

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
    setIsSubmitting(true);
    try {
      await onDelete(phantom);
      onClose();
    } catch (error) {
      console.error('Error deleting phantom:', error);
      setIsSubmitting(false);
    }
  };

  const renderDeleteConfirmation = () => (
    <div className='delete-confirmation'>
      <h2>Delete {phantom.phantom_name}?</h2>
      <div className='confirmation-content'>
        <p>👻 Your phantom will vanish into the ethereal realm...</p>
        <ul>
          <li>All chat history will be permanently deleted</li>
          <li>Website knowledge will be forgotten</li>
          <li>
            You'll need to create a new phantom to chat about this website again
          </li>
        </ul>
        <p className='confirmation-warning'>This action cannot be undone!</p>
      </div>
      <div className='confirmation-actions'>
        <button
          type='button'
          className='cancel-delete-button'
          onClick={() => setShowDeleteConfirmation(false)}
          disabled={isSubmitting}
        >
          Keep Phantom
        </button>
        <button
          type='button'
          className='confirm-delete-button'
          onClick={handleDelete}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Vanishing...' : 'Yes, Delete Phantom'}
        </button>
      </div>
    </div>
  );

  const renderEditForm = () => (
    <>
      <h2>Edit Phantom</h2>
      <div className='phantom-profile-container'>
        <div className='phantom-profile'>
          <button className='edit-phantom-pic'>
            <img className='edit-icon' src={EditIcon} alt='Edit' />
          </button>
          <div className='phantom-profile-pic'>
            <img src={ChatPhantomLogo} alt='Phantom Profile' />
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className='form-group'>
          <label htmlFor='phantomName'>
            <div className='label-content'>
              <img src={PhantomIcon} alt='' className='field-icon' />
              <span>Phantom Name</span>
            </div>
          </label>
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
          <label htmlFor='websiteUrl'>
            <div className='label-content'>
              <img src={InternetIcon} alt='' className='field-icon' />
              <span>Website URL</span>
            </div>
          </label>
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
              disabled={
                isSubmitting || !formData.phantomName.trim() || !hasChanges
              }
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
            onClick={() => setShowDeleteConfirmation(true)}
          >
            Delete Phantom
          </button>
        </div>
      </form>
    </>
  );

  return (
    <div className='modal-overlay'>
      <div className='edit-phantom-form'>
        {showDeleteConfirmation ? renderDeleteConfirmation() : renderEditForm()}
        <button className='close-button' onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
};

export default EditPhantomForm;
