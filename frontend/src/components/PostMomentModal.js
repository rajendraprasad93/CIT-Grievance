import { useState, useEffect } from 'react';
import { X, Sparkles, Send, Image as ImageIcon } from 'lucide-react';
import UniversalImageUpload from './UniversalImageUpload';

function PostMomentModal({ isOpen, onClose, onSubmit, user, defaultType = null }) {
  const [formData, setFormData] = useState({
    moment_type: defaultType || 'help',
    title: '',
    content: '',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [uploadData, setUploadData] = useState(null);

  useEffect(() => {
    if (defaultType) {
      setFormData(prev => ({ ...prev, moment_type: defaultType }));
    }
  }, [defaultType]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({ moment_type: defaultType || 'help', title: '', content: '', tags: [] });
      setTagInput('');
      setUploadData(null);
    }
  }, [isOpen, defaultType]);

  if (!isOpen) return null;

  const handleAnalysisComplete = (data) => {
    setUploadData(data);
    const autoFillData = data.analysisResult?.auto_fill_data;
    const detectedContext = data.analysisResult?.detected_context;
    
    if (autoFillData && Object.keys(autoFillData).length > 0) {
      let parsedTags = [];
      const tagsSource = autoFillData.tags;
      
      if (tagsSource) {
        if (Array.isArray(tagsSource)) {
          parsedTags = tagsSource.map(t => String(t).trim()).filter(Boolean);
        } else if (typeof tagsSource === 'string') {
          parsedTags = tagsSource.split(',').map(t => t.trim()).filter(Boolean);
        }
      }
      
      let momentType = 'help';
      if (detectedContext === 'civic_issue') momentType = 'issue_observation';
      else if (detectedContext === 'opportunity') momentType = 'opportunity';
      else if (detectedContext === 'social_moment') momentType = autoFillData.moment_type || 'campus_life';
      
      setFormData(prev => ({
        moment_type: momentType,
        title: autoFillData.title || prev.title,
        content: autoFillData.content || autoFillData.description || prev.content,
        tags: parsedTags.length > 0 ? parsedTags : prev.tags,
      }));
    }
  };

  const handleSubmit = () => {
    if (formData.title && formData.content) {
      onSubmit({
        ...formData,
        image: uploadData?.file
      });
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  const categories = [
    { id: 'help', icon: '📚', label: 'Study Help', color: 'bg-blue-500', lightBg: 'bg-blue-50', lightText: 'text-blue-600' },
    { id: 'campus_life', icon: '🎉', label: 'Campus Life', color: 'bg-orange-500', lightBg: 'bg-orange-50', lightText: 'text-orange-600' },
    { id: 'opportunity', icon: '💼', label: 'Opportunity', color: 'bg-emerald-500', lightBg: 'bg-emerald-50', lightText: 'text-emerald-600' },
    { id: 'issue_observation', icon: '⚠️', label: 'Report Issue', color: 'bg-rose-500', lightBg: 'bg-rose-50', lightText: 'text-rose-600' },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Create Post</h2>
              <p className="text-xs text-gray-500">Share with your campus</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* User Info */}
        <div className="px-6 pt-5 pb-3 flex items-center gap-3">
          {user?.picture ? (
            <img src={user.picture} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-lg">
              {user?.name?.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.department} • Year {user?.year}</p>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 pb-6 space-y-5">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">What type of post?</label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFormData({ ...formData, moment_type: cat.id })}
                  className={`p-4 rounded-2xl border-2 transition-all text-left ${
                    formData.moment_type === cat.id
                      ? `${cat.lightBg} border-current ${cat.lightText}`
                      : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-2xl mb-2 block">{cat.icon}</span>
                  <span className="text-sm font-semibold">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              placeholder="Give your post a title..."
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full min-h-[120px] px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
              placeholder="What's on your mind?"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags (optional)</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 h-10 px-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-sm"
                placeholder="Add tags..."
              />
              <button
                onClick={addTag}
                className="px-4 h-10 rounded-xl bg-gray-900 text-white font-medium text-sm hover:bg-gray-800 transition-all"
              >
                Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium"
                  >
                    #{tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-amber-900 transition-colors">
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Add Image (optional)</label>
            <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-4 hover:border-amber-300 transition-colors">
              <UniversalImageUpload
                contextHint="moment"
                onAnalysisComplete={handleAnalysisComplete}
                onError={(error) => console.error('Upload error:', error)}
              />
            </div>
            {uploadData?.analysisResult && (
              <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                <Sparkles size={12} />
                AI detected content and auto-filled the form!
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSubmit}
              disabled={!formData.title || !formData.content}
              className="flex-1 h-12 px-6 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Send size={18} />
              Post
            </button>
            <button
              onClick={onClose}
              className="px-6 h-12 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition-all"
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
