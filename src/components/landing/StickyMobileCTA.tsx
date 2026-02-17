import { Phone, MessageCircle, FileText } from "lucide-react";

const StickyMobileCTA = () => {
  const whatsappNumber = "916381615829";
  const whatsappMessage = encodeURIComponent("Hi! I'm interested in Policy Tracker.in. Can you help me?");

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg py-2 px-4 sm:hidden">
      <div className="flex items-center justify-around gap-2 max-w-md mx-auto">
        <a
          href="tel:+916381615829"
          className="flex flex-col items-center gap-1 text-xs font-medium text-gray-700 hover:text-teal-600 transition-colors flex-1"
          aria-label="Call us"
        >
          <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center">
            <Phone className="h-5 w-5 text-teal-600" />
          </div>
          <span>Call</span>
        </a>
        <a
          href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 text-xs font-medium text-gray-700 hover:text-green-600 transition-colors flex-1"
          aria-label="Chat on WhatsApp"
        >
          <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-green-600" />
          </div>
          <span>WhatsApp</span>
        </a>
        <a
          href="/enquiry"
          className="flex flex-col items-center gap-1 text-xs font-medium text-gray-700 hover:text-cyan-600 transition-colors flex-1"
          aria-label="Send enquiry"
        >
          <div className="w-10 h-10 bg-cyan-50 rounded-full flex items-center justify-center">
            <FileText className="h-5 w-5 text-cyan-600" />
          </div>
          <span>Enquiry</span>
        </a>
      </div>
    </div>
  );
};

export default StickyMobileCTA;
