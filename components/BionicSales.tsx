import React, { useState, useEffect, useRef } from 'react';
import { ObsidianCard, ObsidianButton, ObsidianInput } from './ui/ObsidianElements';
import {
  BrainCircuit, Mic, PhoneOff, Zap, User, AlertTriangle, Activity, MousePointer2,
  Phone, Video, Users, DollarSign, Calendar, Mail, Building, MapPin, Tag,
  TrendingUp, Clock, MessageSquare, FileText, Send, Play, Pause, CheckCircle,
  X, ArrowLeft, Download, Share2, Edit3, MoreVertical, Plus, Search, Filter,
  Headphones, Volume2, VolumeX, Grid3X3, List, BarChart3, Sparkles, Target,
  Briefcase, ExternalLink, ChevronRight, AlertCircle, Database, Bot, Repeat,
  Copy, Eye, Archive, Star, Shield, Workflow, ThumbsUp, ThumbsDown, Heart,
  TrendingDown, Mic2, MicOff, PhoneCall, UserPlus, Settings, Bell, Info
} from 'lucide-react';

// ==================== TYPE DEFINITIONS ====================

type ViewMode = 'pipeline' | 'call' | 'summary';
type LeadStage = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'CLOSING' | 'WON' | 'LOST';
type CallStatus = 'RINGING' | 'ACTIVE' | 'PAUSED' | 'ENDED';
type Sentiment = 'VERY_POSITIVE' | 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'BUYING_SIGNAL' | 'OBJECTION';
type EngagementLevel = 'PEAK' | 'HIGH' | 'MEDIUM' | 'LOW' | 'DISTRACTED';
type SuggestionType = 'script' | 'warning' | 'opportunity' | 'tactic' | 'close';
type PlayCardCategory = 'offer' | 'question' | 'demo' | 'social_proof' | 'objection_handler' | 'close' | 'value_prop';

interface Lead {
  id: string;
  name: string;
  company: string;
  title: string;
  email: string;
  phone: string;
  stage: LeadStage;
  dealValue: number;
  probability: number;
  lastContact: Date;
  notes: string;
  source: string;
  assignedTo: string;
  tags: string[];
  industry: string;
  companySize: string;
  location: string;
  competitors: string[];
  painPoints: string[];
  budget: { min: number; max: number; } | null;
  decisionMakers: string[];
  timeline: string;
  history: InteractionHistory[];
  insights: LeadInsight[];
}

interface InteractionHistory {
  id: string;
  date: Date;
  type: 'call' | 'email' | 'meeting' | 'demo' | 'proposal' | 'note';
  duration?: number;
  outcome: string;
  sentiment?: Sentiment;
  keyTopics: string[];
  nextSteps: string[];
}

interface LeadInsight {
  type: 'risk' | 'opportunity' | 'behavior' | 'competitor';
  title: string;
  description: string;
  confidence: number;
  source: string;
}

interface CallData {
  id: string;
  leadId: string;
  status: CallStatus;
  startTime: Date;
  duration: number;
  transcription: TranscriptionEntry[];
  emotionalMetrics: EmotionalMetrics;
  cyranoSuggestions: CyranoSuggestion[];
  playCards: PlayCard[];
  takeOverAvailable: boolean;
  isAIControlled: boolean;
  recordingActive: boolean;
  audioLevel: number;
}

interface TranscriptionEntry {
  id: string;
  timestamp: Date;
  speaker: 'agent' | 'client';
  text: string;
  sentiment: Sentiment;
  confidence: number;
  keywords: string[];
  emotions: string[];
  intent?: string;
}

interface EmotionalMetrics {
  trust: number;
  stress: number;
  enthusiasm: number;
  confusion: number;
  engagement: EngagementLevel;
  sentiment: Sentiment;
  buyingIntent: number;
  objectionLevel: number;
  history: { timestamp: Date; trust: number; stress: number; enthusiasm: number; }[];
}

interface CyranoSuggestion {
  id: string;
  type: SuggestionType;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  text: string;
  timestamp: Date;
  reasoning: string;
  action?: string;
  alternatives?: string[];
}

interface PlayCard {
  id: string;
  label: string;
  category: PlayCardCategory;
  description: string;
  action: string;
  enabled: boolean;
  cooldown?: number;
  successRate: number;
  context?: string;
  tags: string[];
}

interface CallSummary {
  leadId: string;
  callId: string;
  duration: number;
  outcome: 'won' | 'advancing' | 'follow_up' | 'objection' | 'lost' | 'no_show';
  sentiment: Sentiment;
  keyMoments: KeyMoment[];
  topicsDiscussed: string[];
  objectionsRaised: string[];
  objectionsHandled: string[];
  buyingSignals: string[];
  nextSteps: NextStep[];
  aiRecommendations: string[];
  recordingUrl?: string;
  transcriptUrl?: string;
  crmUpdates: CRMUpdate[];
}

interface KeyMoment {
  timestamp: Date;
  type: 'buying_signal' | 'objection' | 'breakthrough' | 'concern' | 'commitment';
  description: string;
  quote: string;
}

interface NextStep {
  action: string;
  deadline: Date;
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  automated: boolean;
}

interface CRMUpdate {
  field: string;
  oldValue: string;
  newValue: string;
  reason: string;
}

// ==================== SAMPLE DATA ====================

