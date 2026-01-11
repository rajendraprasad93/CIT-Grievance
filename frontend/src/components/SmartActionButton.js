import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, X, MessageSquarePlus, AlertTriangle, 
  HelpCircle, Megaphone, PartyPopper, Sparkles 
} from 'lucide-react';

function SmartActionButton({ onPostMoment }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    {
      id: 'post',
      icon: MessageSquarePlus,
      label: 'Post a moment',
      description: 'Share with campus',
      color: 'bg-cit-gold',
      textColor: 'text-cit-navy',
      onClick: () => {
        setIsOpen(false);
        onPostMoment?.();
      }
    },
    {
      id: 'issue',
      icon: AlertTriangle,
      label: 'Report an issue',
      description: 'Campus problems',
      color: 'bg-hot-pink',
      textColor: 'text-white',
      onClick: () => {
        setIsOpen(false);
        navigate('/report-issue');
      }
    },
    {
      id: 'help',
      icon: HelpCircle,
      label: 'Ask for help',
      description: 'Study & academic',
      color: 'bg-electric-blue',
      textColor: 'text-cit-navy',
      onClick: () => {
        setIsOpen(false);
        onPostMoment?.('help');
      }
    },
    {
      id: 'opportunity',
      icon: Sparkles,
      label: 'Share opportunity',
      description: 'Jobs & internships',
      color: 'bg-pulse-green',
      textColor: 'text-cit-navy',
      onClick: () => {
        setIsOpen(false);
        onPostMoment?.('opportunity');
      }
    },
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Action Menu */}
      <div className={`fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 transition-all duration-300 ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        <div className="bg-white rounded-2xl shadow-2xl p-4 mb-4 w-72 border border-gray-100">
          <div className="text-center mb-4">
            <h3 className="font-heading font-bold text-cit-navy">What do you want to do?</h3>
            <p className="text-xs text-gray-500">Choose an action</p>
          </div>
          
          <div className="space-y-2">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={action.onClick}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-cit-light transition-all group text-left"
              >
                <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <action.icon size={20} className={action.textColor} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-cit-navy group-hover:text-cit-gold transition-colors">
                    {action.label}
                  </p>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
          isOpen 
            ? 'bg-gray-800 rotate-45 scale-90' 
            : 'bg-gradient-to-br from-cit-gold to-cit-gold-dark hover:shadow-glow-gold hover:scale-110'
        }`}
        aria-label={isOpen ? 'Close menu' : 'Open action menu'}
      >
        {isOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <Plus size={24} className="text-cit-navy" strokeWidth={2.5} />
        )}
      </button>
    </>
  );
}

export default SmartActionButton;
