// AI tutor chats + learning tips (FAKE for now: see docs/api.md for the real endpoints).
// The fake tutor picks a canned step-by-step answer by keyword (in any of the 3 languages)
// and answers in the `language` it was asked in, like the real tutor will.

import { hasWord } from '../lib/text.js'
import { copy, currentLanguage, daysAgo, hoursAgo, matches, minutesAgo, pick, wait } from './fake.js'

// Seeded chats. Texts are { en, fr, ar } so the demo reads well in every language;
// messages the student adds are plain strings (a real chat stays in the language it was written in).
const CHATS = [
  {
    id: 'photosynthesis',
    title: { en: 'Photosynthesis in simple words', fr: 'La photosynthèse en mots simples', ar: 'التركيب الضوئي بكلمات بسيطة' },
    updatedAt: hoursAgo(3),
    messages: [
      {
        id: 'm1', role: 'user', createdAt: hoursAgo(3),
        text: { en: 'Can you explain photosynthesis simply?', fr: 'Tu peux m’expliquer la photosynthèse simplement ?', ar: 'هل يمكنك أن تشرح لي التركيب الضوئي ببساطة؟' },
      },
      {
        id: 'm2', role: 'tutor', createdAt: hoursAgo(3),
        text: {
          en: 'Sure! Think of a leaf as a tiny kitchen.\n1. Ingredients: water from the roots and CO₂ from the air.\n2. Energy: sunlight, caught by chlorophyll (the green pigment).\n3. Recipe: 6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂.\n4. Result: glucose feeds the plant, oxygen goes out into the air.\nQuick check: where does the oxygen come from? (Answer: the water!)',
          fr: 'Bien sûr ! Imagine une feuille comme une petite cuisine.\n1. Ingrédients : l’eau des racines et le CO₂ de l’air.\n2. Énergie : la lumière du soleil, captée par la chlorophylle (le pigment vert).\n3. Recette : 6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂.\n4. Résultat : le glucose nourrit la plante, l’oxygène part dans l’air.\nPetite vérif : d’où vient l’oxygène ? (Réponse : de l’eau !)',
          ar: 'بكلّ سرور! تخيّل الورقة كمطبخ صغير.\n1. المكوّنات: الماء من الجذور وثاني أكسيد الكربون CO₂ من الهواء.\n2. الطاقة: ضوء الشمس، يلتقطه اليخضور (الصبغة الخضراء).\n3. الوصفة: 6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂.\n4. النتيجة: الغلوكوز يغذّي النبتة، والأكسجين يخرج إلى الهواء.\nسؤال سريع: من أين يأتي الأكسجين؟ (الجواب: من الماء!)',
        },
      },
    ],
  },
  {
    id: 'equation-2x5',
    title: { en: 'Solving 2x + 5 = 13', fr: 'Résoudre 2x + 5 = 13', ar: 'حلّ المعادلة 2x + 5 = 13' },
    updatedAt: daysAgo(1),
    messages: [
      {
        id: 'm1', role: 'user', createdAt: daysAgo(1),
        text: { en: 'How do I solve 2x + 5 = 13?', fr: 'Comment je résous 2x + 5 = 13 ?', ar: 'كيف أحلّ المعادلة 2x + 5 = 13؟' },
      },
      {
        id: 'm2', role: 'tutor', createdAt: daysAgo(1),
        text: {
          en: 'Goal: get x alone.\n1. Remove the +5 on both sides: 2x = 13 − 5 = 8.\n2. Divide both sides by 2: x = 8 ÷ 2 = 4.\n3. Check: 2 × 4 + 5 = 13 ✓\nSo x = 4.',
          fr: 'Objectif : isoler x.\n1. Enlève le +5 des deux côtés : 2x = 13 − 5 = 8.\n2. Divise les deux côtés par 2 : x = 8 ÷ 2 = 4.\n3. Vérifie : 2 × 4 + 5 = 13 ✓\nDonc x = 4.',
          ar: 'الهدف: عزل x.\n1. اطرح 5 من الطرفين: 2x = 13 − 5 = 8.\n2. اقسم الطرفين على 2: x = 8 ÷ 2 = 4.\n3. تحقّق: 2 × 4 + 5 = 13 ✓\nإذن x = 4.',
        },
      },
    ],
  },
  {
    id: 'bac-revision-plan',
    title: { en: 'A revision plan for the bac', fr: 'Un planning de révision pour le bac', ar: 'خطّة مراجعة للباكالوريا' },
    updatedAt: daysAgo(4),
    messages: [
      {
        id: 'm1', role: 'user', createdAt: daysAgo(4),
        text: {
          en: 'I have 6 weeks before the bac. How should I revise?',
          fr: 'Il me reste 6 semaines avant le bac. Comment je dois réviser ?',
          ar: 'بقيت لي 6 أسابيع قبل الباكالوريا. كيف أراجع؟',
        },
      },
      {
        id: 'm2', role: 'tutor', createdAt: daysAgo(4),
        text: {
          en: 'Here is a simple plan:\n1. Week 1: list every chapter and mark it green, orange or red.\n2. Weeks 2–4: red chapters first, 2 subjects a day, 25-minute blocks.\n3. Week 5: past bac exams in real conditions.\n4. Week 6: light review of your summary sheets, and sleep well.\nWant me to turn this into a day-by-day schedule?',
          fr: 'Voici un plan simple :\n1. Semaine 1 : liste tous les chapitres et colore-les en vert, orange ou rouge.\n2. Semaines 2 à 4 : les chapitres rouges d’abord, 2 matières par jour, par blocs de 25 minutes.\n3. Semaine 5 : des sujets du bac en conditions réelles.\n4. Semaine 6 : relecture légère de tes fiches, et dors bien.\nTu veux que je le transforme en planning jour par jour ?',
          ar: 'إليك خطّة بسيطة:\n1. الأسبوع 1: اكتب قائمة بكلّ المحاور ولوّنها بالأخضر أو البرتقالي أو الأحمر.\n2. الأسابيع 2 إلى 4: المحاور الحمراء أوّلًا، مادّتان في اليوم، بفترات من 25 دقيقة.\n3. الأسبوع 5: مواضيع باكالوريا سابقة في ظروف حقيقية.\n4. الأسبوع 6: مراجعة خفيفة للملخّصات، ونَم جيّدًا.\nهل تريد أن أحوّلها إلى جدول يومي؟',
        },
      },
    ],
  },
]

