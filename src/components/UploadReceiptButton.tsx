import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { extractReceiptData } from "@/services/vision";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

interface UploadReceiptButtonProps {
  onSuccess?: () => void;
}

const UploadReceiptButton = ({ onSuccess }: UploadReceiptButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setIsProcessing(true);

      try {
        // Extract receipt data using OpenAI Vision
        toast.info("Scanning receipt...");
        const receiptData = await extractReceiptData(file);

        // Insert into Supabase
        const { error } = await supabase.from("transactions").insert({
          amount: receiptData.total_amount,
          merchant: receiptData.merchant,
          category: receiptData.category,
          currency: "USD",
          comment: receiptData.dark_humor_comment,
          created_at: receiptData.date,
        });

        if (error) throw error;

        toast.success(receiptData.dark_humor_comment);
        
        // Refresh dashboard
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        console.error("Error processing receipt:", error);
        toast.error(
          error instanceof Error 
            ? error.message 
            : "Failed to process receipt. Please try again."
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [onSuccess]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    multiple: false,
  });

  return (
    <div {...getRootProps()} className="w-full">
      <input {...getInputProps()} />
      <Button
        size="lg"
        disabled={isProcessing}
        className="w-full h-16 text-lg font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
      >
        <Upload className="mr-2 h-6 w-6" />
        {isProcessing 
          ? "Processing..." 
          : isDragActive 
          ? "Drop receipt here" 
          : "Upload Receipt"}
      </Button>
    </div>
  );
};

export default UploadReceiptButton;
