import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileText, ExternalLink, X } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PolicyDocumentPreviewDialogProps {
  documentUrl: string | null;
  policyNumber: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PolicyDocumentPreviewDialog = ({ 
  documentUrl, 
  policyNumber, 
  open, 
  onOpenChange 
}: PolicyDocumentPreviewDialogProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && documentUrl) {
      loadDocument();
    }
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [open, documentUrl]);

  const loadDocument = async () => {
    if (!documentUrl) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('policy-documents')
        .download(documentUrl);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      setPreviewUrl(url);
    } catch (error: any) {
      console.error('Error loading document:', error);
      toast({
        title: "Error",
        description: "Failed to load document preview.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!documentUrl) return;

    try {
      const { data, error } = await supabase.storage
        .from('policy-documents')
        .download(documentUrl);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${policyNumber}_document.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: "Policy document is being downloaded.",
      });
    } catch (error: any) {
      console.error('Error downloading document:', error);
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download document.",
        variant: "destructive",
      });
    }
  };

  const handleOpenInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-4 py-3 border-b flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="flex items-center gap-2 text-base truncate">
              <FileText className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="truncate">{policyNumber}</span>
            </DialogTitle>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInNewTab}
                disabled={!previewUrl}
                className="h-8"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Open</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="h-8"
              >
                <Download className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Download</span>
              </Button>
              <DialogClose asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden bg-muted">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Loading document...</p>
              </div>
            </div>
          ) : previewUrl ? (
            <iframe
              src={`${previewUrl}#toolbar=1`}
              className="w-full h-full border-0"
              title="Policy Document Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No document available</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PolicyDocumentPreviewDialog;