// Longest question the tutor accepts (the composer shows a counter near it)
export const MAX_QUESTION_LENGTH = 1000

// Canned answers: the first entry with a keyword in the question wins. Keywords match WHOLE words,
// ignoring case and accents ("excellent" doesn't match "cell"), so list the word forms you need
// (in Arabic too: with and without "ال").
// Answers use the tutor's light formatting: **bold**, `inline code`, ``` code blocks ```,
// "1." numbered steps and "-" bullets (see src/lib/formatText.jsx).
const ANSWERS = [
  {
    keywords: ['simpler', 'more simply', 'plus simple', 'plus simplement', 'أبسط', 'ببساطة', 'بسّط'],
    text: {
      en: 'Sure, let’s make it **super simple**.\nImagine you’re explaining it to a 10-year-old:\n1. Start with **one idea only**: the main rule.\n2. Use an everyday comparison (cooking, football, money…).\n3. Check with a tiny example before adding details.\nIf one word still feels unclear, tell me which one and I’ll explain just that word.',
      fr: 'Bien sûr, on va faire **super simple**.\nImagine que tu l’expliques à un enfant de 10 ans :\n1. Commence par **une seule idée** : la règle principale.\n2. Utilise une comparaison du quotidien (cuisine, foot, argent…).\n3. Vérifie avec un tout petit exemple avant d’ajouter des détails.\nSi un mot reste flou, dis-moi lequel et je t’explique juste ce mot.',
      ar: 'أكيد، لنجعلها **بسيطة جدًّا**.\nتخيّل أنّك تشرحها لطفل عمره 10 سنوات:\n1. ابدأ **بفكرة واحدة فقط**: القاعدة الأساسية.\n2. استعمل مقارنة من الحياة اليومية (الطبخ، الكرة، المال…).\n3. تحقّق بمثال صغير قبل إضافة التفاصيل.\nإذا بقيت كلمة غير واضحة، قل لي أيّها وسأشرحها وحدها.',
    },
  },
  {
    keywords: ['example', 'examples', 'exemple', 'exemples', 'مثال', 'مثالا', 'أمثلة', 'المثال'],
    text: {
      en: 'Here’s a concrete example.\nSay you save **5 TND** every week and you already have **13 TND**. When will you reach 33 TND?\n1. Write it as an equation: `13 + 5x = 33`.\n2. Remove 13 from both sides: `5x = 20`.\n3. Divide by 5: `x = 4`.\nSo after **4 weeks** you’ll have 33 TND. Want another example with fractions?',
      fr: 'Voici un exemple concret.\nTu économises **5 DT** chaque semaine et tu as déjà **13 DT**. Quand auras-tu 33 DT ?\n1. Écris-le en équation : `13 + 5x = 33`.\n2. Enlève 13 des deux côtés : `5x = 20`.\n3. Divise par 5 : `x = 4`.\nDonc après **4 semaines** tu auras 33 DT. Tu veux un autre exemple avec des fractions ?',
      ar: 'إليك مثالًا ملموسًا.\nلنفترض أنّك تدّخر **5 د.ت** كلّ أسبوع ولديك **13 د.ت**. متى ستصل إلى 33 د.ت؟\n1. اكتبها كمعادلة: `13 + 5x = 33`.\n2. اطرح 13 من الطرفين: `5x = 20`.\n3. اقسم على 5: `x = 4`.\nإذن بعد **4 أسابيع** سيكون لديك 33 د.ت. هل تريد مثالًا آخر بالكسور؟',
    },
  },
  {
    keywords: ['code', 'coding', 'python', 'program', 'programming', 'programme', 'programmation', 'loop', 'loops', 'boucle', 'boucles', 'function', 'functions', 'fonction', 'javascript', 'algorithm', 'algorithms', 'algorithme', 'برمجة', 'البرمجة', 'بايثون', 'حلقة', 'الحلقة', 'الحلقات', 'خوارزمية', 'الخوارزمية', 'دالة'],
    text: {
      en: 'Let’s look at a **loop** in Python: it repeats code for you.\n```python\nfor day in ["Mon", "Tue", "Wed"]:\n    print("Study session on", day)\n```\n1. `for day in [...]` takes each item of the list, one at a time.\n2. The indented line runs **once per item**.\n3. So this prints 3 lines, one per day.\nTry changing the list to your own days and run it!',
      fr: 'Regardons une **boucle** en Python : elle répète du code pour toi.\n```python\nfor jour in ["Lun", "Mar", "Mer"]:\n    print("Séance de révision le", jour)\n```\n1. `for jour in [...]` prend chaque élément de la liste, un par un.\n2. La ligne indentée s’exécute **une fois par élément**.\n3. Ça affiche donc 3 lignes, une par jour.\nEssaie de mettre tes propres jours dans la liste et lance-le !',
      ar: 'لننظر إلى **حلقة** في بايثون: هي تكرّر الشيفرة عوضًا عنك.\n```python\nfor day in ["Mon", "Tue", "Wed"]:\n    print("Study session on", day)\n```\n1. `for day in [...]` تأخذ كلّ عنصر من القائمة، واحدًا تلو الآخر.\n2. السطر المزاح يُنفَّذ **مرّة لكلّ عنصر**.\n3. إذن يطبع هذا 3 أسطر، سطرًا لكلّ يوم.\nجرّب أن تضع أيّامك في القائمة وشغّلها!',
    },
  },
  {
    keywords: ['equation', 'equations', 'équation', 'équations', 'solve', 'solving', 'résoudre', 'resous', 'معادلة', 'المعادلة', 'معادلات', 'المعادلات', 'أحل', 'حل'],
    text: {
      en: 'Let’s solve it **step by step**.\n1. Move the numbers without x to the other side (change their sign).\n2. Group the x terms together.\n3. Divide by the number in front of x.\n4. **Plug your answer back in** to check it.\nFor example: `2x + 5 = 13` → `2x = 8` → `x = 4`.\nSend me your exact equation and I’ll walk through it with you.',
      fr: 'On la résout **étape par étape**.\n1. Passe les nombres sans x de l’autre côté (en changeant leur signe).\n2. Regroupe les termes en x.\n3. Divise par le nombre devant x.\n4. **Remplace x par ta réponse** pour vérifier.\nPar exemple : `2x + 5 = 13` → `2x = 8` → `x = 4`.\nEnvoie-moi ton équation exacte et on la fait ensemble.',
      ar: 'لنحلّها **خطوة بخطوة**.\n1. انقل الأعداد التي لا تحتوي على x إلى الطرف الآخر (مع تغيير إشارتها).\n2. اجمع الحدود التي فيها x.\n3. اقسم على العدد الموجود أمام x.\n4. **عوّض x بالجواب** للتحقّق.\nمثلًا: `2x + 5 = 13` → `2x = 8` → `x = 4`.\nأرسل لي معادلتك بالضبط وسنحلّها معًا.',
    },
  },
  {
    keywords: ['photosynthesis', 'photosynthèse', 'plant', 'plants', 'plante', 'plantes', 'leaf', 'leaves', 'feuille', 'cell', 'cells', 'cellule', 'dna', 'adn', 'gene', 'genes', 'gène', 'gènes', 'genetics', 'génétique', 'svt', 'biology', 'biologie', 'التركيب الضوئي', 'نبتة', 'النبتة', 'خلية', 'الخلية', 'مورثة', 'الوراثة', 'وراثة', 'علوم الحياة'],
    text: {
      en: 'Good biology question! Here’s how to think about it.\n1. Start from the **big picture**: what goes in, what comes out.\n2. Name the place where it happens (organ, cell, organelle).\n3. Write the key equation or diagram.\n4. Finish with one real-life example.\nWhich part would you like me to go deeper on?',
      fr: 'Bonne question de SVT ! Voici comment y réfléchir.\n1. Pars de la **vue d’ensemble** : ce qui entre, ce qui sort.\n2. Nomme l’endroit où ça se passe (organe, cellule, organite).\n3. Écris l’équation ou le schéma clé.\n4. Termine par un exemple de la vraie vie.\nSur quelle partie tu veux que j’aille plus loin ?',
      ar: 'سؤال جيّد في علوم الحياة والأرض! إليك كيف تفكّر فيه.\n1. ابدأ من **الصورة الكاملة**: ماذا يدخل وماذا يخرج.\n2. حدّد المكان الذي يحدث فيه (عضو، خلية، عُضيّة).\n3. اكتب المعادلة أو الرسم الأساسي.\n4. اختم بمثال من الحياة الواقعية.\nأيّ جزء تريد أن نتعمّق فيه؟',
    },
  },
  {
    keywords: ['english', 'anglais', 'vocabulary', 'vocabulaire', 'grammar', 'grammaire', 'speak', 'speaking', 'parler', 'french', 'français', 'essay', 'dissertation', 'language', 'languages', 'langue', 'langues', 'الإنجليزية', 'الانجليزية', 'الفرنسية', 'لغة', 'اللغة', 'مقال', 'المقال'],
    text: {
      en: 'Languages get easier with **small daily habits**.\n1. 15 minutes a day beats 2 hours on Sunday.\n2. Learn words **in sentences**, not lists.\n3. Speak out loud, even alone: record yourself and listen back.\n4. Read one short article a day on a topic you like.\nShall I give you a 7-day practice plan?',
      fr: 'Les langues deviennent plus faciles avec **de petites habitudes quotidiennes**.\n1. 15 minutes par jour valent mieux que 2 heures le dimanche.\n2. Apprends les mots **dans des phrases**, pas en listes.\n3. Parle à voix haute, même seul : enregistre-toi et réécoute.\n4. Lis un petit article par jour sur un sujet qui te plaît.\nJe te prépare un plan d’entraînement sur 7 jours ?',
      ar: 'تصبح اللغات أسهل مع **عادات يومية صغيرة**.\n1. 15 دقيقة في اليوم أفضل من ساعتين يوم الأحد.\n2. تعلّم الكلمات **داخل جمل**، لا في قوائم.\n3. تكلّم بصوت عالٍ ولو وحدك: سجّل صوتك واستمع إليه.\n4. اقرأ مقالًا قصيرًا كلّ يوم عن موضوع تحبّه.\nهل أعطيك خطّة تدريب لمدّة 7 أيّام؟',
    },
  },
  {
    keywords: ['physics', 'physique', 'force', 'forces', 'energy', 'énergie', 'newton', 'speed', 'vitesse', 'chemistry', 'chimie', 'gravity', 'gravité', 'فيزياء', 'الفيزياء', 'قوة', 'القوة', 'طاقة', 'الطاقة', 'سرعة', 'السرعة', 'كيمياء', 'الكيمياء'],
    text: {
      en: 'Let’s break the problem down.\n1. Draw the situation and list what you know (**with units**).\n2. Write what you are looking for.\n3. Pick the law that links them, for example `F = m × a`.\n4. Solve with letters first, numbers last, and check the units.\nSend me the exercise and we’ll do it together.',
      fr: 'Découpons le problème.\n1. Fais un schéma et liste ce que tu connais (**avec les unités**).\n2. Écris ce que tu cherches.\n3. Choisis la loi qui les relie, par exemple `F = m × a`.\n4. Calcule d’abord avec les lettres, les nombres à la fin, et vérifie les unités.\nEnvoie-moi l’exercice et on le fait ensemble.',
      ar: 'لنقسّم المسألة.\n1. ارسم الوضعية واكتب ما تعرفه (**مع الوحدات**).\n2. اكتب ما تبحث عنه.\n3. اختر القانون الذي يربط بينهما، مثلًا `F = m × a`.\n4. احسب بالحروف أوّلًا وبالأعداد في الأخير، وتحقّق من الوحدات.\nأرسل لي التمرين وسنحلّه معًا.',
    },
  },
  {
    keywords: ['bac', 'exam', 'exams', 'examen', 'examens', 'revise', 'revision', 'revising', 'réviser', 'révision', 'révisions', 'concours', 'prépa', 'باكالوريا', 'الباكالوريا', 'الباك', 'امتحان', 'الامتحان', 'امتحانات', 'مراجعة', 'المراجعة', 'أراجع'],
    text: {
      en: 'Exams are a marathon, not a sprint. Here’s a plan that works:\n1. List every chapter and colour it **green, orange or red**.\n2. Start with the red ones, in **25-minute blocks**.\n3. Every week, do one past exam in real conditions.\n4. The last days: summary sheets only, and **sleep well**.\nTell me your exam date and subjects, and I’ll build your schedule.',
      fr: 'Les examens, c’est un marathon, pas un sprint. Voici un plan qui marche :\n1. Liste tous les chapitres et colore-les en **vert, orange ou rouge**.\n2. Commence par les rouges, par **blocs de 25 minutes**.\n3. Chaque semaine, fais un ancien sujet en conditions réelles.\n4. Les derniers jours : uniquement tes fiches, et **dors bien**.\nDis-moi la date de ton examen et tes matières, et je te prépare ton planning.',
      ar: 'الامتحانات ماراثون وليست سباق سرعة. إليك خطّة تنجح:\n1. اكتب قائمة بكلّ المحاور ولوّنها **بالأخضر أو البرتقالي أو الأحمر**.\n2. ابدأ بالحمراء، **بفترات من 25 دقيقة**.\n3. كلّ أسبوع، أنجز موضوع امتحان سابق في ظروف حقيقية.\n4. الأيّام الأخيرة: الملخّصات فقط، **ونَم جيّدًا**.\nقل لي تاريخ امتحانك وموادّك، وسأعدّ لك جدولك.',
    },
  },
]
const DEFAULT_ANSWER = {
  en: 'Great question! Here’s a way to tackle it.\n1. Rephrase the question **in your own words**.\n2. Write down what you already know about it.\n3. Find the one idea you are missing: that’s what we’ll learn now.\n4. Try a small example to check you understood.\nTell me a bit more (subject and level) and I’ll give you a precise explanation.',
  fr: 'Excellente question ! Voici une façon de t’y prendre.\n1. Reformule la question **avec tes propres mots**.\n2. Note ce que tu sais déjà sur le sujet.\n3. Trouve l’idée qui te manque : c’est ce qu’on va apprendre maintenant.\n4. Teste un petit exemple pour vérifier que tu as compris.\nDis-m’en un peu plus (matière et niveau) et je te donne une explication précise.',
  ar: 'سؤال رائع! إليك طريقة للتعامل معه.\n1. أعد صياغة السؤال **بكلماتك الخاصّة**.\n2. اكتب ما تعرفه مسبقًا عنه.\n3. ابحث عن الفكرة التي تنقصك: هي ما سنتعلّمه الآن.\n4. جرّب مثالًا صغيرًا لتتأكّد أنّك فهمت.\nقل لي المزيد (المادّة والمستوى) وسأعطيك شرحًا دقيقًا.',
}

