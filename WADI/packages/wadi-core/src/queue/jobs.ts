// Enhanced Job Input
export type ChatJobInput = {
  userId: string;
  requestId?: string; // Optional now
  message: string;
  conversationId: string;
  // Context fields
  mode?: string;
  topic?: string;
  isMobile?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attachments?: any[];
  customSystemPrompt?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  memory?: any;
  // Pre-computed OpenAI messages
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  messages?: any[]; 
};

export type ChatJobOutput = {
  ok: true;
  response: unknown; 
  degraded?: boolean;
};
