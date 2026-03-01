import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Loader2,
  Minimize2,
  Maximize2,
  Sparkles,
  HelpCircle,
  Calendar,
  Clock,
  Users,
  CreditCard,
  Settings,
  Copy,
  CheckCheck,
  RefreshCw,
  LogIn,
  Mail
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { useOrganization } from "@/hooks/use-team-management";
import { Link } from "react-router-dom";

// Types for chat messages
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

// Quick action buttons - different for logged in vs anonymous
const getQuickActions = (isLoggedIn: boolean) => {
  if (isLoggedIn) {
    return [
      { label: "Create event", icon: Calendar, query: "How do I create a new event type?" },
      { label: "Set availability", icon: Clock, query: "How do I set my availability?" },
      { label: "Team members", icon: Users, query: "How do I add team members?" },
      { label: "Billing", icon: CreditCard, query: "Tell me about pricing and billing" },
      { label: "Help", icon: HelpCircle, query: "I need help with SBPMeet" }
    ];
  }
  return [
    { label: "Pricing", icon: CreditCard, query: "What are your pricing plans?" },
    { label: "Features", icon: Sparkles, query: "What features do you offer?" },
    { label: "Sign up", icon: LogIn, query: "How do I create an account?" },
    { label: "Contact", icon: Mail, query: "How can I contact support?" },
    { label: "Help", icon: HelpCircle, query: "I need help with SBPMeet" }
  ];
};

// FAQ suggestions - different for logged in vs anonymous
const getFaqSuggestions = (isLoggedIn: boolean) => {
  if (isLoggedIn) {
    return [
      "How do I connect Google Calendar?",
      "What payment methods are supported?",
      "How do I cancel a booking?",
      "Can I have multiple team members?",
      "How do I set up M-Pesa?"
    ];
  }
  return [
      "Is there a free plan?",
      "How do I get started?",
      "Do you offer team features?",
      "What integrations do you have?",
      "How does M-Pesa integration work?"
    ];
};

// Comprehensive system prompt for the AI
const getSystemPrompt = (user: any, organization: any) => {
  const userName = user?.email?.split('@')[0] || 'there';
  const orgName = organization?.name || 'your organization';
  
  const basePrompt = `You are PasbestAI, a helpful customer support assistant for SBPMeet, a scheduling platform similar to Calendly. 

ABOUT SBPMEET:
SBPMeet is a modern scheduling platform that helps individuals and teams manage appointments, bookings, and meetings. Key features include:

1. PERSONAL SCHEDULING:
   - Create multiple event types (30-minute calls, 1-hour consultations, etc.)
   - Set your availability preferences (working hours, buffer times, date ranges)
   - Share your personal booking link with clients
   - Clients can book time slots that work for both parties

2. TEAM SCHEDULING:
   - Add team members to your organization
   - Round-robin scheduling to distribute meetings evenly
   - Collective availability management
   - Team booking pages

3. CALENDAR INTEGRATIONS:
   - Two-way sync with Google Calendar
   - Outlook Calendar integration
   - Apple Calendar support
   - Prevents double-bookings automatically

4. PAYMENT INTEGRATIONS:
   - M-Pesa (Kenya's leading mobile money service)
   - Stripe for credit card payments
   - Collect payments at time of booking
   - Automatic invoicing

5. VIDEO CONFERENCING:
   - Automatic Google Meet link generation
   - Zoom integration
   - Microsoft Teams integration

6. BOOKING MANAGEMENT:
   - View all upcoming bookings
   - Cancel or reschedule meetings
   - Send confirmation emails
   - Automated reminders

7. TEAM COLLABORATION:
   - Multiple team members with different roles
   - Departments and team structures
   - Shared team calendar view
   - Team analytics and reporting

8. CUSTOMIZATION:
   - Custom email templates
   - Branded booking pages
   - Custom questions for clients
   - Buffer times between meetings

9. SECURITY:
   - Role-based permissions (Admin, Manager, Member)
   - Two-factor authentication
   - API access for developers
   - Audit logs

PRICING PLANS:
- Free Plan: Basic scheduling features, limited events, up to 1 calendar connection
- Pro Plan: Advanced features, unlimited events, team scheduling, payment integrations
- Business Plan: All features, advanced analytics, API access, priority support

RESPONSE GUIDELINES:
- Be friendly, professional, and helpful
- Provide COMPLETE, thorough answers - never truncate your responses
- Use plain text with proper punctuation
- Format responses with simple bullet points using dashes
- Keep responses conversational but informative
- If you don't know something, offer to connect with human support
- For logged-in users, use their name occasionally
- For anonymous users, encourage sign-up when relevant but remain helpful

User Context:`;

  if (user) {
    return basePrompt + ` 
- User is LOGGED IN as: ${user.email}
- Username: ${userName}
- Organization: ${orgName}
- Account Status: Active

IMPORTANT: Provide complete, detailed answers. Do not truncate your responses.`;
  }

  return basePrompt + `
- User is NOT LOGGED IN (anonymous visitor)
- They are browsing as a guest

IMPORTANT: Provide complete, detailed answers. Do not truncate your responses.`;
};