const LEARNING_TIPS = [
  {
    en: 'Study in 25-minute blocks with 5-minute breaks. Your focus stays sharp much longer.',
    fr: 'Travaille par blocs de 25 minutes avec 5 minutes de pause. Ta concentration tient bien plus longtemps.',
    ar: 'ادرس بفترات من 25 دقيقة مع استراحة 5 دقائق. يبقى تركيزك حادًّا لمدّة أطول بكثير.',
  },
  {
    en: 'Explain a new idea out loud as if teaching a friend. Gaps in your understanding show up fast.',
    fr: 'Explique une nouvelle notion à voix haute comme à un ami. Les trous dans ta compréhension apparaissent vite.',
    ar: 'اشرح الفكرة الجديدة بصوت عالٍ كأنّك تعلّمها لصديق. الثغرات في فهمك تظهر بسرعة.',
  },
  {
    en: 'Test yourself instead of re-reading. Recalling an answer makes it stick far better.',
    fr: 'Teste-toi au lieu de relire. Retrouver une réponse de mémoire la fixe bien mieux.',
    ar: 'اختبر نفسك بدل إعادة القراءة. تذكّر الإجابة من الذاكرة يثبّتها أكثر بكثير.',
  },
  {
    en: 'Review your notes the next day, then after a week. Spaced reviews beat one long session.',
    fr: 'Relis tes notes le lendemain, puis une semaine après. Des révisions espacées valent mieux qu’une longue séance.',
    ar: 'راجع ملاحظاتك في اليوم الموالي، ثمّ بعد أسبوع. المراجعات المتباعدة أفضل من حصّة طويلة واحدة.',
  },
  {
    en: 'Put your phone in another room while studying. Even a silent phone pulls at your attention.',
    fr: 'Mets ton téléphone dans une autre pièce pendant que tu révises. Même en silencieux, il attire ton attention.',
    ar: 'ضع هاتفك في غرفة أخرى أثناء الدراسة. حتى الهاتف الصامت يشتّت انتباهك.',
  },
  {
    en: 'Mix different types of exercises in one session. It trains you to pick the right method.',
    fr: 'Mélange différents types d’exercices dans une même séance. Ça t’entraîne à choisir la bonne méthode.',
    ar: 'نوّع أنواع التمارين في الحصّة نفسها. هذا يدرّبك على اختيار الطريقة المناسبة.',
  },
  {
    en: 'Sleep is part of studying: your brain stores what you learned while you rest.',
    fr: 'Le sommeil fait partie des révisions : ton cerveau range ce que tu as appris pendant que tu te reposes.',
    ar: 'النوم جزء من الدراسة: دماغك يخزّن ما تعلّمته وأنت ترتاح.',
  },
  {
    en: 'Stuck on a problem? Write down exactly where you are stuck, then ask tooli about that step.',
    fr: 'Bloqué sur un exercice ? Note exactement où tu bloques, puis demande à tooli pour cette étape.',
    ar: 'عالق في تمرين؟ اكتب بالضبط أين توقّفت، ثمّ اسأل tooli عن تلك الخطوة.',
  },
]

