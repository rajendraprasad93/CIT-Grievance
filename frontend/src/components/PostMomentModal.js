import { useState } from 'react';
import { X, Image as ImageIcon, Link as LinkIcon, MapPin } from 'lucide-react';
import UniversalImageUpload from './UniversalImageUpload';

function PostMomentModal({ isOpen, onClose, onSubmit, user }) {
  const [formData, setFormData] = useState({
    moment_type: 'help',
    title: '',
    content: '',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [uploadData, setUploadData] = useState(null);

  if (!isOpen) return null;

  const handleAnalysisComplete = (data) => {
    setUploadData(data);
    
    // Auto-fill form if AI detected content
    if (data.analysisResult?.auto_fill_data) {
      const autoFill = data.analysisResult.auto_fill_data;
      
      // Ensure tags is always an array
      let parsedTags = formData.tags;
      if (autoFill.tags) {
        if (Array.isArray(autoFill.tags)) {
          parsedTags = autoFill.tags;
        } else if (typeof autoFill.tags === 'string') {
          // Handle comma-separated string from AI
          parsedTags = autoFill.tags.split(',').map(t => t.trim()).filter(Boolean);
        }
      }
      
      setFormData({
        moment_type: autoFill.moment_type || formData.moment_type,
        title: autoFill.title || formData.title,
        content: autoFill.content || formData.content,
        tags: parsedTags,
      });
    }
  };

  const handleSubmit = () => {
    if (formData.title && formData.content) {
      onSubmit({
        ...formData,
        image: uploadData?.file
      });
      // Reset form
      setFormData({ moment_type: 'help', title: '', content: '', tags: [] });
      setTagInput('');
      setUploadData(null);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const getCategoryStyle = (type) => {
    const styles = {
      help: { bg: 'bg-cit-navy', hover: 'hover:bg-cit-navy/90', emoji: '📚', label: 'Help & Study' },
      campus_life: { bg: 'bg-cit-gold', hover: 'hover:bg-cit-gold/90', emoji: '🎓', label: 'Campus Life' },
      opportunity: { bg: 'bg-cit-navy', hover: 'hover:bg-cit-navy/90', emoji: '💼', label: 'Opportunity' },
      issue_observation: { bg: 'bg-amber-600', hover: 'hover:bg-amber-700', emoji: '⚠️', label: 'Issue' },
    };
    return styles[type] || styles.help;
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
        data-testid="post-moment-modal"
      >
        {/* Header */}
        <div className="sticky top-0 bg-cit-navy border-b border-cit-navy px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-xl font-heading font-bold text-white">Create a Moment</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-md hover:bg-white/10 transition-colors flex items-center justify-center text-white"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* User Info */}
        <div className="px-6 pt-4 pb-2 flex items-center gap-3">
          {user?.picture ? (
            <img
              src={user.picture}
              alt={user.name}
              className="w-12 h-12 rounded-md ring-2 ring-cit-navy/20 object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-md bg-cit-navy text-white flex items-center justify-center font-bold text-lg">
              {user?.name?.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-semibold text-cit-navy">{user?.name}</p>
            <p className="text-sm text-gray-600">
              {user?.department} • Year {user?.year}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 pb-6 space-y-4">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-cit-navy">Category</label>
            <div className="grid grid-cols-2 gap-3">
              {['help', 'campus_life', 'opportunity', 'issue_observation'].map((type) => {
                const style = getCategoryStyle(type);
                return (
                  <button
                    key={type}
                    onClick={() => setFormData({ ...formData, moment_type: type })}
                    className={`p-4 rounded-md border-2 transition-all ${
                      formData.moment_type === type
                        ? `${style.bg} text-white border-transparent shadow-md`
                        : 'bg-white border-gray-200 hover:border-cit-gold'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{style.emoji}</span>
                      <span className="font-semibold text-sm">{style.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-cit-navy">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full h-12 px-4 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-cit-gold focus:border-cit-gold transition-all"
              placeholder="Give your moment a catchy title..."
              data-testid="moment-title-input"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-cit-navy">What's on your mind?</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full min-h-[150px] px-4 py-3 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-cit-gold focus:border-cit-gold transition-all resize-none"
              placeholder="Share your thoughts, ask for help, or report an issue..."
              data-testid="moment-content-input"
            />
            <p className="text-xs text-gray-500 mt-2">
              {formData.content.length} characters
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-cit-navy">Tags (optional)</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 h-10 px-4 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-cit-gold focus:border-cit-gold transition-all text-sm"
                placeholder="Add tags (press Enter)"
              />
              <button
                onClick={addTag}
                className="px-4 py-2 rounded-md bg-cit-gold text-cit-navy hover:bg-cit-gold/90 font-medium text-sm transition-colors"
              >
                Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-cit-gold/20 text-cit-navy text-sm font-medium"
                  >
                    #{tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Media Attachments */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-cit-navy">Add Image (Optional)</label>
            <UniversalImageUpload
              contextHint="moment"
              onAnalysisComplete={handleAnalysisComplete}
              onError={(error) => console.error('Upload error:', error)}
            />
            {uploadData?.analysisResult && (
              <p className="text-xs text-cit-gold mt-2">
                ✨ AI detected content and auto-filled the form!
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSubmit}
              disabled={!formData.title || !formData.content}
              className="flex-1 h-12 px-6 rounded-md bg-cit-navy text-white hover:bg-cit-navy/90 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              data-testid="submit-moment-btn"
            >
              Post Moment
            </button>
            <button
              onClick={onClose}
              className="px-6 h-12 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold transition-all"
              data-testid="cancel-moment-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostMomentModal;
