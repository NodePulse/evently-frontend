import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Megaphone, Pin, SendHorizonal, ShieldCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { FormEvent, useState } from "react";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";

export interface ChatUser {
  id: string; // Should match your user ID type
  name: string;
  avatarUrl?: string;
  role?: "ORGANIZER" | "PARTICIPANT";
}

export interface Message {
  id: string;
  text: string;
  createdAt: string;
  user: ChatUser;
  isAnnouncement?: boolean;
}

export const ChatMessage = ({
  message,
  isSelf,
  isConnected,
}: {
  message: Message;
  isSelf: boolean;
  isConnected: boolean;
}) => {
  const isOrganizer = message.user.role === "ORGANIZER";
  const isAnnouncement = message.isAnnouncement;

  let messageClasses =
    "rounded-lg px-3 py-2 max-w-xs md:max-w-md text-sm whitespace-pre-wrap shadow-sm transition-all";
  let nameColor = "text-xs font-semibold";
  let containerAlign = isSelf ? "justify-end" : "justify-start";
  let bubbleStyle = "";
  let textColor = "";

  if (isAnnouncement) {
    // Announcements have the most prominent style
    bubbleStyle =
      "bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 text-black border border-yellow-300 shadow-lg";
    textColor = "text-black";
  } else if (isOrganizer) {
    // Regular messages from organizers have a distinct, but less prominent style
    bubbleStyle =
      "bg-gradient-to-r from-amber-100 to-yellow-50 border border-amber-200 text-amber-900 shadow-md";
    textColor = "text-amber-900";
  } else if (isSelf) {
    bubbleStyle =
      "bg-primary text-primary-foreground border border-primary/60 shadow";
  } else {
    bubbleStyle = "bg-muted border border-border text-foreground/90";
    textColor = "text-foreground/90";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-end gap-3 px-2 ${containerAlign}`}
    >
      {!isSelf && (
        <div className="relative inline-block">
          <Avatar className="h-8 w-8 shadow-sm">
            <AvatarImage src={message.user.avatarUrl} />
            <AvatarFallback>{message.user.name?.charAt(0)}</AvatarFallback>
          </Avatar>

          {/* Online dot */}
          <span
            className={`online-dot ${!isConnected ? "offline" : ""}`}
          ></span>
        </div>
      )}

      <div
        className={`flex flex-col gap-1 ${
          isSelf ? "items-end" : "items-start"
        }`}
      >
        {!isSelf && (
          <div className="flex items-center gap-2">
            <p className={nameColor}>{message.user.name}</p>
            {isOrganizer && (
              <MessageTag
                text="Organizer"
                icon={<ShieldCheck className="h-3 w-3" />}
              />
            )}
          </div>
        )}

        <div className={`${messageClasses} ${bubbleStyle}`}>
          {isAnnouncement && isOrganizer && (
            <div className="flex items-center gap-1 mb-1">
              <Megaphone className="h-4 w-4 text-yellow-700" />
              <span className="text-xs font-semibold uppercase text-yellow-800">
                Announcement
              </span>
            </div>
          )}
          <p className={textColor}>{message.text}</p>
        </div>

        <p className="text-[10px] text-muted-foreground">
          {formatDistanceToNow(new Date(message.createdAt), {
            addSuffix: true,
          })}
        </p>
      </div>

      {isSelf && (
        <div className="relative inline-block">
          <Avatar className="h-8 w-8 shadow-sm">
            <AvatarImage src={message.user.avatarUrl} />
            <AvatarFallback>You</AvatarFallback>
          </Avatar>
          <span
            className={`online-dot ${!isConnected ? "offline" : ""}`}
          ></span>
        </div>
      )}
    </motion.div>
  );
};

export const MessageTag = ({
  text,
  icon,
}: {
  text: string;
  icon: React.ReactNode;
}) => (
  <div className="flex items-center gap-1 text-yellow-600 bg-yellow-100 border border-yellow-200 rounded-full px-2 py-0.5">
    {icon}
    <span className="text-xs font-bold">{text}</span>
  </div>
);

export const ChatInputForm = ({
  onSendMessage,
  disabled,
  isOrganizer,
}: {
  onSendMessage: (text: string, isAnnouncement?: boolean) => void;
  disabled: boolean;
  isOrganizer: boolean;
}) => {
  const [text, setText] = useState("");
  const [sendAsAnnouncement, setSendAsAnnouncement] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSendMessage(text, sendAsAnnouncement);
    setText("");
    setSendAsAnnouncement(false);
  };

  return (
    <div className="w-full space-y-2">
      {isOrganizer && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="announcement"
            checked={sendAsAnnouncement}
            onCheckedChange={(checked) =>
              setSendAsAnnouncement(Boolean(checked))
            }
          />
          <Label
            htmlFor="announcement"
            className="text-sm font-medium leading-none cursor-pointer"
          >
            Send as Announcement
          </Label>
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="flex w-full items-center space-x-2"
      >
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={disabled ? "Connecting to chat..." : "Type a message..."}
          disabled={disabled}
        />
        <Button type="submit" size="icon" disabled={disabled || !text.trim()}>
          <SendHorizonal className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  );
};

export const PinnedMessageBar = ({
  message,
  onPinClick,
}: {
  message: Message;
  onPinClick: () => void;
}) => (
  <div
    className="p-2 border-b flex items-center justify-between gap-3 flex-shrink-0 bg-muted/50 cursor-pointer"
    onClick={onPinClick}
  >
    <div className="flex items-center gap-3 overflow-hidden">
      <Megaphone className="h-5 w-5 text-primary flex-shrink-0" />
      <div className="overflow-hidden">
        <p className="text-sm font-semibold text-primary truncate">
          Announcement
        </p>
        <p className="text-xs text-muted-foreground truncate">{message.text}</p>
      </div>
    </div>
    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
      <Pin className="h-4 w-4" />
    </Button>
  </div>
);

export const AllAnnouncementsModal = ({
  isOpen,
  onClose,
  messages,
}: {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>All Announcements</DialogTitle>
        <DialogDescription>
          Here are all the announcements from the event organizer.
        </DialogDescription>
      </DialogHeader>
      <ScrollArea className="max-h-[60vh] pr-4">
        <div className="space-y-4 py-4">
          {messages.map((msg) => (
            <AnnouncementListItem key={msg.id} message={msg} />
          ))}
        </div>
      </ScrollArea>
    </DialogContent>
  </Dialog>
);

export const AnnouncementListItem = ({ message }: { message: Message }) => (
  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-start gap-3">
    <Megaphone className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
    <div>
      <p className="text-xs text-muted-foreground">
        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
      </p>
      <p className="text-sm text-blue-800">{message.text}</p>
    </div>
  </div>
);
