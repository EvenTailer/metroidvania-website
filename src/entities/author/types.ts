export function normalizeAuthor(name: string): string {
  if (name.includes('Илья') || name.includes('Lead')) return 'Юзер 1';
  if (name.includes('Художник') || name.includes('Art')) return 'Юзер 2';
  if (name.includes('Геймдизайнер') || name.includes('Design')) return 'Юзер 3';
  return name;
}

export interface Author {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export const AUTHORS: Author[] = [
  { id: "user-1", name: "Юзер 1", role: "Команда", avatar: "1" },
  { id: "user-2", name: "Юзер 2", role: "Команда", avatar: "2" },
  { id: "user-3", name: "Юзер 3", role: "Команда", avatar: "3" }
];