// Error messages the fake API returns, in the student's language
const ERRORS = {
  empty: { en: 'Please type a question first.', fr: 'Écris d’abord ta question.', ar: 'اكتب سؤالك أوّلًا.' },
  tooLong: {
    en: `Please keep your question under ${MAX_QUESTION_LENGTH} characters.`,
    fr: `Ta question doit faire moins de ${MAX_QUESTION_LENGTH} caractères.`,
    ar: `يجب ألّا يتجاوز سؤالك ${MAX_QUESTION_LENGTH} حرف.`,
  },
  failed: {
    en: 'The tutor couldn’t answer right now.',
    fr: 'Le tuteur n’a pas pu répondre pour le moment.',
    ar: 'لم يتمكّن المرشد من الإجابة الآن.',
  },
}

// Seeded texts are { en, fr, ar }, new ones plain strings
const textOf = (value, lang) => (typeof value === 'string' ? value : pick(value, lang))
const publicChat = (chat, lang = currentLanguage()) => ({
  ...chat,
  title: textOf(chat.title, lang),
  messages: chat.messages.map((m) => ({ ...m, text: textOf(m.text, lang) })),
})

// Chat list without the messages, newest first
// TODO(backend): api.get('/tutor/chats')
export async function listChats() {
  await wait()
  return copy(
    [...CHATS]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((chat) => publicChat(chat))
      .map(({ messages, ...chat }) => ({ ...chat, lastMessage: messages.at(-1)?.text ?? '' })),
  )
}

