"use client";

import React, { useState, useEffect, useRef, FormEvent, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import { useParams } from "next/navigation";
import { format, formatDistanceToNow, isToday, isYesterday, set } from "date-fns";
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
import { AllAnnouncementsModal, ChatInputForm, ChatMessage, PinnedMessageBar } from "./ChatComponents";

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
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

    const scrollAreaRef = useRef<HTMLDivElement>(null);
    // const currentUser = getCurrentUser();
    let latestDate = ""

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

    const formatDateSeparator = (dateStr: string) => {
        const date = new Date(dateStr);
        if (isToday(date)) return "Today";
        if (isYesterday(date)) return "Yesterday";
        return format(date, "MMMM d, yyyy");
    };

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
            newSocket.emit("joinRoom", eventId, currentUser.id);
        });

        // The server should emit the chat history upon joining
        newSocket.on("chatHistory", (history: Message[]) => {
            setMessages(history);
        });

        // Listen for new messages from the server
        newSocket.on("newMessage", (message: Message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        newSocket.on("onlineUsers", (userId: string) => {
            setOnlineUsers(prev => [...prev, userId]);
        });

        // newSocket.on("userOffline", (userId: string) => {
        //     setOnlineUsers(prev => {
        //         const newSet = new Set(prev);
        //         newSet.delete(userId);
        //         return newSet;
        //     });
        // });

        newSocket.on("userStatus", ({ userId, isOnline }) => {
            setOnlineUsers((prev) => {
              if (isOnline) {
                // Add user if not already present
                return prev.includes(userId) ? prev : [...prev, userId];
              } else {
                // Remove user if they went offline
                return prev.filter((id) => id !== userId);
              }
            });
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
            <Card className="grid grid-rows-[auto_1fr_auto] h-[80vh] sm:h-[600px] max-h-[90vh] w-full gap-0 py-0">
                <CardHeader className="flex-row items-center justify-between px-3 py-2 sm:px-4 sm:py-3 border-b flex-shrink-0 [.border-b]:pb-0">
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
                                messages.map((msg) => {
                                    let showDateSeparator = false;
                                    const messageDate = format(new Date(msg.createdAt), 'yyyy-MM-dd')
                                    if (messageDate !== latestDate) {
                                        showDateSeparator = true
                                        latestDate = messageDate
                                    }
                                    return (
                                        <React.Fragment key={msg.id}>
                                            {showDateSeparator && (
                                                <div className="relative my-4">
                                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                                        <div className="w-full border-t border-border" />
                                                    </div>
                                                    <div className="relative flex justify-center text-xs uppercase">
                                                        <span className="bg-background px-2 text-muted-foreground">
                                                            {formatDateSeparator(latestDate)}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                            <ChatMessage
                                                key={msg.id}
                                                message={msg}
                                                isSelf={msg.user.id === currentUser?.id}
                                                isConnected={onlineUsers.includes(msg.user.id)}
                                            />
                                        </React.Fragment>
                                    )
                                })
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