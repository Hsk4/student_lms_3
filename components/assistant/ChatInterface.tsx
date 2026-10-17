'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, RotateCcw, Copy, Check } from 'lucide-react';
import { ChatMessage } from '@/types/dashboard';
import { mockInitialChatMessages } from '@/data/mock-data';
import { RobotAssistant } from './RobotAssistant';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>(mockInitialChatMessages);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleCopyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateAIResponse = (userPrompt: string): { text: string; codeSnippet?: string; suggestions?: string[] } => {
    const lower = userPrompt.toLowerCase();

    if (lower.includes('raft') || lower.includes('consensus') || lower.includes('election')) {
      return {
        text: "In the Raft Consensus Protocol (CS401), leader election is triggered when a follower's election timer expires without receiving a heartbeat AppendEntries RPC from the current leader. The node increments its currentTerm, transitions to Candidate, votes for itself, and broadcasts RequestVote RPCs to all peers. Once it collects votes from a strict quorum (N/2 + 1), it assumes Leader state and immediately starts heartbeats.",
        codeSnippet: `// Raft Candidate State Transition Loop
func (rf *Raft) startElection() {
    rf.mu.Lock()
    rf.currentTerm++
    rf.state = Candidate
    rf.votedFor = rf.me
    rf.votesReceived = 1
    term := rf.currentTerm
    rf.mu.Unlock()

    for peer := range rf.peers {
        if peer != rf.me {
            go rf.sendRequestVote(peer, term)
        }
    }
}`,
        suggestions: [
          'How does Log Replication match indexes?',
          'What happens during network partitions?',
        ],
      };
    }

    if (lower.includes('kkt') || lower.includes('optimization') || lower.includes('multiplier')) {
      return {
        text: "Karush-Kuhn-Tucker (KKT) conditions are first-order necessary conditions for a solution in nonlinear mathematical programming to be optimal, provided some regularity conditions hold. For minimize f(x) subject to g_i(x) <= 0 and h_j(x) = 0, the conditions are: 1) Stationarity: ∇f(x*) + Σ μ_i ∇g_i(x*) + Σ λ_j ∇h_j(x*) = 0. 2) Primal feasibility. 3) Dual feasibility: μ_i >= 0. 4) Complementary slackness: μ_i * g_i(x*) = 0.",
        suggestions: ['Review duality gap theorem', 'Show simplex solver example'],
      };
    }

    if (lower.includes('attention') || lower.includes('transformer') || lower.includes('neural')) {
      return {
        text: "In Transformer architectures (CS412), Scaled Dot-Product Attention maps a query vector and a set of key-value pairs to an output: Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V. The scaling factor 1/sqrt(d_k) prevents the dot product from growing excessively large in high dimensions, which would otherwise push the softmax function into regions with vanishingly small gradients.",
        codeSnippet: `import torch
import torch.nn.functional as F

def scaled_dot_product_attention(Q, K, V, mask=None):
    d_k = Q.size(-1)
    scores = torch.matmul(Q, K.transpose(-2, -1)) / (d_k ** 0.5)
    if mask is not None:
        scores = scores.masked_fill(mask == 0, -1e9)
    attn_weights = F.softmax(scores, dim=-1)
    return torch.matmul(attn_weights, V), attn_weights`,
        suggestions: ['Explain Multi-Head projection', 'What is RoPE embedding?'],
      };
    }

    if (lower.includes('deadline') || lower.includes('assignment') || lower.includes('due')) {
      return {
        text: 'Here is your active deadline radar:\n1. 🚨 **Canary Deployment on K8s (CS320)** — Due Oct 15 (2 days left!)\n2. ⏱️ **Raft Leader Election (CS401)** — Due Oct 18 (5 days left)\n3. 🧠 **Multi-Head Self Attention (CS412)** — Due Oct 21 (8 days left)\n\nWould you like me to generate a prioritized sprint breakdown to finish CS320 today?',
        suggestions: ['Create sprint plan for CS320', 'Open Assignment Submissions'],
      };
    }

    return {
      text: `Understood! I've analyzed your academic query regarding "${userPrompt}". I've indexed your current course materials in CS401, CS412, MATH305, and CS320. To give you the exact formulation, let me break this down into primary concepts and recommended study milestones.`,
      suggestions: [
        'Give me practice quiz questions',
        'Summarize this for revision notes',
        'Show related exam questions',
      ],
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsThinking(true);

    setTimeout(() => {
      const response = generateAIResponse(query);
      const assistantMsg: ChatMessage = {
        id: `ast_${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        timestamp: 'Just now',
        codeSnippet: response.codeSnippet,
        suggestions: response.suggestions,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsThinking(false);
    }, 900);
  };

  const handleReset = () => {
    setMessages(mockInitialChatMessages);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[500px] max-h-[850px] rounded-3xl bg-slate-950/70 border border-indigo-500/20 backdrop-blur-2xl shadow-2xl overflow-hidden relative">
      {/* Header */}
      <div className="px-6 py-4 bg-slate-900/80 border-b border-indigo-500/15 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <RobotAssistant size="sm" isThinking={isThinking} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-white text-base">AIDA Assistant</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Online • v3.8
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous Academic & Systems Engineering Co-pilot
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-slate-800"
          title="Reset conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 no-scrollbar">
        {messages.map((message) => {
          const isUser = message.sender === 'user';
          return (
            <div
              key={message.id}
              className={cn(
                'flex gap-3 max-w-3xl animate-in fade-in duration-300',
                isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
              )}
            >
              <div
                className={cn(
                  'h-8 w-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-md mt-1',
                  isUser
                    ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white'
                    : 'bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white'
                )}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className="space-y-2 max-w-[85%] sm:max-w-[78%]">
                <div
                  className={cn(
                    'p-4 rounded-2xl text-sm leading-relaxed shadow-lg',
                    isUser
                      ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-tr-sm shadow-indigo-600/20'
                      : 'bg-slate-900/90 border border-indigo-500/20 text-slate-200 rounded-tl-sm backdrop-blur-md'
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>

                  {/* Code snippet display */}
                  {message.codeSnippet && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 font-mono text-xs">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 text-[11px] text-slate-400">
                        <span>Code Reference</span>
                        <button
                          onClick={() => handleCopyCode(message.id, message.codeSnippet!)}
                          className="flex items-center gap-1 hover:text-cyan-300 transition-colors"
                        >
                          {copiedId === message.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-3 overflow-x-auto text-cyan-200 text-xs leading-5">
                        {message.codeSnippet}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Suggested Followups */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {message.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(suggestion)}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-slate-900/80 hover:bg-indigo-950/60 text-cyan-300 hover:text-cyan-200 border border-cyan-500/25 hover:border-cyan-400/50 transition-all text-left"
                      >
                        ⚡ {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isThinking && (
          <div className="flex gap-3 max-w-xl mr-auto animate-in fade-in">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/20 text-slate-400 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>AIDA is synthesizing course materials...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="p-4 bg-slate-900/90 border-t border-indigo-500/15">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask anything about courses, proofs, code, or exams..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isThinking}
            className="flex-1 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all"
          />
          <Button
            type="submit"
            variant="cyan"
            size="md"
            disabled={!inputValue.trim() || isThinking}
            className="px-5 rounded-2xl"
          >
            <Send className="w-4 h-4 mr-1.5" />
            <span>Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
