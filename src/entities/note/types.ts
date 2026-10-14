export interface NoteItem {
  id: string;
  tag: string;
  text: string;
  author: string;
  date: string;
}

export const DEFAULT_NOTES: NoteItem[] = [
  {
    id: 'n-1',
    tag: '💡 Механика',
    text: 'Парирование рукой-протезом заряжает кибер-глаз: после 3 парирований игрок выпускает сканирующий импульс.',
    author: 'Юзер 1',
    date: 'Сегодня'
  }
];
