import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, X, Image, FileText, Video, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChatMessage } from '@/hooks/useChat';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MessageInputProps {
  onSend: (content: string, type?: 'text' | 'image' | 'video' | 'voice' | 'file', metadata?: Record<string, unknown>, replyToId?: string) => void;
  onTyping: () => void;
  replyTo: ChatMessage | null;
  editMessage: ChatMessage | null;
  onCancelReply: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (messageId: string, content: string) => void;
  disabled?: boolean;
}

const EMOJI_LIST = ['😀', '😂', '😍', '🥰', '😊', '🙏', '👍', '❤️', '🔥', '💯', '✨', '🎉', '👏', '💪', '🤔', '😢'];

export function MessageInput({
  onSend,
  onTyping,
  replyTo,
  editMessage,
  onCancelReply,
  onCancelEdit,
  onSaveEdit,
  disabled,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (editMessage) {
      setMessage(editMessage.content || '');
      textareaRef.current?.focus();
    }
  }, [editMessage]);

  const handleSubmit = () => {
    if (!message.trim() || disabled) return;

    if (editMessage) {
      onSaveEdit(editMessage.id, message.trim());
      setMessage('');
      onCancelEdit();
    } else {
      onSend(message.trim(), 'text', {}, replyTo?.id);
      setMessage('');
      if (replyTo) onCancelReply();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    onTyping();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'file') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `chat-media/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath);

      onSend(urlData.publicUrl, type, {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      }, replyTo?.id);

      if (replyTo) onCancelReply();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'আপলোড ব্যর্থ',
        description: 'ফাইল আপলোড করতে সমস্যা হয়েছে',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Upload audio
        setIsUploading(true);
        try {
          const fileName = `voice-${Date.now()}.webm`;
          const filePath = `chat-media/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('post-images')
            .upload(filePath, audioBlob);

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from('post-images')
            .getPublicUrl(filePath);

          onSend(urlData.publicUrl, 'voice', {
            duration: recordingTime,
          }, replyTo?.id);

          if (replyTo) onCancelReply();
        } catch (error) {
          console.error('Voice upload error:', error);
          toast({
            title: 'আপলোড ব্যর্থ',
            description: 'ভয়েস মেসেজ আপলোড করতে সমস্যা হয়েছে',
            variant: 'destructive',
          });
        } finally {
          setIsUploading(false);
        }

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Recording error:', error);
      toast({
        title: 'মাইক্রোফোন অ্যাক্সেস',
        description: 'মাইক্রোফোন অ্যাক্সেস করতে সমস্যা হয়েছে',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setRecordingTime(0);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const insertEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
    textareaRef.current?.focus();
  };

  return (
    <div className="border-t border-[hsl(var(--wa-border))] bg-[hsl(var(--wa-sidebar))] p-3">
      {/* Reply/Edit preview */}
      {(replyTo || editMessage) && (
        <div className="flex items-center gap-3 mb-3 p-2 bg-muted rounded-lg">
          <div className="w-1 h-10 bg-primary rounded-full" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary text-bengali">
              {editMessage ? 'সম্পাদনা করা হচ্ছে' : `${replyTo?.sender?.full_name} কে উত্তর`}
            </p>
            <p className="text-sm text-muted-foreground truncate text-bengali">
              {(editMessage || replyTo)?.content}
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="shrink-0"
            onClick={editMessage ? onCancelEdit : onCancelReply}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Recording UI */}
      {isRecording ? (
        <div className="flex items-center gap-3">
          <Button size="icon" variant="ghost" onClick={cancelRecording}>
            <X className="w-5 h-5" />
          </Button>
          
          <div className="flex-1 flex items-center gap-3">
            <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
            <span className="text-sm font-medium">{formatRecordingTime(recordingTime)}</span>
            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-destructive animate-pulse" style={{ width: '100%' }} />
            </div>
          </div>

          <Button size="icon" onClick={stopRecording} className="bg-primary text-primary-foreground">
            <Send className="w-5 h-5" />
          </Button>
        </div>
      ) : (
        <div className="flex items-end gap-2">
          {/* Emoji picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button size="icon" variant="ghost" disabled={disabled || isUploading}>
                <Smile className="w-5 h-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" side="top">
              <div className="grid grid-cols-8 gap-1">
                {EMOJI_LIST.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => insertEmoji(emoji)}
                    className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted transition-colors text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Attachment menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" disabled={disabled || isUploading}>
                <Paperclip className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top">
              <DropdownMenuItem onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => handleFileSelect(e as unknown as React.ChangeEvent<HTMLInputElement>, 'image');
                input.click();
              }}>
                <Image className="w-4 h-4 mr-2" />
                <span className="text-bengali">ছবি</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'video/*';
                input.onchange = (e) => handleFileSelect(e as unknown as React.ChangeEvent<HTMLInputElement>, 'video');
                input.click();
              }}>
                <Video className="w-4 h-4 mr-2" />
                <span className="text-bengali">ভিডিও</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.onchange = (e) => handleFileSelect(e as unknown as React.ChangeEvent<HTMLInputElement>, 'file');
                input.click();
              }}>
                <FileText className="w-4 h-4 mr-2" />
                <span className="text-bengali">ফাইল</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Message input */}
          <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="মেসেজ লিখুন..."
                className="min-h-[44px] max-h-32 resize-none text-bengali rounded-full bg-background/70 border border-[hsl(var(--wa-border))] px-4 py-3 focus-visible:ring-2 focus-visible:ring-primary/30"
                disabled={disabled || isUploading}
                rows={1}
              />
          </div>

          {/* Send or Voice */}
          {message.trim() ? (
            <Button
              size="icon"
              onClick={handleSubmit}
              disabled={disabled || isUploading}
              className="shrink-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              size="icon"
              variant="ghost"
              onClick={startRecording}
              disabled={disabled || isUploading}
              className="shrink-0"
            >
              <Mic className="w-5 h-5" />
            </Button>
          )}
        </div>
      )}

      {isUploading && (
        <div className="mt-2 text-sm text-muted-foreground text-center text-bengali">
          আপলোড হচ্ছে...
        </div>
      )}
    </div>
  );
}