const SAMPLE_LEADS: Lead[] = [
  {
    id: 'L-001',
    name: 'Sarah Chen',
    company: 'TechCorp Industries',
    title: 'VP of Operations',
    email: 'sarah.chen@techcorp.com',
    phone: '+1 (555) 123-4567',
    stage: 'CLOSING',
    dealValue: 125000,
    probability: 85,
    lastContact: new Date(Date.now() - 3600000),
    notes: 'Hot lead. Budget approved. Final decision expected this week. Security is primary concern.',
    source: 'LinkedIn Outreach',
    assignedTo: 'John Doe',
    tags: ['VIP', 'Enterprise', 'Hot Lead', 'C-Level'],
    industry: 'SaaS',
    companySize: '200-500',
    location: 'San Francisco, CA',
    competitors: ['Competitor A', 'Legacy System'],
    painPoints: ['High operational costs', 'Security concerns', 'Scalability issues'],
    budget: { min: 100000, max: 150000 },
    decisionMakers: ['Sarah Chen (VP Ops)', 'Michael Lee (CTO)', 'Board'],
    timeline: 'Q1 2025',
    history: [
      {
        id: 'h1',
        date: new Date(Date.now() - 86400000 * 14),
        type: 'email',
        outcome: 'Positive response to cold outreach',
        sentiment: 'POSITIVE',
        keyTopics: ['Cost reduction', 'Security'],
        nextSteps: ['Schedule discovery call']
      },
      {
        id: 'h2',
        date: new Date(Date.now() - 86400000 * 10),
        type: 'call',
        duration: 45,
        outcome: 'Discovery call - identified pain points',
        sentiment: 'POSITIVE',
        keyTopics: ['Current system limitations', 'ROI expectations', 'Timeline'],
        nextSteps: ['Send case studies', 'Schedule demo']
      },
      {
        id: 'h3',
        date: new Date(Date.now() - 86400000 * 5),
        type: 'demo',
        duration: 60,
        outcome: 'Very engaged - asked detailed questions',
        sentiment: 'VERY_POSITIVE',
        keyTopics: ['Security features', 'Integration capabilities', 'Pricing'],
        nextSteps: ['Provide security whitepaper', 'Draft proposal']
      },
      {
        id: 'h4',
        date: new Date(Date.now() - 86400000 * 2),
        type: 'proposal',
        outcome: 'Proposal sent - awaiting feedback',
        sentiment: 'NEUTRAL',
        keyTopics: ['Pricing tiers', 'Implementation timeline', 'Support SLA'],
        nextSteps: ['Follow-up call to discuss proposal']
      }
    ],
    insights: [
      {
        type: 'opportunity',
        title: 'Strong Buying Intent',
        description: 'Multiple buying signals detected across last 3 interactions. Budget confirmed.',
        confidence: 92,
        source: 'AI Analysis'
      },
      {
        type: 'risk',
        title: 'Security Concerns',
        description: 'Security mentioned in every conversation. Ensure ISO certifications are highlighted.',
        confidence: 88,
        source: 'Conversation Analysis'
      },
      {
        type: 'competitor',
        title: 'Evaluating Competitor A',
        description: 'Mentioned Competitor A during demo. Focus on differentiation and ROI.',
        confidence: 75,
        source: 'Call Transcript'
      }
    ]
  },
  {
    id: 'L-002',
    name: 'Michael Rodriguez',
    company: 'Globex Solutions',
    title: 'CTO',
    email: 'm.rodriguez@globex.com',
    phone: '+1 (555) 234-5678',
    stage: 'PROPOSAL',
    dealValue: 78000,
    probability: 60,
    lastContact: new Date(Date.now() - 7200000),
    notes: 'Technical buyer. Comparing with 2 other vendors. Needs custom API integration.',
    source: 'Referral',
    assignedTo: 'Jane Smith',
    tags: ['Technical', 'Custom Integration', 'Mid-Market'],
    industry: 'FinTech',
    companySize: '50-200',
    location: 'Austin, TX',
    competitors: ['Competitor B', 'Build In-House'],
    painPoints: ['Complex integration requirements', 'Data migration', 'Training needs'],
    budget: { min: 60000, max: 90000 },
    decisionMakers: ['Michael Rodriguez (CTO)', 'Jessica Park (Head of Eng)'],
    timeline: 'Q2 2025',
    history: [
      {
        id: 'h5',
        date: new Date(Date.now() - 86400000 * 12),
        type: 'call',
        duration: 30,
        outcome: 'Intro call via referral',
        sentiment: 'NEUTRAL',
        keyTopics: ['Technical requirements', 'API capabilities'],
        nextSteps: ['Schedule technical demo']
      },
      {
        id: 'h6',
        date: new Date(Date.now() - 86400000 * 5),
        type: 'demo',
        duration: 90,
        outcome: 'Deep technical dive - positive',
        sentiment: 'POSITIVE',
        keyTopics: ['API documentation', 'Custom integrations', 'Scalability'],
        nextSteps: ['Provide technical documentation', 'Draft custom proposal']
      },
      {
        id: 'h7',
        date: new Date(Date.now() - 86400000 * 2),
        type: 'proposal',
        outcome: 'Custom proposal sent',
        sentiment: 'NEUTRAL',
        keyTopics: ['Custom integration scope', 'Implementation phases', 'Support model'],
        nextSteps: ['Technical review meeting']
      }
    ],
    insights: [
      {
        type: 'behavior',
        title: 'Detail-Oriented Decision Maker',
        description: 'Asks very specific technical questions. Provide comprehensive documentation.',
        confidence: 90,
        source: 'Behavioral Analysis'
      },
      {
        type: 'risk',
        title: 'Build vs Buy Decision',
        description: 'Considering building in-house. Emphasize time-to-market and TCO.',
        confidence: 70,
        source: 'Conversation Context'
      }
    ]
  },
  {
    id: 'L-003',
    name: 'Emily Watson',
    company: 'Acme Corp',
    title: 'Head of Marketing',
    email: 'e.watson@acme.com',
    phone: '+1 (555) 345-6789',
    stage: 'QUALIFIED',
    dealValue: 42000,
    probability: 40,
    lastContact: new Date(Date.now() - 86400000),
    notes: 'Budget cycle starts Q1 2025. Interested but not urgent. Follow up in January.',
    source: 'Webinar',
    assignedTo: 'John Doe',
    tags: ['Marketing', 'Q1 2025', 'Warm Lead'],
    industry: 'E-commerce',
    companySize: '20-50',
    location: 'Seattle, WA',
    competitors: [],
    painPoints: ['Manual processes', 'Data silos', 'Reporting limitations'],
    budget: { min: 30000, max: 50000 },
    decisionMakers: ['Emily Watson (Head of Marketing)', 'CEO'],
    timeline: 'Q1 2025',
    history: [
      {
        id: 'h8',
        date: new Date(Date.now() - 86400000 * 20),
        type: 'note',
        outcome: 'Attended webinar - engaged participant',
        sentiment: 'POSITIVE',
        keyTopics: ['Automation', 'Analytics'],
        nextSteps: ['Follow-up email']
      },
      {
        id: 'h9',
        date: new Date(Date.now() - 86400000 * 10),
        type: 'call',
        duration: 25,
        outcome: 'Qualification call - budget timing issue',
        sentiment: 'NEUTRAL',
        keyTopics: ['Budget cycle', 'Use cases', 'ROI'],
        nextSteps: ['Schedule for Q1 follow-up']
      }
    ],
    insights: [
      {
        type: 'opportunity',
        title: 'Budget Cycle Timing',
        description: 'Budget resets in Q1. Perfect timing for re-engagement in January.',
        confidence: 95,
        source: 'Lead Notes'
      }
    ]
  },
  {
    id: 'L-004',
    name: 'David Park',
    company: 'Initech LLC',
    title: 'CEO',
    email: 'david@initech.com',
    phone: '+1 (555) 456-7890',
    stage: 'CONTACTED',
    dealValue: 35000,
    probability: 25,
    lastContact: new Date(Date.now() - 172800000),
    notes: 'Cold outreach. Left 2 voicemails. Sent follow-up email. Low engagement so far.',
    source: 'Cold Outreach',
    assignedTo: 'Jane Smith',
    tags: ['CEO', 'Small Business', 'Cold'],
    industry: 'Consulting',
    companySize: '10-20',
    location: 'Denver, CO',
    competitors: [],
    painPoints: [],
    budget: null,
    decisionMakers: ['David Park (CEO)'],
    timeline: 'Unknown',
    history: [
      {
        id: 'h10',
        date: new Date(Date.now() - 86400000 * 7),
        type: 'call',
        outcome: 'No answer - left voicemail',
        sentiment: 'NEUTRAL',
        keyTopics: [],
        nextSteps: ['Follow-up call']
      },
      {
        id: 'h11',
        date: new Date(Date.now() - 86400000 * 4),
        type: 'call',
        outcome: 'No answer - left voicemail',
        sentiment: 'NEUTRAL',
        keyTopics: [],
        nextSteps: ['Send email']
      },
      {
        id: 'h12',
        date: new Date(Date.now() - 86400000 * 2),
        type: 'email',
        outcome: 'Follow-up email sent',
        sentiment: 'NEUTRAL',
        keyTopics: ['Value proposition', 'Case study'],
        nextSteps: ['Wait for response']
      }
    ],
    insights: []
  },
  {
    id: 'L-005',
    name: 'Lisa Anderson',
    company: 'Stark Industries',
    title: 'Director of Sales',
    email: 'l.anderson@stark.com',
    phone: '+1 (555) 567-8901',
    stage: 'NEW',
    dealValue: 95000,
    probability: 15,
    lastContact: new Date(Date.now() - 1800000),
    notes: 'Inbound lead from website. Requested demo. High-value opportunity - prioritize.',
    source: 'Website Form',
    assignedTo: 'John Doe',
    tags: ['Inbound', 'Demo Request', 'High Value'],
    industry: 'Manufacturing',
    companySize: '500+',
    location: 'Chicago, IL',
    competitors: [],
    painPoints: ['Sales efficiency', 'Lead tracking', 'Forecasting accuracy'],
    budget: null,
    decisionMakers: ['Lisa Anderson (Dir of Sales)', 'VP Sales', 'CFO'],
    timeline: 'ASAP',
    history: [
      {
        id: 'h13',
        date: new Date(Date.now() - 1800000),
        type: 'note',
        outcome: 'Demo request form submitted',
        sentiment: 'POSITIVE',
        keyTopics: ['Demo request', 'Enterprise features'],
        nextSteps: ['Schedule demo call']
      }
    ],
    insights: [
      {
        type: 'opportunity',
        title: 'High-Intent Inbound Lead',
        description: 'Self-qualified lead requesting demo. Expressed interest in enterprise features.',
        confidence: 85,
        source: 'Form Submission'
      }
    ]
  }
];

const ACTIVE_CALL_LEAD = SAMPLE_LEADS[0]; // Sarah Chen

