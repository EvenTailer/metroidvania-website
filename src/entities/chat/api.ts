import { TeamMessage } from './types';

export async function fetchChatFromServer(): Promise<TeamMessage[]> {
  const res = await fetch('/api/chat.php', {
    headers: { credentials: 'omit' }
  });
  if (!res.ok) {
    throw new Error(`Chat fetch failed: ${res.status}`);
  }
  const data = (await res.json()) as { messages?: TeamMessage[] };
  return Array.isArray(data.messages) ? data.messages : [];
}

export async function sendChatMessageToServer(message: TeamMessage): Promise<void> {
  const res = await fetch('/api/chat.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'send', message })
  });
  if (!res.ok) {
    throw new Error(`Send chat message failed: ${res.status}`);
  }
}

export async function deleteChatMessageFromServer(id: string): Promise<void> {
  const res = await fetch('/api/chat.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', id })
  });
  if (!res.ok) {
    throw new Error(`Delete chat message failed: ${res.status}`);
  }
}
