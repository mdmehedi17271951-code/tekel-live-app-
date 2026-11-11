import { AIChatMessage } from '../types';

export const AIService = {
  async sendMessage(
    message: string,
    history: AIChatMessage[]
  ): Promise<string> {
    const formattedHistory = history.map(item => ({
      role: item.role,
      text: item.text,
    }));

    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history: formattedHistory,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    return data.reply;
  },
};