const SAMPLE_TRANSCRIPTION: TranscriptionEntry[] = [
  {
    id: 't1',
    timestamp: new Date(Date.now() - 300000),
    speaker: 'agent',
    text: "Hi Sarah, thanks so much for taking the time to connect today. How are you doing?",
    sentiment: 'NEUTRAL',
    confidence: 0.95,
    keywords: ['thanks', 'connect'],
    emotions: ['friendly', 'professional'],
    intent: 'greeting'
  },
  {
    id: 't2',
    timestamp: new Date(Date.now() - 290000),
    speaker: 'client',
    text: "I'm doing well, thank you! I've been looking forward to this conversation. I reviewed the proposal you sent over.",
    sentiment: 'POSITIVE',
    confidence: 0.92,
    keywords: ['looking forward', 'reviewed', 'proposal'],
    emotions: ['enthusiastic', 'engaged'],
    intent: 'engagement'
  },
  {
    id: 't3',
    timestamp: new Date(Date.now() - 280000),
    speaker: 'agent',
    text: "That's wonderful to hear! I'd love to walk through any questions you have. What stood out to you from the proposal?",
    sentiment: 'POSITIVE',
    confidence: 0.94,
    keywords: ['questions', 'stood out'],
    emotions: ['attentive'],
    intent: 'discovery'
  },
  {
    id: 't4',
    timestamp: new Date(Date.now() - 270000),
    speaker: 'client',
    text: "The cost savings projections are impressive. Our current system is honestly bleeding us dry - we're spending nearly $200K annually just on maintenance.",
    sentiment: 'NEGATIVE',
    confidence: 0.90,
    keywords: ['cost savings', 'bleeding', 'maintenance', '$200K'],
    emotions: ['frustrated', 'concerned'],
    intent: 'pain_point'
  },
  {
    id: 't5',
    timestamp: new Date(Date.now() - 260000),
    speaker: 'agent',
    text: "I completely understand that pain point. Many of our clients were in similar situations. Companies like Global Tech actually saw a 43% reduction in operational costs within the first quarter after switching.",
    sentiment: 'NEUTRAL',
    confidence: 0.96,
    keywords: ['pain point', 'Global Tech', '43%', 'reduction'],
    emotions: ['empathetic', 'confident'],
    intent: 'social_proof'
  },
  {
    id: 't6',
    timestamp: new Date(Date.now() - 250000),
    speaker: 'client',
    text: "That's exactly the kind of result we need. But I have to be honest - my CTO, Michael, has some serious security concerns. We handle sensitive customer data, and he's very cautious.",
    sentiment: 'NEUTRAL',
    confidence: 0.93,
    keywords: ['result', 'security concerns', 'sensitive data', 'CTO'],
    emotions: ['concerned', 'cautious'],
    intent: 'objection'
  },
  {
    id: 't7',
    timestamp: new Date(Date.now() - 240000),
    speaker: 'agent',
    text: "That's absolutely the right mindset, and security is non-negotiable when dealing with customer data. We're ISO 27001 and SOC 2 Type II certified, and we use bank-level AES-256 encryption for all data at rest and in transit.",
    sentiment: 'NEUTRAL',
    confidence: 0.97,
    keywords: ['security', 'ISO 27001', 'SOC 2', 'AES-256', 'encryption'],
    emotions: ['authoritative', 'reassuring'],
    intent: 'objection_handling'
  },
  {
    id: 't8',
    timestamp: new Date(Date.now() - 230000),
    speaker: 'client',
    text: "Okay, that's reassuring. Michael will want to see the detailed security documentation though.",
    sentiment: 'POSITIVE',
    confidence: 0.91,
    keywords: ['reassuring', 'security documentation'],
    emotions: ['satisfied', 'analytical'],
    intent: 'requirement'
  },
  {
    id: 't9',
    timestamp: new Date(Date.now() - 220000),
    speaker: 'agent',
    text: "Absolutely - I'll send over our complete security whitepaper and compliance certifications right after this call. We can also arrange a technical deep dive with your CTO and our Chief Security Officer if that would be helpful.",
    sentiment: 'POSITIVE',
    confidence: 0.95,
    keywords: ['whitepaper', 'certifications', 'technical deep dive', 'CSO'],
    emotions: ['accommodating', 'solution-oriented'],
    intent: 'commitment'
  },
  {
    id: 't10',
    timestamp: new Date(Date.now() - 210000),
    speaker: 'client',
    text: "That would be perfect. What about the implementation timeline? How quickly can we get this deployed?",
    sentiment: 'POSITIVE',
    confidence: 0.94,
    keywords: ['implementation', 'timeline', 'deployed', 'quickly'],
    emotions: ['eager', 'forward-thinking'],
    intent: 'logistics'
  },
  {
    id: 't11',
    timestamp: new Date(Date.now() - 200000),
    speaker: 'agent',
    text: "For an organization your size, we typically complete full deployment within 2-3 weeks. Our implementation team handles all the heavy lifting - data migration, integration setup, and user training.",
    sentiment: 'NEUTRAL',
    confidence: 0.96,
    keywords: ['2-3 weeks', 'deployment', 'migration', 'training'],
    emotions: ['informative'],
    intent: 'information'
  },
  {
    id: 't12',
    timestamp: new Date(Date.now() - 190000),
    speaker: 'client',
    text: "That timeline works well for us. We're aiming to have everything in place before Q2. This is looking very promising.",
    sentiment: 'VERY_POSITIVE',
    confidence: 0.89,
    keywords: ['works well', 'Q2', 'promising'],
    emotions: ['optimistic', 'decisive'],
    intent: 'buying_signal'
  },
  {
    id: 't13',
    timestamp: new Date(Date.now() - 180000),
    speaker: 'agent',
    text: "I'm thrilled to hear that! Based on everything we've discussed, it sounds like we're aligned on the value and timeline. What would be the best next step from your perspective?",
    sentiment: 'POSITIVE',
    confidence: 0.92,
    keywords: ['aligned', 'next step'],
    emotions: ['enthusiastic', 'closing'],
    intent: 'trial_close'
  },
  {
    id: 't14',
    timestamp: new Date(Date.now() - 170000),
    speaker: 'client',
    text: "I need to run this by our board, but I'd like to move forward with the enterprise plan. Can you walk me through the contract terms?",
    sentiment: 'BUYING_SIGNAL',
    confidence: 0.88,
    keywords: ['move forward', 'enterprise plan', 'contract terms', 'board'],
    emotions: ['decisive', 'ready'],
    intent: 'buying_signal'
  },
  {
    id: 't15',
    timestamp: new Date(Date.now() - 160000),
    speaker: 'agent',
    text: "Absolutely! The enterprise plan includes everything we've discussed - unlimited users, premium support, dedicated account manager, and full API access. It's a 12-month commitment with the option to expand. The total investment is $125,000 annually.",
    sentiment: 'NEUTRAL',
    confidence: 0.97,
    keywords: ['enterprise plan', 'unlimited', 'premium support', '$125,000'],
    emotions: ['clear', 'professional'],
    intent: 'pricing'
  },
  {
    id: 't16',
    timestamp: new Date(Date.now() - 150000),
    speaker: 'client',
    text: "That's within our approved budget. I think we can make this work. Let me present this to the board this Thursday, and I should have an answer for you by Friday.",
    sentiment: 'BUYING_SIGNAL',
    confidence: 0.91,
    keywords: ['approved budget', 'make this work', 'board', 'Thursday', 'Friday'],
    emotions: ['committed', 'confident'],
    intent: 'commitment'
  },
  {
    id: 't17',
    timestamp: new Date(Date.now() - 140000),
    speaker: 'agent',
    text: "That's fantastic, Sarah! To help with your board presentation, I can prepare a one-page executive summary highlighting the ROI, timeline, and key differentiators. Would that be useful?",
    sentiment: 'POSITIVE',
    confidence: 0.94,
    keywords: ['board presentation', 'executive summary', 'ROI'],
    emotions: ['helpful', 'supportive'],
    intent: 'value_add'
  },
  {
    id: 't18',
    timestamp: new Date(Date.now() - 130000),
    speaker: 'client',
    text: "Yes, that would be incredibly helpful! The board loves concise summaries with clear numbers.",
    sentiment: 'VERY_POSITIVE',
    confidence: 0.90,
    keywords: ['helpful', 'concise', 'clear numbers'],
    emotions: ['appreciative', 'eager'],
    intent: 'engagement'
  },
  {
    id: 't19',
    timestamp: new Date(Date.now() - 120000),
    speaker: 'agent',
    text: "Perfect! I'll have that in your inbox within the hour, along with the security documentation. Is there anything else I can provide to support your decision-making process?",
    sentiment: 'POSITIVE',
    confidence: 0.95,
    keywords: ['inbox', 'hour', 'support', 'decision-making'],
    emotions: ['accommodating', 'thorough'],
    intent: 'support'
  },
  {
    id: 't20',
    timestamp: new Date(Date.now() - 110000),
    speaker: 'client',
    text: "I think that covers everything. I'm feeling really good about this. Thank you for being so thorough and responsive throughout this process.",
    sentiment: 'VERY_POSITIVE',
    confidence: 0.93,
    keywords: ['covers everything', 'feeling good', 'thorough', 'responsive'],
    emotions: ['satisfied', 'grateful', 'confident'],
    intent: 'positive_sentiment'
  }
];

const SAMPLE_SUGGESTIONS: CyranoSuggestion[] = [
  {
    id: 's1',
    type: 'script',
    priority: 'medium',
    title: 'Social Proof Opportunity',
    text: 'Client mentioned cost concerns - reference Global Tech case study showing 43% cost reduction',
    timestamp: new Date(Date.now() - 240000),
    reasoning: 'Pain point around high costs detected. Social proof will build credibility.',
    action: 'Share Global Tech case study'
  },
  {
    id: 's2',
    type: 'warning',
    priority: 'critical',
    title: 'Security Objection Detected',
    text: 'CTO has security concerns - emphasize ISO 27001, SOC 2, and encryption standards before discussing pricing',
    timestamp: new Date(Date.now() - 220000),
    reasoning: 'Security mentioned as potential blocker. Must address before moving forward.',
    action: 'Send security whitepaper + offer CSO call',
    alternatives: ['Schedule security audit walkthrough', 'Provide reference customer for security validation']
  },
  {
    id: 's3',
    type: 'opportunity',
    priority: 'high',
    title: 'Timeline Interest',
    text: 'Client asked about implementation timeline - shows urgency and buying intent',
    timestamp: new Date(Date.now() - 200000),
    reasoning: 'Questions about logistics indicate they are mentally past the "if" and into the "when"',
    action: 'Confirm 2-3 week timeline and offer dedicated implementation manager'
  },
  {
    id: 's4',
    type: 'close',
    priority: 'critical',
    title: '🎯 BUYING SIGNAL DETECTED',
    text: 'Client said "move forward" and "within budget" - CLOSE THE DEAL NOW! Ask for commitment.',
    timestamp: new Date(Date.now() - 150000),
    reasoning: 'Multiple strong buying signals: "move forward", "within budget", "make this work", specific timeline for decision',
    action: 'Trial close: "What would be the best next step?"',
    alternatives: ['Ask: "Should we draft the contract?"', 'Offer: "Let me prepare the paperwork"']
  },
  {
    id: 's5',
    type: 'tactic',
    priority: 'high',
    title: 'Support Board Decision',
    text: 'Board presentation Thursday - offer executive summary and ROI one-pager to support internal champion',
    timestamp: new Date(Date.now() - 130000),
    reasoning: 'Client is your champion but needs ammunition for board. Make them look good.',
    action: 'Create executive summary within 1 hour'
  }
];

const SAMPLE_PLAY_CARDS: PlayCard[] = [
  {
    id: 'pc1',
    label: 'Offer 10% Early-Bird Discount',
    category: 'offer',
    description: 'Time-limited discount for commitment within 7 days',
    action: 'apply_discount',
    enabled: true,
    cooldown: 0,
    successRate: 72,
    context: 'Use when deal is stalled on price or to create urgency',
    tags: ['pricing', 'urgency']
  },
  {
    id: 'pc2',
    label: 'Share Security Whitepaper',
    category: 'objection_handler',
    description: 'Comprehensive security & compliance documentation',
    action: 'send_document',
    enabled: true,
    successRate: 88,
    context: 'Address security and compliance concerns',
    tags: ['security', 'trust']
  },
  {
    id: 'pc3',
    label: 'Show Global Tech Case Study',
    category: 'social_proof',
    description: '43% cost reduction case study with ROI breakdown',
    action: 'share_screen',
    enabled: true,
    successRate: 85,
    context: 'Build credibility and demonstrate proven results',
    tags: ['roi', 'proof']
  },
  {
    id: 'pc4',
    label: 'Ask: "What\'s your timeline?"',
    category: 'question',
    description: 'Uncover urgency and decision-making process',
    action: 'insert_question',
    enabled: true,
    successRate: 90,
    context: 'Qualification and closing readiness',
    tags: ['qualification', 'timeline']
  },
  {
    id: 'pc5',
    label: 'Schedule Technical Deep Dive',
    category: 'demo',
    description: 'Arrange call with CSO and engineering team',
    action: 'create_meeting',
    enabled: true,
    successRate: 78,
    context: 'For technical buyers or security concerns',
    tags: ['technical', 'security']
  },
  {
    id: 'pc6',
    label: 'Send Executive Summary',
    category: 'value_prop',
    description: 'One-page board presentation with ROI',
    action: 'generate_document',
    enabled: true,
    successRate: 82,
    context: 'Support internal champion\'s presentation',
    tags: ['champion', 'board']
  },
  {
    id: 'pc7',
    label: 'Trial Close: "Next Steps?"',
    category: 'close',
    description: 'Soft close to gauge commitment level',
    action: 'insert_question',
    enabled: true,
    successRate: 75,
    context: 'After addressing objections and building value',
    tags: ['closing', 'commitment']
  },
  {
    id: 'pc8',
    label: 'Offer Reference Call',
    category: 'social_proof',
    description: 'Connect with similar customer for validation',
    action: 'create_introduction',
    enabled: true,
    successRate: 80,
    context: 'Build trust through peer validation',
    tags: ['trust', 'validation']
  },
  {
    id: 'pc9',
    label: 'Handle "Price Too High"',
    category: 'objection_handler',
    description: 'ROI calculator showing payback period',
    action: 'share_screen',
    enabled: true,
    successRate: 68,
    context: 'When prospect raises price objection',
    tags: ['pricing', 'roi']
  },
  {
    id: 'pc10',
    label: 'Ask: "What would success look like?"',
    category: 'question',
    description: 'Uncover desired outcomes and success criteria',
    action: 'insert_question',
    enabled: true,
    successRate: 92,
    context: 'Early discovery or value alignment',
    tags: ['discovery', 'value']
  }
];

