import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Paperclip, Search, Users } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  projectId?: string;
  content: string;
  read: boolean;
  createdAt: string;
}

interface Conversation {
  userId: string;
  userName: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

export default function Messages() {
  const { user } = useAuth();
  const { isConnected } = useWebSocket();
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ['/api/conversations'],
    queryFn: async () => {
      // This would be implemented on the backend to return conversation summaries
      // For now, return empty array as this endpoint doesn't exist yet
      return [];
    },
  });

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ['/api/messages', selectedConversation],
    enabled: !!selectedConversation,
    queryFn: async () => {
      const res = await fetch(`/api/messages?userId=${selectedConversation}`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch messages');
      return res.json();
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { receiverId: string; content: string; projectId?: string }) => {
      const res = await apiRequest('POST', '/api/messages', messageData);
      return await res.json();
    },
    onSuccess: () => {
      setMessageInput("");
      queryClient.invalidateQueries({ queryKey: ['/api/messages', selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send message",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // WebSocket effect for real-time messages
  useEffect(() => {
    if (isConnected) {
      // Listen for WebSocket messages
      const handleWebSocketMessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'new_message' && data.message) {
            // Invalidate queries to refresh message lists
            queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
            queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
          }
        } catch (error) {
          console.error('Error handling WebSocket message:', error);
        }
      };

      // Note: This is a simplified approach - in a real app you'd use the WebSocket hook more directly
      window.addEventListener('message', handleWebSocketMessage);
      return () => window.removeEventListener('message', handleWebSocketMessage);
    }
  }, [isConnected]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversation) return;

    sendMessageMutation.mutate({
      receiverId: selectedConversation,
      content: messageInput.trim(),
    });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground" data-testid="page-title">Messages</h1>
                <p className="text-muted-foreground">Communicate with suppliers and project stakeholders</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-muted-foreground">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
            {/* Conversations List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Conversations
                  </CardTitle>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-conversations"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  {filteredConversations.length === 0 ? (
                    <div className="p-6 text-center">
                      <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No conversations yet</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Start messaging suppliers from project pages
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredConversations.map((conversation) => (
                        <div
                          key={conversation.userId}
                          onClick={() => setSelectedConversation(conversation.userId)}
                          className={cn(
                            "p-4 cursor-pointer hover:bg-accent transition-colors border-b border-border/50",
                            selectedConversation === conversation.userId && "bg-accent"
                          )}
                          data-testid={`conversation-${conversation.userId}`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium text-foreground truncate">
                                  {conversation.userName}
                                </h3>
                                {conversation.unreadCount > 0 && (
                                  <Badge variant="destructive" className="text-xs">
                                    {conversation.unreadCount}
                                  </Badge>
                                )}
                              </div>
                              {conversation.lastMessage && (
                                <p className="text-sm text-muted-foreground truncate mt-1">
                                  {conversation.lastMessage}
                                </p>
                              )}
                            </div>
                            {conversation.lastMessageTime && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(conversation.lastMessageTime).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="lg:col-span-3">
              {selectedConversation ? (
                <>
                  <CardHeader className="border-b border-border">
                    <div className="flex items-center justify-between">
                      <CardTitle>
                        Chat with {conversations.find(c => c.userId === selectedConversation)?.userName || 'User'}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {/* Messages */}
                    <ScrollArea className="h-[400px] p-4">
                      {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No messages yet</p>
                            <p className="text-sm text-muted-foreground mt-1">Start the conversation!</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages.map((message) => (
                            <div
                              key={message.id}
                              className={cn(
                                "flex",
                                message.senderId === user?.id ? "justify-end" : "justify-start"
                              )}
                            >
                              <div
                                className={cn(
                                  "max-w-[70%] px-4 py-2 rounded-lg",
                                  message.senderId === user?.id
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-foreground"
                                )}
                                data-testid={`message-${message.id}`}
                              >
                                <p className="text-sm">{message.content}</p>
                                <p
                                  className={cn(
                                    "text-xs mt-1",
                                    message.senderId === user?.id
                                      ? "text-primary-foreground/70"
                                      : "text-muted-foreground"
                                  )}
                                >
                                  {new Date(message.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </ScrollArea>

                    <Separator />

                    {/* Message Input */}
                    <form onSubmit={handleSendMessage} className="p-4">
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          data-testid="button-attach-file"
                        >
                          <Paperclip className="w-4 h-4" />
                        </Button>
                        <Input
                          placeholder="Type your message..."
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          className="flex-1"
                          data-testid="input-message"
                        />
                        <Button
                          type="submit"
                          disabled={!messageInput.trim() || sendMessageMutation.isPending}
                          data-testid="button-send-message"
                        >
                          {sendMessageMutation.isPending ? (
                            <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </>
              ) : (
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">Select a conversation</h3>
                    <p className="text-muted-foreground">
                      Choose a conversation from the sidebar to start messaging
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
