"use client";

import { useState, useEffect, useRef, FormEvent, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import { useParams } from "next/navigation";
import { formatDistanceToNow, set } from "date-fns";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

// UI Components
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Megaphone, Pin, SendHorizonal, ShieldCheck, WifiOff } from "lucide-react";
import { useUser } from "@/context/authContext";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";

// --- Type Definitions ---
interface ChatUser {
    id: string; // Should match your user ID type
    name: string;
    avatarUrl?: string;
    role?: 'ORGANIZER' | 'PARTICIPANT';
}

interface Message {
    id: string;
    text: string;
    createdAt: string;
    user: ChatUser;
    isAnnouncement?: boolean;
}

// Assume we have a function to get the current user's info
// const getCurrentUser = (): ChatUser => ({
//     id: 'user-123-abc', // This should be dynamically fetched from your auth context
//     name: 'You',
//     avatarUrl: 'https://github.com/shadcn.png',
// });

// --- Main Chat Component ---
export const EventChat = ({ isOrganizer }: { isOrganizer: boolean }) => {
    const params = useParams();
    const eventId = params.id as string;

    const { user: currentUser } = useUser();

    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const scrollAreaRef = useRef<HTMLDivElement>(null);
    // const currentUser = getCurrentUser();

    const { pinnedMessages, chatMessages } = useMemo(() => {
        const pinned = messages
            .filter((m) => m.isAnnouncement)
            .sort(
                (a, b) =>
                    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
        const chat = messages.filter((m) => !m.isAnnouncement);
        return { pinnedMessages: pinned, chatMessages: chat };
    }, [messages]);

    const latestPinnedMessage = pinnedMessages[pinnedMessages.length - 1];

    // Effect for managing Socket.IO connection and listeners
    useEffect(() => {
        if (!currentUser) {
            return;
        }
        // Initialize the socket connection
        // Replace with your actual server URL
        const newSocket = io(
            process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001"
        );
        setSocket(newSocket);

        // --- Socket Event Listeners ---
        newSocket.on("connect", () => {
            setIsConnected(true);
            // Join the specific event's chat room
            newSocket.emit("joinRoom", eventId);
        });

        // The server should emit the chat history upon joining
        newSocket.on("chatHistory", (history: Message[]) => {
            setMessages(history);
        });

        // Listen for new messages from the server
        newSocket.on("newMessage", (message: Message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        newSocket.on("disconnect", () => {
            setIsConnected(false);
        });

        // --- Cleanup on component unmount ---
        return () => {
            newSocket.disconnect();
        };
    }, [eventId, currentUser]);

    // Effect to scroll to the bottom when new messages arrive
    // useEffect(() => {
    //     if (scrollAreaRef.current) {
    //         const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
    //         if (viewport) {
    //             viewport.scrollTo({
    //                 top: viewport.scrollHeight,
    //                 behavior: 'smooth',
    //             });
    //         }
    //     }
    // }, [messages]);
    useEffect(() => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector(
                "[data-radix-scroll-area-viewport]"
            );
            if (viewport) {
                setTimeout(() => {
                    viewport.scrollTo({
                        top: viewport.scrollHeight,
                        behavior: "smooth",
                    });
                }, 0);
            }
        }
    }, [messages]);

    const handleSendMessage = (text: string, sendAsAnnouncement?: boolean) => {
        if (!currentUser) {
            return;
        }

        if (socket && socket.connected && text.trim()) {
            const messageData = {
                text,
                eventId,
                isAnnouncement: sendAsAnnouncement,
                user: currentUser,
            };

            // --- ADD THESE DETAILED LOGS ---
            console.log("--- Inspecting Data Before Emit ---");
            console.log("Text:", text);
            console.log("Event ID:", eventId);
            console.log("Current User Object:", currentUser);
            // ------------------------------------

            console.log("Emitting message:", messageData);
            socket.emit("sendMessage", messageData);
        } else {
            console.error(
                "Cannot send message, socket is not connected or text is empty."
            );
        }
    };

    return (
        <>
            <Card className="grid grid-rows-[auto_1fr_auto] h-[80vh] sm:h-[600px] max-h-[90vh] w-full">
                <CardHeader className="flex-row items-center justify-between px-3 py-2 sm:px-4 sm:py-3 border-b flex-shrink-0">
                    <CardTitle className="text-base sm:text-lg">Event Chat</CardTitle>
                    {!isConnected && (
                        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-destructive">
                            <WifiOff className="h-3 w-3 sm:h-4 sm:w-4" /> Disconnected
                        </div>
                    )}
                </CardHeader>

                {/* Main content */}
                <CardContent className="flex flex-col p-0 overflow-hidden">
                    {/* Pinned messages */}
                    {
                        latestPinnedMessage && <PinnedMessageBar message={latestPinnedMessage} onPinClick={() => setIsModalOpen(true)} />
                    }

                    {/* Scrollable chat messages */}
                    <ScrollArea
                        ref={scrollAreaRef}
                        className="flex-1 px-3 sm:px-4 py-2 sm:py-3 overflow-y-auto"
                    >
                        <div className="space-y-3 sm:space-y-4">
                            {messages.length > 0 ? (
                                messages.map((msg) => (
                                    <ChatMessage
                                        key={msg.id}
                                        message={msg}
                                        isSelf={msg.user.id === currentUser?.id}
                                    />
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground pt-6 sm:pt-10 text-sm sm:text-base">
                                    No messages yet. Be the first to say something!
                                </p>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>

                {/* Footer */}
                <CardFooter className="flex-shrink-0 p-2 sm:p-4 border-t bg-background sticky bottom-0">
                    <ChatInputForm
                        isOrganizer={isOrganizer}
                        onSendMessage={handleSendMessage}
                        disabled={!isConnected}
                    />
                </CardFooter>
            </Card>
            <AllAnnouncementsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} messages={pinnedMessages} />
        </>
    );
};

// --- Sub-component for a single message ---
const ChatMessage = ({ message, isSelf }: { message: Message; isSelf: boolean }) => {
    const isOrganizer = message.user.role === "ORGANIZER";
    const isAnnouncement = message.isAnnouncement;

    // 🎨 Dynamic styling for different message types
    let messageClasses = "rounded-lg px-3 py-2 max-w-xs md:max-w-md text-sm whitespace-pre-wrap shadow-sm transition-all";
    let nameColor = "text-xs font-semibold";
    let containerAlign = isSelf ? "justify-end" : "justify-start";
    let bubbleStyle = "";
    let textColor = "";

    if (isAnnouncement && isOrganizer) {
        // Organizer announcement — premium banner style
        bubbleStyle =
            "bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 text-black border border-yellow-300 shadow-lg";
        textColor = "text-black";
    } else if (isOrganizer) {
        // Organizer normal message — subtle premium
        bubbleStyle =
            "bg-gradient-to-r from-amber-100 to-yellow-50 border border-amber-200 text-amber-900 shadow-md";
        textColor = "text-amber-900";
    } else if (isSelf) {
        // Self message — primary color tone
        bubbleStyle =
            "bg-primary text-primary-foreground border border-primary/60 shadow";
    } else {
        // Participant message — neutral muted tone
        bubbleStyle = "bg-muted border border-border text-foreground/90";
        textColor = "text-foreground/90";
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex items-end gap-3 ${containerAlign}`}
        >
            {!isSelf && (
                <Avatar className="h-8 w-8 shadow-sm">
                    <AvatarImage src={message.user.avatarUrl} />
                    <AvatarFallback>{message.user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
            )}

            <div className={`flex flex-col gap-1 ${isSelf ? "items-end" : "items-start"}`}>
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

                {/* Message bubble */}
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
                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                </p>
            </div>

            {isSelf && (
                <Avatar className="h-8 w-8 shadow-sm">
                    <AvatarImage src={message.user.avatarUrl} />
                    <AvatarFallback>You</AvatarFallback>
                </Avatar>
            )}
        </motion.div>
    );
};


const MessageTag = ({ text, icon }: { text: string; icon: React.ReactNode }) => (
    <div className="flex items-center gap-1 text-yellow-600 bg-yellow-100 border border-yellow-200 rounded-full px-2 py-0.5">
        {icon}
        <span className="text-xs font-bold">{text}</span>
    </div>
);

// --- Sub-component for the input form ---
const ChatInputForm = ({
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

const PinnedMessage = ({ message }: { message: Message }) => (
    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-start gap-3">
        <Megaphone className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
        <div>
            <p className="text-sm font-semibold text-blue-800">
                Announcement from {message.user.name}
            </p>
            <p className="text-sm text-blue-700">{message.text}</p>
        </div>
    </div>
);

const PinnedMessageBar = ({ message, onPinClick }: { message: Message; onPinClick: () => void; }) => (
    <div className="p-2 border-b flex items-center justify-between gap-3 flex-shrink-0 bg-muted/50 cursor-pointer" onClick={onPinClick}>
        <div className="flex items-center gap-3 overflow-hidden">
            <Megaphone className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="overflow-hidden">
                <p className="text-sm font-semibold text-primary truncate">Announcement</p>
                <p className="text-xs text-muted-foreground truncate">{message.text}</p>
            </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
            <Pin className="h-4 w-4" />
        </Button>
    </div>
);

const AllAnnouncementsModal = ({ isOpen, onClose, messages }: { isOpen: boolean; onClose: () => void; messages: Message[]; }) => (
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
                    {messages.map(msg => (
                        <AnnouncementListItem key={msg.id} message={msg} />
                    ))}
                </div>
            </ScrollArea>
        </DialogContent>
    </Dialog>
);

// This component is for the list INSIDE the modal
const AnnouncementListItem = ({ message }: { message: Message }) => (
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