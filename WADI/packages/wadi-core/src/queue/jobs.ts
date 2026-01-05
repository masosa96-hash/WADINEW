export type ChatJobInput = {
  userId: string;
  requestId: string;
  message: string;
};

export type ChatJobOutput = {
  ok: true;
  response: unknown; 
  degraded?: boolean;
};