// ==================== MAIN COMPONENT ====================

const BionicSales: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('pipeline');
  const [leads, setLeads] = useState<Lead[]>(SAMPLE_LEADS);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [callData, setCallData] = useState<CallData | null>(null);
  const [pipelineView, setPipelineView] = useState<'kanban' | 'list'>('kanban');
  const [callSummary, setCallSummary] = useState<CallSummary | null>(null);

  // Canvas refs for visualizations
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const emotionChartCanvasRef = useRef<HTMLCanvasElement>(null);

  // Call simulation state
  const [callDuration, setCallDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  // Simulated real-time updates
  const [audioLevel, setAudioLevel] = useState(0);

  // Call timer
  useEffect(() => {
    if (viewMode === 'call' && callData?.status === 'ACTIVE') {
      const interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [viewMode, callData?.status]);

  // Waveform visualization
  useEffect(() => {
    if (viewMode !== 'call' || !callData) return;

    const canvas = waveformCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    let time = 0;
    const bars = 60;
    const barWidth = width / bars;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      time += 0.05;

      for (let i = 0; i < bars; i++) {
        const x = i * barWidth;
        const normalizedHeight = (Math.sin(time + i * 0.3) * 0.5 + 0.5) * 0.6 + Math.random() * 0.4;
        const barHeight = normalizedHeight * height * 0.8;
        const y = (height - barHeight) / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, 'rgba(106, 79, 251, 0.8)');
        gradient.addColorStop(1, 'rgba(106, 79, 251, 0.3)');

        ctx.fillStyle = gradient;
        ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
      }

      requestAnimationFrame(animate);
    };

    animate();
  }, [viewMode, callData]);

  // Emotion chart
  useEffect(() => {
    if (viewMode !== 'call' || !callData) return;

    const canvas = emotionChartCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const padding = 10;

    const history = callData.emotionalMetrics.history;
    if (history.length === 0) return;

    ctx.clearRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (height - padding * 2) * (i / 4);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw trust line
    ctx.strokeStyle = '#45FF9A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    history.forEach((point, i) => {
      const x = padding + (width - padding * 2) * (i / (history.length - 1));
      const y = padding + (height - padding * 2) * (1 - point.trust / 100);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw stress line
    ctx.strokeStyle = '#FF4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    history.forEach((point, i) => {
      const x = padding + (width - padding * 2) * (i / (history.length - 1));
      const y = padding + (height - padding * 2) * (1 - point.stress / 100);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw enthusiasm line
    ctx.strokeStyle = '#6A4FFB';
    ctx.lineWidth = 2;
    ctx.beginPath();
    history.forEach((point, i) => {
      const x = padding + (width - padding * 2) * (i / (history.length - 1));
      const y = padding + (height - padding * 2) * (1 - point.enthusiasm / 100);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

  }, [viewMode, callData]);

  // Initialize call
  const startCall = (lead: Lead) => {
    setSelectedLead(lead);

    // Generate emotional metrics history
    const history: { timestamp: Date; trust: number; stress: number; enthusiasm: number; }[] = [];
    for (let i = 0; i < 20; i++) {
      history.push({
        timestamp: new Date(Date.now() - (20 - i) * 15000),
        trust: 60 + Math.random() * 20 + i,
        stress: 30 - i * 0.5 + Math.random() * 10,
        enthusiasm: 50 + i * 1.5 + Math.random() * 15
      });
    }

    setCallData({
      id: `call-${Date.now()}`,
      leadId: lead.id,
      status: 'ACTIVE',
      startTime: new Date(),
      duration: 0,
      transcription: SAMPLE_TRANSCRIPTION,
      emotionalMetrics: {
        trust: 82,
        stress: 14,
        enthusiasm: 78,
        confusion: 8,
        engagement: 'HIGH',
        sentiment: 'VERY_POSITIVE',
        buyingIntent: 88,
        objectionLevel: 22,
        history
      },
      cyranoSuggestions: SAMPLE_SUGGESTIONS,
      playCards: SAMPLE_PLAY_CARDS,
      takeOverAvailable: true,
      isAIControlled: false,
      recordingActive: true,
      audioLevel: 0
    });
    setCallDuration(320); // 5:20 into call
    setViewMode('call');
  };

  const endCall = () => {
    if (!selectedLead || !callData) return;

    const summary: CallSummary = {
      leadId: selectedLead.id,
      callId: callData.id,
      duration: callDuration,
      outcome: 'advancing',
      sentiment: 'VERY_POSITIVE',
      keyMoments: [
        {
          timestamp: new Date(Date.now() - 270000),
          type: 'concern',
          description: 'Cost concerns raised',
          quote: "Our current system is bleeding us dry - $200K annually on maintenance"
        },
        {
          timestamp: new Date(Date.now() - 250000),
          type: 'objection',
          description: 'Security objection from CTO',
          quote: "My CTO has serious security concerns about sensitive customer data"
        },
        {
          timestamp: new Date(Date.now() - 190000),
          type: 'buying_signal',
          description: 'Timeline alignment confirmed',
          quote: "That timeline works well for us. This is looking very promising."
        },
        {
          timestamp: new Date(Date.now() - 170000),
          type: 'commitment',
          description: 'Intent to move forward expressed',
          quote: "I'd like to move forward with the enterprise plan"
        },
        {
          timestamp: new Date(Date.now() - 150000),
          type: 'buying_signal',
          description: 'Budget confirmed, board presentation scheduled',
          quote: "Within our approved budget. I'll present to the board Thursday."
        }
      ],
      topicsDiscussed: ['Cost savings', 'Security & compliance', 'Implementation timeline', 'Enterprise features', 'Pricing', 'Board approval process'],
      objectionsRaised: ['Security concerns from CTO', 'Need for detailed compliance documentation'],
      objectionsHandled: ['Security addressed with ISO 27001, SOC 2, AES-256 encryption', 'Offered CSO technical deep dive'],
      buyingSignals: [
        'Reviewed proposal in advance',
        'Asked about implementation timeline',
        'Confirmed budget approval',
        'Said "move forward"',
        'Scheduled board presentation with specific date',
        'Requested executive summary for board'
      ],
      nextSteps: [
        {
          action: 'Send executive summary for board presentation',
          deadline: new Date(Date.now() + 3600000), // 1 hour
          priority: 'high',
          assignedTo: 'John Doe',
          automated: false
        },
        {
          action: 'Email security whitepaper and compliance certifications',
          deadline: new Date(Date.now() + 3600000),
          priority: 'high',
          assignedTo: 'John Doe',
          automated: true
        },
        {
          action: 'Schedule CSO technical call with CTO Michael',
          deadline: new Date(Date.now() + 86400000 * 2),
          priority: 'medium',
          assignedTo: 'Jane Smith',
          automated: false
        },
        {
          action: 'Follow up after board presentation (Friday)',
          deadline: new Date(Date.now() + 86400000 * 3),
          priority: 'critical',
          assignedTo: 'John Doe',
          automated: true
        }
      ],
      aiRecommendations: [
        'Strong buying intent detected (88%). High probability of close.',
        'Sarah is your internal champion - support her board presentation.',
        'Security is the final hurdle - prioritize CTO technical call.',
        'Move deal to "Closing" stage and increase probability to 90%.',
        'Schedule contract review meeting for next week to maintain momentum.'
      ],
      recordingUrl: '/recordings/call-20250112-001.mp3',
      transcriptUrl: '/transcripts/call-20250112-001.txt',
      crmUpdates: [
        {
          field: 'Stage',
          oldValue: 'PROPOSAL',
          newValue: 'CLOSING',
          reason: 'Buying signals detected: budget confirmed, board presentation scheduled'
        },
        {
          field: 'Probability',
          oldValue: '60%',
          newValue: '90%',
          reason: 'Strong commitment to move forward, timeline confirmed, budget approved'
        },
        {
          field: 'Next Steps',
          oldValue: 'Follow up on proposal',
          newValue: 'Support board presentation, schedule CSO call',
          reason: 'Specific action items identified during call'
        },
        {
          field: 'Decision Timeline',
          oldValue: 'Q1 2025',
          newValue: 'Board decision Friday (3 days)',
          reason: 'Client provided specific decision date'
        }
      ]
    };

    setCallSummary(summary);
    setViewMode('summary');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSentimentColor = (sentiment: Sentiment) => {
    switch (sentiment) {
      case 'VERY_POSITIVE': return '#45FF9A';
      case 'POSITIVE': return '#45FF9A';
      case 'BUYING_SIGNAL': return '#45FF9A';
      case 'NEUTRAL': return '#FFAA00';
      case 'NEGATIVE': return '#FF4444';
      case 'OBJECTION': return '#FF4444';
      default: return '#FFFFFF';
    }
  };

  const getSentimentLabel = (sentiment: Sentiment) => {
    switch (sentiment) {
      case 'VERY_POSITIVE': return 'Very Positive';
      case 'POSITIVE': return 'Positive';
      case 'BUYING_SIGNAL': return '🎯 Buying Signal';
      case 'NEUTRAL': return 'Neutral';
      case 'NEGATIVE': return 'Negative';
      case 'OBJECTION': return '⚠️ Objection';
      default: return sentiment;
    }
  };

  // ==================== RENDER FUNCTIONS ====================

  const renderPipeline = () => {
    const stages: LeadStage[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'CLOSING'];
    const leadsByStage = stages.reduce((acc, stage) => {
      acc[stage] = leads.filter(l => l.stage === stage);
      return acc;
    }, {} as Record<LeadStage, Lead[]>);

    const totalValue = leads.reduce((sum, l) => sum + l.dealValue, 0);
    const weightedValue = leads.reduce((sum, l) => sum + (l.dealValue * l.probability / 100), 0);

    return (
      <div className="w-full h-full flex flex-col gap-4">
        {/* Stats Row */}
        <div className="grid grid-cols-6 gap-4">
          <ObsidianCard className="text-center">
            <p className="text-xs text-obsidian-text-muted uppercase tracking-wider mb-1">Total Pipeline</p>
            <p className="text-2xl font-light text-white">${(totalValue / 1000).toFixed(0)}K</p>
          </ObsidianCard>
          <ObsidianCard className="text-center">
            <p className="text-xs text-obsidian-text-muted uppercase tracking-wider mb-1">Weighted Value</p>
            <p className="text-2xl font-light text-obsidian-accent">${(weightedValue / 1000).toFixed(0)}K</p>
          </ObsidianCard>
          {stages.map(stage => (
            <ObsidianCard key={stage} className="text-center">
              <p className="text-xs text-obsidian-text-muted uppercase tracking-wider mb-1">{stage.replace('_', ' ')}</p>
              <p className="text-2xl font-light text-white">{leadsByStage[stage].length}</p>
              <p className="text-xs text-obsidian-text-muted mt-1">
                ${(leadsByStage[stage].reduce((sum, l) => sum + l.dealValue, 0) / 1000).toFixed(0)}K
              </p>
            </ObsidianCard>
          ))}
        </div>

        {/* Kanban Board */}
        {pipelineView === 'kanban' ? (
          <div className="flex-1 grid grid-cols-5 gap-4 overflow-hidden">
            {stages.map(stage => (
              <div key={stage} className="flex flex-col overflow-hidden">
                <div className="mb-3 pb-2 border-b border-white/10">
                  <h3 className="text-xs text-obsidian-text-muted uppercase tracking-wider font-medium">
                    {stage.replace('_', ' ')} ({leadsByStage[stage].length})
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {leadsByStage[stage].map(lead => (
                    <ObsidianCard
                      key={lead.id}
                      className="cursor-pointer hover:border-obsidian-accent/50 transition-all group"
                      onClick={() => startCall(lead)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm text-white font-medium mb-0.5">{lead.name}</p>
                          <p className="text-xs text-obsidian-text-muted">{lead.company}</p>
                          <p className="text-[10px] text-obsidian-text-muted mt-0.5">{lead.industry}</p>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                          {lead.tags.includes('VIP') && (
                            <span className="px-1.5 py-0.5 bg-obsidian-accent/20 text-obsidian-accent text-[9px] rounded">VIP</span>
                          )}
                          {lead.tags.includes('Hot Lead') && (
                            <span className="px-1.5 py-0.5 bg-red-500/20 text-red-500 text-[9px] rounded">HOT</span>
                          )}
                        </div>
                      </div>

                      {/* Deal Value & Probability */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                        <span className="text-xs text-white font-mono">${(lead.dealValue / 1000).toFixed(0)}K</span>
                        <div className="flex items-center gap-1">
                          <BarChart3 size={10} className="text-obsidian-accent" />
                          <span className="text-xs text-obsidian-accent">{lead.probability}%</span>
                        </div>
                      </div>

                      {/* Insights Preview */}
                      {lead.insights.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-white/5">
                          <div className="flex items-center gap-1">
                            <Sparkles size={10} className="text-yellow-500" />
                            <span className="text-[10px] text-obsidian-text-muted">
                              {lead.insights.length} AI insight{lead.insights.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startCall(lead);
                          }}
                          className="flex-1 py-1.5 bg-green-500/10 border border-green-500/30 rounded text-xs text-green-500 hover:bg-green-500/20 transition-colors flex items-center justify-center gap-1"
                        >
                          <Phone size={10} />
                          Call
                        </button>
                        <button className="flex-1 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-1">
                          <Mail size={10} />
                          Email
                        </button>
                      </div>
                    </ObsidianCard>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <ObsidianCard className="flex-1 overflow-hidden">
            <div className="overflow-y-auto h-full">
              <table className="w-full">
                <thead className="border-b border-white/10 sticky top-0 bg-[#0F0F12]">
                  <tr className="text-left">
                    <th className="px-4 py-3 text-xs text-obsidian-text-muted uppercase tracking-wider">Lead</th>
                    <th className="px-4 py-3 text-xs text-obsidian-text-muted uppercase tracking-wider">Company</th>
                    <th className="px-4 py-3 text-xs text-obsidian-text-muted uppercase tracking-wider">Stage</th>
                    <th className="px-4 py-3 text-xs text-obsidian-text-muted uppercase tracking-wider">Value</th>
                    <th className="px-4 py-3 text-xs text-obsidian-text-muted uppercase tracking-wider">Probability</th>
                    <th className="px-4 py-3 text-xs text-obsidian-text-muted uppercase tracking-wider">Last Contact</th>
                    <th className="px-4 py-3 text-xs text-obsidian-text-muted uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map(lead => (
                    <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5 cursor-pointer" onClick={() => startCall(lead)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="text-sm text-white font-medium">{lead.name}</p>
                            <p className="text-xs text-obsidian-text-muted">{lead.title}</p>
                          </div>
                          {lead.tags.includes('VIP') && <Star size={12} className="text-obsidian-accent" />}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-obsidian-text-secondary">{lead.company}</p>
                        <p className="text-xs text-obsidian-text-muted">{lead.industry}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-obsidian-accent/20 text-obsidian-accent text-xs rounded">
                          {lead.stage}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-white font-mono">${(lead.dealValue / 1000).toFixed(0)}K</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-obsidian-accent" style={{ width: `${lead.probability}%` }} />
                          </div>
                          <span className="text-xs text-obsidian-accent">{lead.probability}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-obsidian-text-muted">
                        {Math.floor((Date.now() - lead.lastContact.getTime()) / 3600000)}h ago
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={(e) => { e.stopPropagation(); startCall(lead); }} className="p-1.5 hover:bg-white/10 rounded">
                            <Phone size={14} className="text-green-500" />
                          </button>
                          <button className="p-1.5 hover:bg-white/10 rounded">
                            <Mail size={14} className="text-obsidian-text-muted" />
                          </button>
                          <button className="p-1.5 hover:bg-white/10 rounded">
                            <MoreVertical size={14} className="text-obsidian-text-muted" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ObsidianCard>
        )}
      </div>
    );
  };

  const renderCall = () => {
    if (!callData || !selectedLead) return null;

    const latestSuggestion = callData.cyranoSuggestions[callData.cyranoSuggestions.length - 1];
    const enabledPlayCards = callData.playCards.filter(pc => pc.enabled);

    return (
      <div className="w-full h-full flex gap-4 overflow-hidden">
        {/* Left Sidebar - Customer 360 Profile */}
        <div className="w-80 flex flex-col gap-4 overflow-y-auto">
          {/* Customer Info */}
          <ObsidianCard>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 bg-obsidian-accent/10 rounded-full flex items-center justify-center">
                <User size={28} className="text-obsidian-accent" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-white">{selectedLead.name}</h3>
                <p className="text-xs text-obsidian-text-muted">{selectedLead.title}</p>
                <p className="text-xs text-obsidian-text-muted">{selectedLead.company}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2 text-obsidian-text-secondary">
                <Building size={12} className="text-obsidian-text-muted" />
                <span>{selectedLead.industry} • {selectedLead.companySize} employees</span>
              </div>
              <div className="flex items-center gap-2 text-obsidian-text-secondary">
                <MapPin size={12} className="text-obsidian-text-muted" />
                <span>{selectedLead.location}</span>
              </div>
              <div className="flex items-center gap-2 text-obsidian-text-secondary">
                <Mail size={12} className="text-obsidian-text-muted" />
                <span>{selectedLead.email}</span>
              </div>
              <div className="flex items-center gap-2 text-obsidian-text-secondary">
                <Phone size={12} className="text-obsidian-text-muted" />
                <span>{selectedLead.phone}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-obsidian-text-muted uppercase mb-1">Deal Value</p>
                  <p className="text-lg text-white font-mono">${(selectedLead.dealValue / 1000).toFixed(0)}K</p>
                </div>
                <div>
                  <p className="text-[10px] text-obsidian-text-muted uppercase mb-1">Probability</p>
                  <p className="text-lg text-obsidian-accent">{selectedLead.probability}%</p>
                </div>
              </div>
            </div>

            {selectedLead.budget && (
              <div className="mt-3 p-2 bg-white/5 rounded">
                <p className="text-[10px] text-obsidian-text-muted uppercase mb-1">Budget Range</p>
                <p className="text-xs text-white">${(selectedLead.budget.min / 1000).toFixed(0)}K - ${(selectedLead.budget.max / 1000).toFixed(0)}K</p>
              </div>
            )}
          </ObsidianCard>

          {/* AI Insights */}
          {selectedLead.insights.length > 0 && (
            <ObsidianCard>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-yellow-500" />
                <h4 className="text-xs text-white uppercase tracking-wider">AI Insights</h4>
              </div>
              <div className="space-y-2">
                {selectedLead.insights.map((insight, idx) => (
                  <div key={idx} className={`p-2 rounded border ${
                    insight.type === 'opportunity' ? 'bg-green-500/10 border-green-500/30' :
                    insight.type === 'risk' ? 'bg-red-500/10 border-red-500/30' :
                    insight.type === 'competitor' ? 'bg-yellow-500/10 border-yellow-500/30' :
                    'bg-white/5 border-white/10'
                  }`}>
                    <div className="flex items-start gap-2">
                      {insight.type === 'opportunity' && <TrendingUp size={12} className="text-green-500 mt-0.5" />}
                      {insight.type === 'risk' && <AlertTriangle size={12} className="text-red-500 mt-0.5" />}
                      {insight.type === 'competitor' && <Target size={12} className="text-yellow-500 mt-0.5" />}
                      <div className="flex-1">
                        <p className="text-xs text-white font-medium">{insight.title}</p>
                        <p className="text-[10px] text-obsidian-text-muted mt-1">{insight.description}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-obsidian-accent" style={{ width: `${insight.confidence}%` }} />
                          </div>
                          <span className="text-[9px] text-obsidian-text-muted">{insight.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ObsidianCard>
          )}

          {/* Pain Points */}
          {selectedLead.painPoints.length > 0 && (
            <ObsidianCard>
              <h4 className="text-xs text-obsidian-text-muted uppercase tracking-wider mb-2">Pain Points</h4>
              <div className="space-y-1">
                {selectedLead.painPoints.map((pain, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <AlertCircle size={10} className="text-red-500 mt-0.5" />
                    <span className="text-xs text-obsidian-text-secondary">{pain}</span>
                  </div>
                ))}
              </div>
            </ObsidianCard>
          )}

          {/* Interaction History */}
          <ObsidianCard className="flex-1 overflow-hidden flex flex-col">
            <h4 className="text-xs text-obsidian-text-muted uppercase tracking-wider mb-3">History ({selectedLead.history.length})</h4>
            <div className="flex-1 overflow-y-auto space-y-3">
              {selectedLead.history.map((item) => (
                <div key={item.id} className="pb-3 border-b border-white/5 last:border-0">
                  <div className="flex items-start gap-2 mb-1">
                    {item.type === 'call' && <Phone size={12} className="text-green-500 mt-0.5" />}
                    {item.type === 'email' && <Mail size={12} className="text-blue-500 mt-0.5" />}
                    {item.type === 'meeting' && <Users size={12} className="text-purple-500 mt-0.5" />}
                    {item.type === 'demo' && <Play size={12} className="text-obsidian-accent mt-0.5" />}
                    {item.type === 'proposal' && <FileText size={12} className="text-yellow-500 mt-0.5" />}
                    {item.type === 'note' && <MessageSquare size={12} className="text-obsidian-text-muted mt-0.5" />}
                    <div className="flex-1">
                      <p className="text-xs text-white">{item.outcome}</p>
                      <p className="text-[10px] text-obsidian-text-muted mt-0.5">
                        {item.date.toLocaleDateString()} {item.duration && `• ${item.duration}m`}
                      </p>
                      {item.keyTopics.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.keyTopics.slice(0, 2).map((topic, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-white/5 rounded text-[9px] text-obsidian-text-muted">
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ObsidianCard>
        </div>

        {/* Center - Call Interface */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Video/Avatar View with Emotional Overlays */}
          <ObsidianCard className="h-80 relative overflow-hidden" noPadding>
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0B0B0D] via-[#16161A] to-[#0B0B0D] flex items-center justify-center">
              {/* Audio Waveform */}
              <canvas
                ref={waveformCanvasRef}
                className="absolute inset-0 w-full h-full opacity-40"
              />

              {/* Avatar Silhouette */}
              <div className="relative z-10">
                <div className="w-48 h-56 opacity-40">
                  <svg viewBox="0 0 200 250" className="w-full h-full drop-shadow-2xl">
                    <defs>
                      <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#6A4FFB" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#0B0B0D" stopOpacity="0.1" />
                      </linearGradient>
                      <radialGradient id="glowGrad">
                        <stop offset="0%" stopColor="#6A4FFB" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#6A4FFB" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    {/* Head */}
                    <ellipse cx="100" cy="80" rx="50" ry="60" fill="url(#avatarGrad)" />
                    {/* Shoulders */}
                    <path d="M50,140 Q100,110 150,140 L150,250 L50,250 Z" fill="url(#avatarGrad)" />
                    {/* Glow effect */}
                    <circle cx="100" cy="100" r="80" fill="url(#glowGrad)" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Call Status Badge */}
            <div className="absolute top-4 left-4 bg-[#0F0F12]/90 backdrop-blur border border-green-500/30 px-3 py-1.5 rounded-full flex items-center gap-2 z-20">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-500 font-medium uppercase tracking-wider">LIVE</span>
              <span className="text-xs text-white font-mono">{formatDuration(callDuration)}</span>
            </div>

            {/* Emotional Metrics Overlay */}
            <div className="absolute top-4 right-4 space-y-2 z-20 w-48">
              {/* Sentiment Badge */}
              <div className="bg-[#0F0F12]/90 backdrop-blur border border-white/10 px-3 py-2 rounded">
                <p className="text-[9px] text-obsidian-text-muted uppercase tracking-wider mb-1">Sentiment</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getSentimentColor(callData.emotionalMetrics.sentiment) }} />
                  <span className="text-xs font-medium" style={{ color: getSentimentColor(callData.emotionalMetrics.sentiment) }}>
                    {getSentimentLabel(callData.emotionalMetrics.sentiment)}
                  </span>
                </div>
              </div>

              {/* Trust */}
              <div className="bg-[#0F0F12]/90 backdrop-blur border border-white/10 px-3 py-2 rounded">
                <p className="text-[9px] text-obsidian-text-muted uppercase tracking-wider mb-1">Trust</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 transition-all" style={{ width: `${callData.emotionalMetrics.trust}%` }} />
                  </div>
                  <span className="text-xs text-white font-mono w-8 text-right">{callData.emotionalMetrics.trust}%</span>
                </div>
              </div>

              {/* Stress */}
              <div className="bg-[#0F0F12]/90 backdrop-blur border border-white/10 px-3 py-2 rounded">
                <p className="text-[9px] text-obsidian-text-muted uppercase tracking-wider mb-1">Stress</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 transition-all" style={{ width: `${callData.emotionalMetrics.stress}%` }} />
                  </div>
                  <span className="text-xs text-white font-mono w-8 text-right">{callData.emotionalMetrics.stress}%</span>
                </div>
              </div>

              {/* Enthusiasm */}
              <div className="bg-[#0F0F12]/90 backdrop-blur border border-white/10 px-3 py-2 rounded">
                <p className="text-[9px] text-obsidian-text-muted uppercase tracking-wider mb-1">Enthusiasm</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-obsidian-accent transition-all" style={{ width: `${callData.emotionalMetrics.enthusiasm}%` }} />
                  </div>
                  <span className="text-xs text-white font-mono w-8 text-right">{callData.emotionalMetrics.enthusiasm}%</span>
                </div>
              </div>

              {/* Buying Intent */}
              <div className="bg-[#0F0F12]/90 backdrop-blur border border-green-500/30 px-3 py-2 rounded">
                <p className="text-[9px] text-obsidian-text-muted uppercase tracking-wider mb-1">🎯 Buying Intent</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 transition-all" style={{ width: `${callData.emotionalMetrics.buyingIntent}%` }} />
                  </div>
                  <span className="text-xs text-green-500 font-mono w-8 text-right font-bold">{callData.emotionalMetrics.buyingIntent}%</span>
                </div>
              </div>
            </div>

            {/* Call Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                  isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-white/10 hover:bg-white/20 border border-white/20'
                }`}
              >
                {isMuted ? <MicOff size={18} className="text-white" /> : <Mic size={18} className="text-white" />}
              </button>
              <button
                onClick={endCall}
                className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all shadow-lg shadow-red-500/30"
              >
                <PhoneOff size={20} className="text-white" />
              </button>
              <button
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all"
              >
                <Video size={18} className="text-white" />
              </button>
            </div>

            {/* Recording Indicator */}
            {callData.recordingActive && (
              <div className="absolute bottom-4 left-4 bg-[#0F0F12]/90 backdrop-blur border border-red-500/30 px-2.5 py-1 rounded-full flex items-center gap-1.5 z-20">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-red-500 uppercase tracking-wider">Recording</span>
              </div>
            )}
          </ObsidianCard>

          {/* Emotional Timeline Chart */}
          <ObsidianCard className="h-32">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs text-obsidian-text-muted uppercase tracking-wider">Emotional Journey</h4>
              <div className="flex items-center gap-4 text-[10px]">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-obsidian-text-muted">Trust</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-obsidian-text-muted">Stress</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-obsidian-accent" />
                  <span className="text-obsidian-text-muted">Enthusiasm</span>
                </div>
              </div>
            </div>
            <canvas ref={emotionChartCanvasRef} className="w-full h-20" />
          </ObsidianCard>

          {/* Transcription */}
          <ObsidianCard className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs text-obsidian-text-muted uppercase tracking-wider">Live Transcription</h4>
              <button className="text-xs text-obsidian-accent hover:text-white transition-colors flex items-center gap-1">
                <Download size={12} />
                Export
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {callData.transcription.map(entry => (
                <div key={entry.id} className={`flex gap-3 ${entry.speaker === 'agent' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    entry.speaker === 'agent' ? 'bg-obsidian-accent/20' : 'bg-white/5'
                  }`}>
                    {entry.speaker === 'agent' ?
                      <Headphones size={14} className="text-obsidian-accent" /> :
                      <User size={14} className="text-white" />
                    }
                  </div>
                  <div className={`flex-1 ${entry.speaker === 'agent' ? 'text-right' : ''}`}>
                    <div className={`inline-block max-w-[85%] ${entry.speaker === 'agent' ? 'text-right' : ''}`}>
                      <p className={`text-xs px-3 py-2 rounded-lg ${
                        entry.speaker === 'agent' ? 'bg-obsidian-accent/10 text-white' : 'bg-white/5 text-white'
                      }`}>
                        {entry.text}
                      </p>
                      <div className={`flex items-center gap-2 mt-1 ${entry.speaker === 'agent' ? 'justify-end' : ''}`}>
                        <span className="text-[10px] text-obsidian-text-muted">
                          {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded"
                          style={{
                            color: getSentimentColor(entry.sentiment),
                            backgroundColor: `${getSentimentColor(entry.sentiment)}20`
                          }}
                        >
                          {getSentimentLabel(entry.sentiment)}
                        </span>
                        {entry.keywords && entry.keywords.length > 0 && (
                          <div className="flex gap-1">
                            {entry.keywords.slice(0, 2).map((kw, i) => (
                              <span key={i} className="text-[9px] px-1.5 py-0.5 bg-white/5 rounded text-obsidian-text-muted">
                                {kw}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ObsidianCard>
        </div>

        {/* Right Sidebar - Cyrano Core */}
        <div className="w-96 flex flex-col gap-4 overflow-y-auto">
          {/* Cyrano Header */}
          <ObsidianCard className="bg-gradient-to-br from-obsidian-accent/10 to-transparent border-obsidian-accent/30">
            <div className="flex items-center gap-2 mb-3">
              <BrainCircuit size={18} className="text-obsidian-accent" />
              <div className="flex-1">
                <h3 className="text-sm text-white font-medium">Cyrano AI Copilot</h3>
                <p className="text-[10px] text-obsidian-text-muted">Real-time sales intelligence</p>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
          </ObsidianCard>

          {/* Current Suggestion (Highlighted) */}
          {latestSuggestion && (
            <ObsidianCard className={`${
              latestSuggestion.priority === 'critical' ? 'bg-gradient-to-br from-red-500/20 to-transparent border-red-500/40 shadow-lg shadow-red-500/20' :
              latestSuggestion.priority === 'high' ? 'bg-gradient-to-br from-yellow-500/20 to-transparent border-yellow-500/40' :
              'bg-gradient-to-br from-obsidian-accent/10 to-transparent border-obsidian-accent/30'
            }`}>
              <div className="flex items-start gap-2 mb-2">
                {latestSuggestion.type === 'close' && <Target size={16} className="text-green-500 mt-0.5 animate-pulse" />}
                {latestSuggestion.type === 'warning' && <AlertTriangle size={16} className="text-red-500 mt-0.5" />}
                {latestSuggestion.type === 'opportunity' && <Zap size={16} className="text-yellow-500 mt-0.5" />}
                {latestSuggestion.type === 'tactic' && <Sparkles size={16} className="text-obsidian-accent mt-0.5" />}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      latestSuggestion.priority === 'critical' ? 'bg-red-500/30 text-red-200' :
                      latestSuggestion.priority === 'high' ? 'bg-yellow-500/30 text-yellow-200' :
                      'bg-white/10 text-obsidian-text-muted'
                    }`}>
                      {latestSuggestion.priority}
                    </span>
                    <span className="text-[10px] text-obsidian-text-muted">
                      {Math.floor((Date.now() - latestSuggestion.timestamp.getTime()) / 1000)}s ago
                    </span>
                  </div>
                  <p className={`text-sm font-medium mb-2 ${
                    latestSuggestion.priority === 'critical' ? 'text-red-200' :
                    latestSuggestion.priority === 'high' ? 'text-yellow-200' :
                    'text-white'
                  }`}>
                    {latestSuggestion.title}
                  </p>
                  <p className="text-xs text-obsidian-text-secondary leading-relaxed mb-3">
                    {latestSuggestion.text}
                  </p>
                  {latestSuggestion.reasoning && (
                    <div className="p-2 bg-white/5 rounded mb-3">
                      <p className="text-[10px] text-obsidian-text-muted uppercase tracking-wider mb-1">Reasoning</p>
                      <p className="text-xs text-obsidian-text-secondary">{latestSuggestion.reasoning}</p>
                    </div>
                  )}
                  {latestSuggestion.action && (
                    <ObsidianButton size="sm" fullWidth className="mb-2">
                      <Zap size={12} />
                      {latestSuggestion.action}
                    </ObsidianButton>
                  )}
                  {latestSuggestion.alternatives && latestSuggestion.alternatives.length > 0 && (
                    <div>
                      <p className="text-[10px] text-obsidian-text-muted uppercase tracking-wider mb-1">Alternatives</p>
                      <div className="space-y-1">
                        {latestSuggestion.alternatives.map((alt, i) => (
                          <button
                            key={i}
                            className="w-full text-left text-xs px-2 py-1.5 bg-white/5 hover:bg-white/10 rounded transition-colors text-obsidian-text-secondary"
                          >
                            {alt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ObsidianCard>
          )}

          {/* Previous Suggestions */}
          <ObsidianCard>
            <h4 className="text-xs text-obsidian-text-muted uppercase tracking-wider mb-3">Suggestion History</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {callData.cyranoSuggestions.slice(0, -1).reverse().map(suggestion => (
                <div
                  key={suggestion.id}
                  className={`p-2 rounded border text-xs ${
                    suggestion.priority === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                    suggestion.priority === 'high' ? 'bg-yellow-500/10 border-yellow-500/30' :
                    'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-1.5">
                    {suggestion.type === 'close' && <CheckCircle size={12} className="text-green-500 mt-0.5" />}
                    {suggestion.type === 'warning' && <AlertTriangle size={12} className="text-red-500 mt-0.5" />}
                    {suggestion.type === 'opportunity' && <Zap size={12} className="text-yellow-500 mt-0.5" />}
                    {suggestion.type === 'script' && <MessageSquare size={12} className="text-obsidian-accent mt-0.5" />}
                    {suggestion.type === 'tactic' && <Sparkles size={12} className="text-obsidian-accent mt-0.5" />}
                    <div className="flex-1">
                      <p className="text-[10px] text-white font-medium">{suggestion.title}</p>
                      <p className="text-[10px] text-obsidian-text-muted mt-0.5">
                        {Math.floor((Date.now() - suggestion.timestamp.getTime()) / 60000)}m ago
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ObsidianCard>

          {/* Play Cards */}
          <ObsidianCard className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs text-obsidian-text-muted uppercase tracking-wider">Play Cards</h4>
              <span className="text-[10px] text-obsidian-text-muted">{enabledPlayCards.length} available</span>
            </div>
            <div className="space-y-2">
              {enabledPlayCards.slice(0, 8).map(card => (
                <button
                  key={card.id}
                  className="w-full group"
                  title={card.context}
                >
                  <div className="text-left px-3 py-2.5 bg-[#16161A] border border-white/10 rounded hover:border-obsidian-accent hover:bg-white/5 transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white font-medium group-hover:text-obsidian-accent transition-colors">
                        {card.label}
                      </span>
                      <MousePointer2 size={10} className="opacity-0 group-hover:opacity-100 text-obsidian-accent transition-opacity" />
                    </div>
                    <p className="text-[10px] text-obsidian-text-muted">{card.description}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex items-center gap-1">
                        <BarChart3 size={10} className="text-green-500" />
                        <span className="text-[9px] text-green-500">{card.successRate}% success</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 bg-white/5 rounded text-obsidian-text-muted">
                        {card.category.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ObsidianCard>

          {/* AI Take Over */}
          {callData.takeOverAvailable && !callData.isAIControlled && (
            <ObsidianCard className="bg-gradient-to-br from-obsidian-accent/10 to-transparent border-obsidian-accent/30">
              <div className="flex items-start gap-3 mb-3">
                <Bot size={20} className="text-obsidian-accent mt-0.5" />
                <div>
                  <h5 className="text-sm text-white font-medium mb-1">AI Agent Available</h5>
                  <p className="text-xs text-obsidian-text-secondary">Let an AI avatar take control of this call</p>
                </div>
              </div>
              <ObsidianButton
                fullWidth
                size="sm"
                onClick={() => {
                  if (callData) {
                    setCallData({ ...callData, isAIControlled: true });
                  }
                }}
              >
                <Zap size={12} />
                Activate AI Agent
              </ObsidianButton>
            </ObsidianCard>
          )}

          {callData.isAIControlled && (
            <ObsidianCard className="bg-gradient-to-br from-green-500/20 to-transparent border-green-500/40">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-green-500 font-medium uppercase tracking-wider">AI Agent Active</span>
              </div>
              <p className="text-xs text-obsidian-text-secondary mb-3">
                The AI avatar is now conducting the conversation using Cyrano's recommendations.
              </p>
              <button
                onClick={() => {
                  if (callData) {
                    setCallData({ ...callData, isAIControlled: false });
                  }
                }}
                className="w-full py-2 border border-white/20 rounded text-xs text-white hover:bg-white/10 transition-colors"
              >
                Resume Manual Control
              </button>
            </ObsidianCard>
          )}
        </div>
      </div>
    );
  };

  const renderSummary = () => {
    if (!selectedLead || !callSummary) return null;

    const applyCRMUpdates = () => {
      // Apply CRM updates
      setLeads(prev => prev.map(l => {
        if (l.id === selectedLead.id) {
          return {
            ...l,
            stage: 'CLOSING' as LeadStage,
            probability: 90,
            notes: `Board presentation scheduled for Thursday. Very strong buying intent. Follow up Friday for decision.`
          };
        }
        return l;
      }));

      // Return to pipeline
      setViewMode('pipeline');
      setCallSummary(null);
      setCallData(null);
      setSelectedLead(null);
    };

    return (
      <div className="w-full h-full overflow-y-auto">
        <div className="max-w-6xl mx-auto py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-light text-white mb-1">Call Summary & Analysis</h2>
              <p className="text-sm text-obsidian-text-muted">
                {selectedLead.name} • {selectedLead.company} • {formatDuration(callSummary.duration)}
              </p>
            </div>
            <button
              onClick={() => {
                setViewMode('pipeline');
                setCallSummary(null);
                setCallData(null);
                setSelectedLead(null);
              }}
              className="flex items-center gap-2 text-obsidian-accent hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="text-sm">Back to Pipeline</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="col-span-2 space-y-6">
              {/* Outcome & Metrics */}
              <ObsidianCard>
                <h3 className="text-sm text-white font-medium mb-4">Call Outcome</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 bg-[#16161A] rounded text-center">
                    <p className="text-xs text-obsidian-text-muted mb-2">Outcome</p>
                    <div className="flex items-center justify-center gap-1">
                      <TrendingUp size={16} className="text-green-500" />
                      <p className="text-base text-green-500 font-medium capitalize">{callSummary.outcome.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-[#16161A] rounded text-center">
                    <p className="text-xs text-obsidian-text-muted mb-2">Duration</p>
                    <p className="text-base text-white font-mono">{formatDuration(callSummary.duration)}</p>
                  </div>
                  <div className="p-4 bg-[#16161A] rounded text-center">
                    <p className="text-xs text-obsidian-text-muted mb-2">Sentiment</p>
                    <p className="text-base font-medium" style={{ color: getSentimentColor(callSummary.sentiment) }}>
                      {getSentimentLabel(callSummary.sentiment).replace('🎯 ', '')}
                    </p>
                  </div>
                  <div className="p-4 bg-[#16161A] rounded text-center">
                    <p className="text-xs text-obsidian-text-muted mb-2">Next Follow-up</p>
                    <p className="text-base text-white">3 days</p>
                  </div>
                </div>
              </ObsidianCard>

              {/* Key Moments */}
              <ObsidianCard>
                <h3 className="text-sm text-white font-medium mb-4">Key Moments</h3>
                <div className="space-y-4">
                  {callSummary.keyMoments.map((moment, idx) => (
                    <div key={idx} className="relative pl-8">
                      <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center ${
                        moment.type === 'buying_signal' ? 'bg-green-500/20' :
                        moment.type === 'commitment' ? 'bg-green-500/20' :
                        moment.type === 'objection' ? 'bg-red-500/20' :
                        moment.type === 'concern' ? 'bg-yellow-500/20' :
                        'bg-obsidian-accent/20'
                      }`}>
                        {moment.type === 'buying_signal' && <Target size={12} className="text-green-500" />}
                        {moment.type === 'commitment' && <CheckCircle size={12} className="text-green-500" />}
                        {moment.type === 'objection' && <AlertTriangle size={12} className="text-red-500" />}
                        {moment.type === 'concern' && <AlertCircle size={12} className="text-yellow-500" />}
                        {moment.type === 'breakthrough' && <Zap size={12} className="text-obsidian-accent" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`text-xs font-medium ${
                            moment.type === 'buying_signal' || moment.type === 'commitment' ? 'text-green-500' :
                            moment.type === 'objection' ? 'text-red-500' :
                            moment.type === 'concern' ? 'text-yellow-500' :
                            'text-obsidian-accent'
                          }`}>
                            {moment.description}
                          </p>
                          <span className="text-[10px] text-obsidian-text-muted">
                            {moment.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-obsidian-text-secondary italic">"{moment.quote}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ObsidianCard>

              {/* Topics & Objections */}
              <div className="grid grid-cols-2 gap-6">
                <ObsidianCard>
                  <h3 className="text-sm text-white font-medium mb-3">Topics Discussed</h3>
                  <div className="flex flex-wrap gap-2">
                    {callSummary.topicsDiscussed.map((topic, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-obsidian-accent/10 border border-obsidian-accent/30 rounded text-xs text-obsidian-accent">
                        {topic}
                      </span>
                    ))}
                  </div>
                </ObsidianCard>

                <ObsidianCard>
                  <h3 className="text-sm text-white font-medium mb-3">Objections Handled</h3>
                  <div className="space-y-2">
                    {callSummary.objectionsHandled.map((obj, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle size={12} className="text-green-500 mt-0.5" />
                        <span className="text-xs text-obsidian-text-secondary">{obj}</span>
                      </div>
                    ))}
                  </div>
                </ObsidianCard>
              </div>

              {/* Buying Signals */}
              <ObsidianCard className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <Target size={16} className="text-green-500" />
                  <h3 className="text-sm text-white font-medium">Buying Signals Detected</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {callSummary.buyingSignals.map((signal, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 bg-white/5 rounded">
                      <Zap size={12} className="text-green-500 mt-0.5" />
                      <span className="text-xs text-white">{signal}</span>
                    </div>
                  ))}
                </div>
              </ObsidianCard>

              {/* Next Steps */}
              <ObsidianCard>
                <h3 className="text-sm text-white font-medium mb-4">Next Steps</h3>
                <div className="space-y-3">
                  {callSummary.nextSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-3 rounded border ${
                        step.priority === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                        step.priority === 'high' ? 'bg-yellow-500/10 border-yellow-500/30' :
                        'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {step.automated ? (
                          <Bot size={16} className="text-obsidian-accent" />
                        ) : (
                          <User size={16} className="text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white mb-1">{step.action}</p>
                        <div className="flex items-center gap-3 text-[10px] text-obsidian-text-muted">
                          <span>Due: {step.deadline.toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="capitalize">{step.priority} priority</span>
                          <span>•</span>
                          <span>{step.automated ? 'Automated' : step.assignedTo}</span>
                        </div>
                      </div>
                      <button className="flex-shrink-0 p-1.5 hover:bg-white/10 rounded">
                        <CheckCircle size={14} className="text-obsidian-text-muted" />
                      </button>
                    </div>
                  ))}
                </div>
              </ObsidianCard>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* AI Recommendations */}
              <ObsidianCard className="bg-gradient-to-br from-obsidian-accent/10 to-transparent border-obsidian-accent/30">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-obsidian-accent" />
                  <h3 className="text-sm text-white font-medium">AI Recommendations</h3>
                </div>
                <div className="space-y-2">
                  {callSummary.aiRecommendations.map((rec, idx) => (
                    <div key={idx} className="p-2 bg-white/5 rounded">
                      <p className="text-xs text-obsidian-text-secondary leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </ObsidianCard>

              {/* CRM Updates */}
              <ObsidianCard>
                <h3 className="text-sm text-white font-medium mb-3">Proposed CRM Updates</h3>
                <div className="space-y-3">
                  {callSummary.crmUpdates.map((update, idx) => (
                    <div key={idx} className="p-3 bg-[#16161A] rounded">
                      <p className="text-xs text-obsidian-text-muted uppercase tracking-wider mb-1">{update.field}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-red-400 line-through">{update.oldValue}</span>
                        <ChevronRight size={12} className="text-obsidian-text-muted" />
                        <span className="text-xs text-green-400 font-medium">{update.newValue}</span>
                      </div>
                      <p className="text-[10px] text-obsidian-text-muted">{update.reason}</p>
                    </div>
                  ))}
                </div>
              </ObsidianCard>

              {/* Actions */}
              <div className="space-y-3">
                <ObsidianButton fullWidth onClick={applyCRMUpdates}>
                  <CheckCircle size={14} />
                  Apply Updates & Close
                </ObsidianButton>
                <ObsidianButton fullWidth variant="outline">
                  <Download size={14} />
                  Download Full Transcript
                </ObsidianButton>
                <ObsidianButton fullWidth variant="outline">
                  <Share2 size={14} />
                  Share Summary with Team
                </ObsidianButton>
                {callSummary.recordingUrl && (
                  <ObsidianButton fullWidth variant="outline">
                    <Play size={14} />
                    Play Recording
                  </ObsidianButton>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==================== MAIN RENDER ====================

  return (
    <div className="w-full h-screen bg-[#0B0B0D] text-obsidian-text-primary px-6 py-6 flex flex-col overflow-hidden font-sans">
      {/* Header */}
      {viewMode === 'pipeline' && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-light text-white mb-1">Bionic Sales / Cyrano</h1>
            <p className="text-sm text-obsidian-text-muted">AI-Powered Real-Time Sales Copilot</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1 bg-[#16161A] border border-white/10 rounded p-1">
              <button
                onClick={() => setPipelineView('kanban')}
                className={`px-3 py-1.5 rounded transition-colors text-xs flex items-center gap-1 ${
                  pipelineView === 'kanban' ? 'bg-obsidian-accent text-white' : 'text-obsidian-text-muted hover:text-white'
                }`}
              >
                <Grid3X3 size={12} />
                Kanban
              </button>
              <button
                onClick={() => setPipelineView('list')}
                className={`px-3 py-1.5 rounded transition-colors text-xs flex items-center gap-1 ${
                  pipelineView === 'list' ? 'bg-obsidian-accent text-white' : 'text-obsidian-text-muted hover:text-white'
                }`}
              >
                <List size={12} />
                List
              </button>
            </div>
            <div className="px-4 py-2 bg-[#16161A] border border-white/10 rounded flex items-center gap-2">
              <Activity size={14} className="text-green-500" />
              <span className="text-xs text-white">All systems operational</span>
            </div>
            <ObsidianButton size="sm">
              <Plus size={14} />
              New Lead
            </ObsidianButton>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'pipeline' && renderPipeline()}
        {viewMode === 'call' && renderCall()}
        {viewMode === 'summary' && renderSummary()}
      </div>
    </div>
  );
};

export default BionicSales;