// Returns null when the chat doesn't exist (the API answers 404)
// TODO(backend): api.get(`/tutor/chats/${chatId}`)
export async function getChat(chatId) {
  await wait()
  const found = CHATS.find((c) => c.id === chatId)
  return found ? copy(publicChat(found)) : null
}

// Ask a question. Without chatId a new chat is created (titled after the question).
// `language` ('en' | 'fr' | 'ar') = the language the tutor must answer in (default: the current one).
// Resolves with { chatId, question, answer } once the tutor has "thought" about it.
// TODO(backend): api.post('/tutor/messages', { chatId, question, language })
export async function sendMessage({ chatId, question, language = currentLanguage() }) {
  const text = question.trim()
  if (!text) throw new Error(pick(ERRORS.empty, language))
  if (text.length > MAX_QUESTION_LENGTH) throw new Error(pick(ERRORS.tooLong, language))
  await wait(900, 1600) // the tutor takes a moment to think
  // FAKE only: type "[error]" in a question to see the error state
  if (text.includes('[error]')) throw new Error(pick(ERRORS.failed, language))

  let chat = CHATS.find((c) => c.id === chatId)
  if (!chat) {
    chat = { id: `chat-${Date.now()}`, title: text.length > 48 ? `${text.slice(0, 45)}…` : text, messages: [] }
    CHATS.push(chat)
  }
  const now = minutesAgo(0)
  const asked = { id: `m${chat.messages.length + 1}`, role: 'user', text, createdAt: now }
  const canned = ANSWERS.find((a) => a.keywords.some((k) => hasWord(text, k)))?.text ?? DEFAULT_ANSWER
  const answer = { id: `m${chat.messages.length + 2}`, role: 'tutor', text: pick(canned, language), createdAt: now }
  chat.messages.push(asked, answer)
  chat.updatedAt = now
  return copy({ chatId: chat.id, question: asked, answer })
}

// Short study tips (dashboard "Tip of the day", search), in the requested language
// TODO(backend): api.get('/tips', { q })
export async function getLearningTips({ q } = {}) {
  await wait()
  return LEARNING_TIPS.map((texts, i) => ({ id: `tip-${i + 1}`, text: pick(texts) })).filter((tip) => !q || matches(tip.text, q))
}

// FAKE only (used by services/week.js): how many questions the student asked since `ms`
export function fakeQuestionsSince(ms) {
  return CHATS.flatMap((c) => c.messages).filter((m) => m.role === 'user' && Date.parse(m.createdAt) >= ms).length
}
