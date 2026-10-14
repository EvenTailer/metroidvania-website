export type NarrativeBlockType = 'dialogue' | 'cutscene' | 'lore' | 'choice' | 'event';

export interface NarrativeChoiceOption {
  text: string;
  reaction?: string;
  targetChapterId?: string;
}

export interface NarrativeBlock {
  id: string;
  type: NarrativeBlockType;
  speaker?: string; // Кибер-Утка, Док «Стилус», Центурион MK-IV, Терминал
  emotion?: string; // Спокойно, Злость, Усмешка, Помехи, Шепот
  title?: string; // Краткое название сцены / триггера
  content: string; // Основной текст реплики / описания
  godotTrigger?: string; // Узел движка: emit_signal("door_locked"), $AudioStreamPlayer.play()
  choices?: NarrativeChoiceOption[];
}

export interface NarrativeChapter {
  id: string;
  act: string; // "Акт 0 • Пролог", "Акт 1 • Трущобы", "Акт 2 • Лаборатории"
  title: string;
  location: string;
  summary: string;
  blocks: NarrativeBlock[];
}

export const DEFAULT_NARRATIVE_CHAPTERS: NarrativeChapter[] = [
  {
    id: "ch-0",
    act: "Акт 0 • Пролог",
    title: "Падение челнока и аварийный запуск",
    location: "Свалка промышленных отходов, Сектор 09",
    summary: "Челнок Кибер-Утки сбит защитными турелями мегакорпорации. Герой приходит в себя среди обломков со сломанным манипулятором и активирует сканирующий нейро-глаз.",
    blocks: [
      {
        id: "b-0-1",
        type: "cutscene",
        title: "Аварийная посадка",
        content: "Камера плавно выезжает из густого неонового пара. Горящие обломки обшивки. Корпус Кибер-Утки искрит, правый глаз мигает аварийным красным цветом.",
        godotTrigger: "$Camera2D.shake(1.2, 20) • $AmbientFire.play()"
      },
      {
        id: "b-0-2",
        type: "dialogue",
        speaker: "Агент-09: Кибер-Утка",
        emotion: "Хрип / Злость",
        content: "Черт... Опять они перехватили транспондер. Правый манипулятор заклинило намертво, но сервоприводы ног еще держат. Надо выбираться до прибытия зачистного отряда.",
        godotTrigger: "HUD.show_dialogue_bubble('agent_09', 'angry')"
      },
      {
        id: "b-0-3",
        type: "lore",
        title: "Обгоревший планшет пилота",
        content: "«Внимание всем бортам Сектора 09! Любые неавторизованные кибернетические формы подлежат немедленной утилизации. Премия за живого Агента-09 увеличена втрое корпорацией Нейро-Синтез».",
        godotTrigger: "Inventory.add_lore_document('doc_crash_site')"
      },
      {
        id: "b-0-4",
        type: "event",
        title: "Активация Нейро-глаза",
        content: "Игрок нажимает Q: включается спектральный фильтр ночного видения, проявляя скрытую вентиляционную шахту за обвалившейся стеной.",
        godotTrigger: "Player.unlock_ability('spectrum_eye') • $SfxEye.play()"
      }
    ]
  },
  {
    id: "ch-1",
    act: "Акт 1 • Трущобы",
    title: "Встреча в мастерской Дока «Стилуса»",
    location: "Убежище сопротивления, Нижние уровни",
    summary: "Утка добирается до подпольной мастерской бывшего нейро-инженера корпорации. Док ремонтирует боевой манипулятор и открывает функцию силового парирования.",
    blocks: [
      {
        id: "b-1-1",
        type: "dialogue",
        speaker: "Док «Стилус»",
        emotion: "Усмешка через респиратор",
        content: "Смотрите-ка, кто приковылял. Наш пернатый детектив со сломанным крылом. Садись на операционный стол, пока твоя гидравлика не вытекла на мои чистые коврики.",
        godotTrigger: "NPC_Doc.play_anim('welding_idle')"
      },
      {
        id: "b-1-2",
        type: "choice",
        title: "Ответ Доку",
        content: "Как ответить на колкость инженера?",
        choices: [
          {
            text: "«Поменьше болтай, Док. Просто почини руку под парирование импульсов».",
            reaction: "Док хмыкает: «Грубо, но по делу. Готовься, будет жечь!»"
          },
          {
            text: "«Что с лабораториями корпорации наверху? Почему сирены по всему городу?»",
            reaction: "Док мрачнеет: «Они активировали Проект Центурион. Ты вовремя пришел»."
          }
        ]
      },
      {
        id: "b-1-3",
        type: "event",
        title: "Калибровка кибер-руки",
        content: "Установка титанового шарнира. Разблокировка механики парирования на кнопку K (окно 0.15с).",
        godotTrigger: "Player.unlock_ability('parry_arm') • UI.show_banner('Новая способность: Парирование')"
      }
    ]
  },
  {
    id: "ch-2",
    act: "Акт 2 • Лаборатории",
    title: "Дуэль с Корпоративным Центурионом MK-IV",
    location: "Шлюзовая камера Сектора 1: Испытательный полигон",
    summary: "Тяжелый киборг перекрывает путь к центральному серверу. Диалог перед босс-файтом и переход к 3-фазной битве.",
    blocks: [
      {
        id: "b-2-1",
        type: "cutscene",
        title: "Выход Центуриона",
        content: "Тяжелые гермоворота с лязгом опускаются. Ростовой энергощит босса вспыхивает слепящим фиолетовым светом. Плазменный тесак чертит искры по полу.",
        godotTrigger: "BossArena.lock_doors() • MusicServer.crossfade_to_boss()"
      },
      {
        id: "b-2-2",
        type: "dialogue",
        speaker: "Корпоративный Центурион MK-IV",
        emotion: "Металлический синтезатор голоса",
        content: "Объект Агент-09 идентифицирован. Нарушение периметра категории Альфа. Протокол зачистки: ликвидация с извлечением сенсорного чипа.",
        godotTrigger: "Boss.play_voice_line('voice_eliminate')"
      },
      {
        id: "b-2-3",
        type: "dialogue",
        speaker: "Агент-09: Кибер-Утка",
        emotion: "Хладнокровие",
        content: "Попробуй забрать, консервная банка. Твой щит как раз зарядит мой манипулятор.",
        godotTrigger: "BossBattle.start_fight()"
      }
    ]
  }
];