// Environment variables with fallbacks
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-1.5-flash";
const GEMINI_BASE_URL = import.meta.env.VITE_GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1";

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { data: organization } = useOrganization();
  
  const isLoggedIn = !!user;
  const quickActions = getQuickActions(isLoggedIn);
  const faqSuggestions = getFaqSuggestions(isLoggedIn);
  const userName = user?.email?.split('@')[0] || 'there';
  const orgName = organization?.name || 'your organization';

  // Initialize with personalized welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = isLoggedIn
        ? `Hi ${userName}! I'm PasbestAI, your SBPMeet assistant. How can I help you with your scheduling today?`
        : `Welcome to SBPMeet! I'm PasbestAI, your scheduling assistant. I can help you learn about our platform, features, pricing, and more. What would you like to know?`;

      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: welcomeMessage,
          timestamp: new Date(),
          suggestions: faqSuggestions.slice(0, 3)
        }
      ]);
    }
  }, [isOpen, isLoggedIn, userName]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // Send message to Gemini API
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Check if API key is configured
      if (!GEMINI_API_KEY) {
        throw new Error("Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.");
      }

      // Get personalized system prompt
      const systemPrompt = getSystemPrompt(user, organization);

      // Add context about user state
      const userContext = isLoggedIn
        ? `The user is LOGGED IN as ${user?.email}. Their username is ${userName}. Their organization is ${orgName}. `
        : "The user is NOT LOGGED IN (anonymous visitor). They are browsing as a guest. ";

      // Add instruction for complete answers
      const completeAnswerInstruction = "IMPORTANT: Provide a COMPLETE, thorough answer. Do not truncate or cut off your response. Give full details.";

      // Call Gemini API with correct model and HIGHER token limit
      const response = await fetch(
        `${GEMINI_BASE_URL}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ 
                  text: systemPrompt + "\n\n" + userContext + completeAnswerInstruction + "\n\nUser question: " + content 
                }]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 800, // Increased from 300 to allow complete answers
              topP: 0.95,
              topK: 40
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              }
            ]
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Gemini API error:", errorData);
        
        // Check for specific model errors
        if (errorData.error?.message?.includes("not found") || errorData.error?.message?.includes("not supported")) {
          throw new Error(`Model ${GEMINI_MODEL} is not available. Please check your model configuration.`);
        }
        
        throw new Error(errorData.error?.message || `API Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract response text from Gemini response
      let aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!aiResponse) {
        throw new Error("No response generated from AI");
      }

      // Post-process to remove any remaining asterisks
      aiResponse = aiResponse.replace(/\*/g, '');

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
        suggestions: getSuggestionsForResponse(content, isLoggedIn)
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      
      // Friendly error message based on error type
      let errorMessage = "I'm having trouble connecting right now. ";
      
      if (error instanceof Error) {
        if (error.message.includes("API key")) {
          errorMessage = "The chat service needs to be configured. Please contact support at support@pasbestventures.com";
        } else if (error.message.includes("Model")) {
          errorMessage = "I'm having technical difficulties. Please try again later or contact support.";
        } else {
          errorMessage += "Please try again in a moment or contact support at support@pasbestventures.com";
        }
      }
      
      // Add error message with suggestion to contact support
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: errorMessage,
        timestamp: new Date(),
        suggestions: isLoggedIn 
          ? ["Try again", "Contact support", "Check documentation"]
          : ["Try again", "Contact support", "Sign up for free"]
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Get contextual suggestions based on user query and login state
  const getSuggestionsForResponse = (query: string, isLoggedIn: boolean): string[] => {
    const q = query.toLowerCase();
    
    if (isLoggedIn) {
      if (q.includes("calendar") || q.includes("google") || q.includes("outlook")) {
        return ["How do I sync Google Calendar?", "Connect Outlook calendar", "Fix calendar sync issues"];
      }
      if (q.includes("payment") || q.includes("mpesa") || q.includes("stripe") || q.includes("money")) {
        return ["Set up M-Pesa", "Stripe integration", "Payment troubleshooting"];
      }
      if (q.includes("team") || q.includes("member") || q.includes("invite")) {
        return ["Add team members", "Team roles explained", "Manage permissions"];
      }
      if (q.includes("event") || q.includes("booking") || q.includes("schedule")) {
        return ["Create event type", "Manage bookings", "Set availability"];
      }
      if (q.includes("billing") || q.includes("plan") || q.includes("price") || q.includes("subscription")) {
        return ["View pricing plans", "Upgrade account", "Billing history"];
      }
    } else {
      if (q.includes("price") || q.includes("cost") || q.includes("plan")) {
        return ["Is there a free plan?", "What are the paid plans?", "Can I upgrade later?"];
      }
      if (q.includes("sign") || q.includes("account") || q.includes("register")) {
        return ["How do I create an account?", "Is sign up free?", "Can I try before buying?"];
      }
      if (q.includes("feature") || q.includes("what") || q.includes("do")) {
        return ["What features do you offer?", "Do you have team features?", "What integrations?"];
      }
    }
    
    return faqSuggestions.slice(0, 3);
  };

  // Handle quick action click
  const handleQuickAction = (query: string) => {
    sendMessage(query);
  };

  // Copy message to clipboard
  const copyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Reset conversation with personalized welcome
  const resetConversation = () => {
    const welcomeMessage = isLoggedIn
      ? `Hi ${userName}! I'm PasbestAI, your SBPMeet assistant. How can I help you with your scheduling today?`
      : `Welcome to SBPMeet! I'm PasbestAI, your scheduling assistant. I can help you learn about our platform, features, pricing, and more. What would you like to know?`;

    setMessages([
      {
        id: "welcome-" + Date.now(),
        role: "assistant",
        content: welcomeMessage,
        timestamp: new Date(),
        suggestions: faqSuggestions.slice(0, 3)
      }
    ]);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-300 z-50"
        title="Chat with PasbestAI"
      >
        <MessageSquare className="h-5 w-5 text-white" />
      </Button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          scale: 1,
        }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "fixed bottom-4 right-4 z-50",
          isMinimized ? "w-64" : "w-[350px] sm:w-[380px]"
        )}
      >
        <Card className="overflow-hidden shadow-2xl border-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-orange-600 p-3 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  PasbestAI
                  <Badge variant="secondary" className="text-[10px] bg-white/20 text-white border-0 py-0 h-4">
                    <Sparkles className="h-2 w-2 mr-1" />
                    {isLoggedIn ? 'Personal' : 'Guest'}
                  </Badge>
                </h3>
                <p className="text-[10px] text-white/80">
                  {isLoggedIn ? `Hi, ${userName}` : 'Not signed in'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-white hover:bg-white/20"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-white hover:bg-white/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="h-[350px] overflow-y-auto p-3 bg-gray-50 dark:bg-gray-900">
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-2",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {message.role === "assistant" && (
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-gradient-to-r from-blue-600 to-orange-600 text-white text-xs">
                            AI
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div className={cn(
                        "max-w-[85%] rounded-lg p-2.5 relative group",
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      )}>
                        <p className="text-xs whitespace-pre-wrap">{message.content}</p>
                        
                        {/* Message actions */}
                        <div className={cn(
                          "absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1",
                          message.role === "user" ? "text-white" : "text-gray-500"
                        )}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-5 w-5",
                              message.role === "user" 
                                ? "hover:bg-white/20 text-white" 
                                : "hover:bg-gray-100 dark:hover:bg-gray-700"
                            )}
                            onClick={() => copyMessage(message.content, message.id)}
                          >
                            {copiedId === message.id ? (
                              <CheckCheck className="h-2.5 w-2.5" />
                            ) : (
                              <Copy className="h-2.5 w-2.5" />
                            )}
                          </Button>
                        </div>

                        {/* Timestamp */}
                        <p className={cn(
                          "text-[10px] mt-1",
                          message.role === "user"
                            ? "text-blue-100"
                            : "text-gray-400"
                        )}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {message.role === "user" && (
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-xs">
                            {isLoggedIn ? userName.charAt(0).toUpperCase() : 'U'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}

                  {/* Suggestions */}
                  {messages[messages.length - 1]?.suggestions && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {messages[messages.length - 1].suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-[10px] h-6 px-2 bg-white dark:bg-gray-800"
                          onClick={() => sendMessage(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-gradient-to-r from-blue-600 to-orange-600 text-white text-xs">
                          AI
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-2 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="flex-shrink-0 gap-1 h-7 px-2"
                      onClick={() => handleQuickAction(action.query)}
                    >
                      <action.icon className="h-3 w-3" />
                      <span className="text-[10px]">{action.label}</span>
                    </Button>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-shrink-0 gap-1 h-7 px-2"
                    onClick={resetConversation}
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span className="text-[10px]">Reset</span>
                  </Button>
                </div>
              </div>

              {/* Input */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage(input);
                  }}
                  className="flex gap-2"
                >
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isLoggedIn ? "Ask PasbestAI..." : "Ask about SBPMeet..."}
                    className="flex-1 h-8 text-sm"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="h-8 w-8 bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading || !input.trim()}
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </form>
                
                {/* Sign up prompt for anonymous users */}
                {!isLoggedIn && (
                  <div className="mt-2 text-center">
                    <Link 
                      to="/signup" 
                      className="text-[10px] text-blue-600 hover:text-orange-600 transition-colors"
                    >
                      Sign up for free to get personalized help →
                    </Link>
                  </div>
                )}
                
                <p className="text-[8px] text-gray-400 mt-1.5 text-center">
                  Powered by {GEMINI_MODEL} • Free
                </p>
              </div>
            </>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}