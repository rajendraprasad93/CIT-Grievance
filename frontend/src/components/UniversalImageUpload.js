import { useState } from 'react';
import { Upload, Loader2, CheckCircle, AlertTriangle, X } from 'lucide-react';

/**
 * UniversalImageUpload - AI-powered image upload with auto-fill
 * Analyzes image and auto-fills form based on detected context
 */
function UniversalImageUpload({ 
  contextHint,  // "issue", "moment", "opportunity"
  onAnalysisComplete,
  onError 
}) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preview, setPreview] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      if (onError) onError(new Error('Please upload a valid image file (JPG, PNG, or WebP)'));
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      if (onError) onError(new Error('Image size must be less than 10MB'));
      return;
    }

    // Show preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setUploadedFile(file);
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      // Call universal analysis API
      const formData = new FormData();
      formData.append('image', file);
      if (contextHint) {
        formData.append('context_hint', contextHint);
      }

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analyze-image-universal`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Analysis failed');
      }

      setAnalysisResult(data);

      // Pass data to parent
      if (onAnalysisComplete) {
        onAnalysisComplete({
          file,
          previewUrl,
          analysisResult: data
        });
      }

    } catch (error) {
      console.error('Analysis error:', error);
      setPreview(null);
      setUploadedFile(null);
      if (onError) onError(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRemove = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setUploadedFile(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
  };

  const getContextMessage = (context) => {
    const messages = {
      'civic_issue': '🚨 Civic Issue Detected',
      'opportunity': '💼 Opportunity Detected',
      'social_moment': '📱 Social Content Detected',
      'unknown': '❓ Content Detected'
    };
    return messages[context] || 'Analysis Complete';
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      {!preview && (
        <>
          <input
            type="file"
            id="universal-upload"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleImageSelect}
            className="hidden"
            disabled={isAnalyzing}
          />
          
          <label
            htmlFor="universal-upload"
            className={`flex flex-col items-center justify-center gap-3 px-6 py-8 border-2 border-dashed rounded-2xl transition-all cursor-pointer ${
              isAnalyzing 
                ? 'opacity-50 cursor-not-allowed border-border bg-secondary' 
                : 'hover:border-primary hover:bg-primary/5 border-border'
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground mb-1">
                Upload Image for AI Analysis
              </p>
              <p className="text-sm text-muted-foreground">
                Our AI will automatically detect and fill in the details
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                JPG, PNG or WebP • Max 10MB
              </p>
            </div>
          </label>
        </>
      )}

      {/* Preview with Analysis */}
      {preview && (
        <div className="relative">
          <div className="relative rounded-2xl overflow-hidden border-2 border-border">
            <img
              src={preview}
              alt="Upload preview"
              className="w-full max-h-96 object-contain bg-secondary/30"
            />
            
            {/* Remove Button */}
            {!isAnalyzing && (
              <button
                onClick={handleRemove}
                className="absolute top-3 right-3 w-10 h-10 rounded-full bg-destructive text-white hover:bg-destructive/90 transition-colors flex items-center justify-center shadow-lg"
              >
                <X size={20} />
              </button>
            )}

            {/* Analyzing Overlay */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center text-white p-6">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
                  <p className="text-lg font-semibold mb-2">Analyzing with AI...</p>
                  <p className="text-sm opacity-90">Detecting context and extracting data</p>
                </div>
              </div>
            )}
          </div>

          {/* Analysis Result Badge */}
          {analysisResult && !isAnalyzing && (
            <div className="mt-4 space-y-3">
              {/* Success Badge */}
              <div className="flex items-start gap-3 p-4 bg-life/10 border-2 border-life/20 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-life/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-life" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-life mb-1">
                    {getContextMessage(analysisResult.detected_context)}
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    {analysisResult.reasoning}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-life transition-all duration-500"
                        style={{ width: `${analysisResult.confidence}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-life">
                      {analysisResult.confidence}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Low Confidence Warning */}
              {analysisResult.confidence < 70 && (
                <div className="flex items-start gap-3 p-3 bg-issue/10 border-2 border-issue/20 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-issue flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-issue mb-1">
                      Low Confidence Detection
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Please review and edit the auto-filled details carefully.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UniversalImageUpload;
