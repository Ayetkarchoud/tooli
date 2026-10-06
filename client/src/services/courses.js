// Partner courses (FAKE for now: see docs/api.md for the real endpoints).
// All platforms, courses and numbers below are fictional.
// Texts come in en / fr / ar; the fake returns the current language (the API reads Accept-Language).
// subject and level are ids (the UI translates them: subjects.*, levels.*).

import { copy, daysAgo, matches, pick, wait } from './fake.js'
import i18n from '../lib/i18n.js'

// The 4 partner platforms. `cover` = palette token used for the card cover:
// var(--palette-<cover>). `url` = where "Start" will send the student.
const PLATFORMS = [
  { id: 'learnsphere', name: 'LearnSphere', cover: 'blue', url: 'https://learnsphere.example' },
  { id: 'codenest', name: 'CodeNest', cover: 'violet', url: 'https://codenest.example' },
  { id: 'lingualab', name: 'LinguaLab', cover: 'red', url: 'https://lingualab.example' },
  { id: 'bacboost', name: 'BacBoost', cover: 'green', url: 'https://bacboost.example' },
]

const LEVELS = ['bac', 'prepa', 'university', 'all-levels']

// lessons: [minutes, done?] — their titles are in `text[lang].lessons`, same order
function course({ id, platform, subject, level, rating, reviews, publishedDaysAgo, lessons, text }) {
  return {
    id,
    platform: PLATFORMS.find((p) => p.id === platform),
    subject,
    level,
    rating,
    reviews,
    publishedAt: daysAgo(publishedDaysAgo),
    text,
    lessons: lessons.map(([minutes, done = false], i) => ({ id: `${id}-l${i + 1}`, minutes, done })),
  }
}

// What the API sends: texts in the requested language, duration and progress computed
function publicCourse(c, lang) {
  const text = pick(c.text, lang)
  const doneCount = c.lessons.filter((l) => l.done).length
  return copy({
    id: c.id,
    platform: c.platform,
    title: text.title,
    subject: c.subject,
    level: c.level,
    rating: c.rating,
    reviews: c.reviews,
    publishedAt: c.publishedAt,
    description: text.description,
    outcomes: text.outcomes,
    durationMinutes: c.lessons.reduce((sum, l) => sum + l.minutes, 0),
    lessons: c.lessons.map((l, i) => ({ ...l, title: text.lessons[i] })),
    // null = not started, 0–100 = share of lessons done
    progress: doneCount ? Math.round((doneCount / c.lessons.length) * 100) : null,
  })
}

const COURSES = [
  course({
    id: 'algebra-basics', platform: 'learnsphere', subject: 'mathematics', level: 'bac', rating: 4.8, reviews: 412, publishedDaysAgo: 120,
    lessons: [[18, true], [22, true], [20, true], [16], [30]],
    text: {
      en: {
        title: 'Algebra basics: equations and inequalities',
        description: 'Master the equations and inequalities that come up in every bac maths exam, with short videos and exercises.',
        outcomes: ['Solve linear equations and systems with confidence', 'Work with inequalities and intervals', 'Handle absolute values without traps', 'Tackle bac-style exercises step by step'],
        lessons: ['Linear equations', 'Systems of two equations', 'Inequalities and intervals', 'Absolute values', 'Bac exam practice'],
      },
      fr: {
        title: 'Bases de l’algèbre : équations et inéquations',
        description: 'Maîtrise les équations et inéquations qui tombent à chaque bac de maths, avec des vidéos courtes et des exercices.',
        outcomes: ['Résoudre équations et systèmes en toute confiance', 'Travailler avec les inéquations et les intervalles', 'Gérer les valeurs absolues sans piège', 'Attaquer les exercices type bac étape par étape'],
        lessons: ['Équations du premier degré', 'Systèmes de deux équations', 'Inéquations et intervalles', 'Valeurs absolues', 'Entraînement au bac'],
      },
      ar: {
        title: 'أساسيات الجبر: المعادلات والمتراجحات',
        description: 'تمكّن من المعادلات والمتراجحات التي تأتي في كل امتحان باكالوريا رياضيات، مع فيديوهات قصيرة وتمارين.',
        outcomes: ['حلّ المعادلات والأنظمة بثقة', 'التعامل مع المتراجحات والمجالات', 'القيمة المطلقة دون أخطاء', 'حلّ تمارين على نمط الباكالوريا خطوة بخطوة'],
        lessons: ['المعادلات من الدرجة الأولى', 'نظام معادلتين', 'المتراجحات والمجالات', 'القيمة المطلقة', 'تدرّب على الباكالوريا'],
      },
    },
  }),
  course({
    id: 'derivatives-bac', platform: 'bacboost', subject: 'mathematics', level: 'bac', rating: 4.9, reviews: 638, publishedDaysAgo: 30,
    lessons: [[15], [25], [20], [28], [35]],
    text: {
      en: {
        title: 'Derivatives for the bac, step by step',
        description: 'From “what is a derivative?” to full function studies, with past bac exercises corrected in detail.',
        outcomes: ['Understand what a derivative measures', 'Apply every derivative rule quickly', 'Find tangent lines', 'Study the variations of a function'],
        lessons: ['What a derivative means', 'Derivative rules', 'Tangent lines', 'Variations of a function', 'Past bac exercises'],
      },
      fr: {
        title: 'Les dérivées pour le bac, pas à pas',
        description: 'De « c’est quoi une dérivée ? » à l’étude complète de fonctions, avec des exercices du bac corrigés en détail.',
        outcomes: ['Comprendre ce que mesure une dérivée', 'Appliquer vite toutes les règles de dérivation', 'Trouver une tangente', 'Étudier les variations d’une fonction'],
        lessons: ['Le sens de la dérivée', 'Règles de dérivation', 'Tangentes', 'Variations d’une fonction', 'Exercices du bac'],
      },
      ar: {
        title: 'الاشتقاق للباكالوريا خطوة بخطوة',
        description: 'من «ما هي المشتقة؟» إلى دراسة الدوال كاملة، مع تمارين باكالوريا سابقة مصحّحة بالتفصيل.',
        outcomes: ['فهم ما تقيسه المشتقة', 'تطبيق قواعد الاشتقاق بسرعة', 'إيجاد معادلة المماس', 'دراسة تغيّرات دالة'],
        lessons: ['معنى المشتقة', 'قواعد الاشتقاق', 'المماسات', 'تغيّرات دالة', 'تمارين باكالوريا سابقة'],
      },
    },
  }),
  course({
    id: 'python-beginners', platform: 'codenest', subject: 'computer-science', level: 'all-levels', rating: 4.7, reviews: 1204, publishedDaysAgo: 200,
    lessons: [[12, true], [18, true], [20], [24], [26], [40]],
    text: {
      en: {
        title: 'Python for beginners',
        description: 'Write your first programs in Python and finish with a small quiz game you can show your friends.',
        outcomes: ['Write and run Python programs', 'Use variables, conditions and loops', 'Organise code with functions', 'Build a complete mini project'],
        lessons: ['Your first program', 'Variables and types', 'Conditions', 'Loops', 'Functions', 'Mini project: quiz game'],
      },
      fr: {
        title: 'Python pour débutants',
        description: 'Écris tes premiers programmes en Python et termine avec un petit jeu de quiz à montrer à tes amis.',
        outcomes: ['Écrire et lancer des programmes Python', 'Utiliser variables, conditions et boucles', 'Organiser son code avec des fonctions', 'Réaliser un mini-projet complet'],
        lessons: ['Ton premier programme', 'Variables et types', 'Conditions', 'Boucles', 'Fonctions', 'Mini-projet : jeu de quiz'],
      },
      ar: {
        title: 'بايثون للمبتدئين',
        description: 'اكتب أول برامجك بلغة بايثون واختم بلعبة أسئلة صغيرة تعرضها على أصدقائك.',
        outcomes: ['كتابة برامج بايثون وتشغيلها', 'استعمال المتغيّرات والشروط والحلقات', 'تنظيم الشيفرة بالدوال', 'إنجاز مشروع صغير كامل'],
        lessons: ['برنامجك الأول', 'المتغيّرات والأنواع', 'الشروط', 'الحلقات', 'الدوال', 'مشروع صغير: لعبة أسئلة'],
      },
    },
  }),
  course({
    id: 'english-b2-speaking', platform: 'lingualab', subject: 'english', level: 'all-levels', rating: 4.6, reviews: 356, publishedDaysAgo: 75,
    lessons: [[15, true], [20], [22], [25], [30], [18], [20], [12]],
    text: {
      en: {
        title: 'English B2: speaking with confidence',
        description: 'Speak English more fluently with guided speaking practice, pronunciation tips and exam simulations.',
        outcomes: ['Introduce yourself and give opinions naturally', 'Tell stories in the past', 'Join debates and discussions', 'Prepare for an oral exam'],
        lessons: ['Talking about yourself', 'Giving your opinion', 'Storytelling in the past', 'Debates and discussions', 'Oral exam simulation', 'Pronunciation clinic', 'Final speaking challenge', 'Review'],
      },
      fr: {
        title: 'Anglais B2 : parler avec assurance',
        description: 'Parle anglais plus facilement grâce à des exercices d’oral guidés, des astuces de prononciation et des simulations d’examen.',
        outcomes: ['Te présenter et donner ton avis naturellement', 'Raconter une histoire au passé', 'Participer à des débats', 'Préparer un oral d’examen'],
        lessons: ['Parler de soi', 'Donner son avis', 'Raconter au passé', 'Débats et discussions', 'Simulation d’oral', 'Atelier prononciation', 'Défi oral final', 'Révision'],
      },
      ar: {
        title: 'الإنجليزية B2: تحدّث بثقة',
        description: 'تحدّث الإنجليزية بطلاقة أكبر مع تمارين شفوية موجّهة ونصائح للنطق ومحاكاة للامتحان.',
        outcomes: ['تقديم نفسك وإبداء رأيك بشكل طبيعي', 'سرد قصة بصيغة الماضي', 'المشاركة في النقاشات', 'الاستعداد للامتحان الشفوي'],
        lessons: ['التحدّث عن نفسك', 'إبداء الرأي', 'السرد بصيغة الماضي', 'نقاشات وحوارات', 'محاكاة الامتحان الشفوي', 'ورشة النطق', 'التحدّي الشفوي الأخير', 'مراجعة'],
      },
    },
  }),
  course({
    id: 'physics-mechanics', platform: 'learnsphere', subject: 'physics', level: 'bac', rating: 4.7, reviews: 289, publishedDaysAgo: 60,
    lessons: [[24], [20], [26], [22]],
    text: {
      en: {
        title: 'Mechanics: forces and motion',
        description: 'Newton’s laws, free fall and energy explained with everyday examples and bac-style problems.',
        outcomes: ['Apply Newton’s three laws', 'Describe free fall and projectile motion', 'Use energy conservation', 'Draw clear force diagrams'],
        lessons: ['Newton’s laws', 'Free fall', 'Projectile motion', 'Energy and work'],
      },
      fr: {
        title: 'Mécanique : forces et mouvement',
        description: 'Les lois de Newton, la chute libre et l’énergie expliquées avec des exemples du quotidien et des problèmes type bac.',
        outcomes: ['Appliquer les trois lois de Newton', 'Décrire la chute libre et le mouvement d’un projectile', 'Utiliser la conservation de l’énergie', 'Faire des schémas de forces clairs'],
        lessons: ['Les lois de Newton', 'La chute libre', 'Mouvement d’un projectile', 'Énergie et travail'],
      },
      ar: {
        title: 'الميكانيك: القوى والحركة',
        description: 'قوانين نيوتن والسقوط الحرّ والطاقة بأمثلة من الحياة اليومية ومسائل على نمط الباكالوريا.',
        outcomes: ['تطبيق قوانين نيوتن الثلاثة', 'وصف السقوط الحرّ وحركة القذيفة', 'استعمال انحفاظ الطاقة', 'رسم مخطّطات قوى واضحة'],
        lessons: ['قوانين نيوتن', 'السقوط الحرّ', 'حركة القذيفة', 'الطاقة والعمل'],
      },
    },
  }),
  course({
    id: 'svt-genetics', platform: 'bacboost', subject: 'biology', level: 'bac', rating: 4.8, reviews: 377, publishedDaysAgo: 14,
    lessons: [[18], [22], [26], [30]],
    text: {
      en: {
        title: 'SVT: genetics made simple',
        description: 'Genes, heredity and genetic crosses made visual, with the exact problem types of the SVT bac.',
        outcomes: ['Explain DNA, genes and alleles', 'Apply Mendel’s laws', 'Solve genetic cross problems', 'Answer bac-style questions'],
        lessons: ['DNA and genes', 'Mendel and heredity', 'Genetic crosses', 'Bac-style problems'],
      },
      fr: {
        title: 'SVT : la génétique en toute simplicité',
        description: 'Gènes, hérédité et croisements expliqués avec des schémas, sur les types d’exercices exacts du bac SVT.',
        outcomes: ['Expliquer ADN, gènes et allèles', 'Appliquer les lois de Mendel', 'Résoudre des exercices de croisement', 'Répondre aux questions type bac'],
        lessons: ['ADN et gènes', 'Mendel et l’hérédité', 'Croisements génétiques', 'Exercices type bac'],
      },
      ar: {
        title: 'علوم الحياة والأرض: الوراثة ببساطة',
        description: 'المورّثات والوراثة والتزاوج بشرح مصوّر، على نفس أنواع تمارين باكالوريا علوم الحياة والأرض.',
        outcomes: ['شرح الـ ADN والمورّثات والحليلات', 'تطبيق قوانين مندل', 'حلّ تمارين التزاوج', 'الإجابة عن أسئلة على نمط الباكالوريا'],
        lessons: ['الـ ADN والمورّثات', 'مندل والوراثة', 'التزاوجات الوراثية', 'تمارين على نمط الباكالوريا'],
      },
    },
  }),
  course({
    id: 'prepa-analysis', platform: 'learnsphere', subject: 'mathematics', level: 'prepa', rating: 4.9, reviews: 198, publishedDaysAgo: 45,
    lessons: [[30], [28], [35], [45]],
    text: {
      en: {
        title: 'Prépa analysis: sequences and series',
        description: 'Rigorous sequences and series for prépa students, with classic concours exercises and full proofs.',
        outcomes: ['Prove limits of sequences', 'Use monotonic and adjacent sequences', 'Study convergence of series', 'Write clean concours-level proofs'],
        lessons: ['Limits of sequences', 'Monotonic sequences', 'Series and convergence', 'Classic concours exercises'],
      },
      fr: {
        title: 'Analyse en prépa : suites et séries',
        description: 'Suites et séries en toute rigueur pour les élèves de prépa, avec des exercices classiques de concours et des preuves complètes.',
        outcomes: ['Démontrer des limites de suites', 'Utiliser suites monotones et adjacentes', 'Étudier la convergence des séries', 'Rédiger des preuves niveau concours'],
        lessons: ['Limites de suites', 'Suites monotones', 'Séries et convergence', 'Exercices classiques de concours'],
      },
      ar: {
        title: 'التحليل في الأقسام التحضيرية: المتتاليات والسلاسل',
        description: 'المتتاليات والسلاسل بكل دقّة لطلبة الأقسام التحضيرية، مع تمارين مناظرات كلاسيكية وبراهين كاملة.',
        outcomes: ['البرهنة على نهايات المتتاليات', 'استعمال المتتاليات الرتيبة والمتجاورة', 'دراسة تقارب السلاسل', 'كتابة براهين بمستوى المناظرات'],
        lessons: ['نهايات المتتاليات', 'المتتاليات الرتيبة', 'السلاسل والتقارب', 'تمارين مناظرات كلاسيكية'],
      },
    },
  }),
  course({
    id: 'prepa-chemistry', platform: 'bacboost', subject: 'chemistry', level: 'prepa', rating: 4.6, reviews: 143, publishedDaysAgo: 90,
    lessons: [[30], [28], [32], [34]],
    text: {
      en: {
        title: 'Prépa chemistry: thermodynamics',
        description: 'The first and second principles, enthalpy and equilibrium, with method sheets for every type of exercise.',
        outcomes: ['Apply the first and second principles', 'Compute enthalpy and entropy changes', 'Predict chemical equilibrium', 'Use a clear method for each exercise'],
        lessons: ['First principle', 'Enthalpy', 'Second principle and entropy', 'Chemical equilibrium'],
      },
      fr: {
        title: 'Chimie en prépa : thermodynamique',
        description: 'Premier et second principes, enthalpie et équilibres, avec une fiche méthode pour chaque type d’exercice.',
        outcomes: ['Appliquer les premier et second principes', 'Calculer variations d’enthalpie et d’entropie', 'Prévoir un équilibre chimique', 'Suivre une méthode claire pour chaque exercice'],
        lessons: ['Premier principe', 'Enthalpie', 'Second principe et entropie', 'Équilibres chimiques'],
      },
      ar: {
        title: 'الكيمياء في الأقسام التحضيرية: التحريك الحراري',
        description: 'المبدأ الأول والثاني والإنتالبي والتوازن، مع بطاقة منهجية لكل نوع من التمارين.',
        outcomes: ['تطبيق المبدأين الأول والثاني', 'حساب تغيّرات الإنتالبي والإنتروبي', 'توقّع التوازن الكيميائي', 'اتباع منهجية واضحة لكل تمرين'],
        lessons: ['المبدأ الأول', 'الإنتالبي', 'المبدأ الثاني والإنتروبي', 'التوازن الكيميائي'],
      },
    },
  }),
  course({
    id: 'web-html-css', platform: 'codenest', subject: 'computer-science', level: 'all-levels', rating: 4.8, reviews: 954, publishedDaysAgo: 7,
    lessons: [[10], [20], [25], [28], [15]],
    text: {
      en: {
        title: 'Build your first website with HTML and CSS',
        description: 'Go from a blank page to a published personal website, one small step at a time.',
        outcomes: ['Structure pages with HTML', 'Style them with CSS', 'Build layouts with flexbox', 'Publish your site online'],
        lessons: ['How the web works', 'HTML structure', 'Styling with CSS', 'Layouts with flexbox', 'Publish your site'],
      },
      fr: {
        title: 'Crée ton premier site web en HTML et CSS',
        description: 'D’une page blanche à un site personnel en ligne, une petite étape à la fois.',
        outcomes: ['Structurer des pages en HTML', 'Les mettre en forme avec CSS', 'Faire des mises en page avec flexbox', 'Publier ton site en ligne'],
        lessons: ['Comment marche le web', 'Structure HTML', 'Mise en forme avec CSS', 'Mises en page avec flexbox', 'Publier ton site'],
      },
      ar: {
        title: 'أنشئ أول موقع ويب لك بـ HTML و CSS',
        description: 'من صفحة بيضاء إلى موقع شخصي منشور على الإنترنت، خطوة صغيرة في كل مرة.',
        outcomes: ['هيكلة الصفحات بـ HTML', 'تنسيقها بـ CSS', 'تصميم التخطيط بـ flexbox', 'نشر موقعك على الإنترنت'],
        lessons: ['كيف يعمل الويب', 'هيكلة HTML', 'التنسيق بـ CSS', 'التخطيط بـ flexbox', 'انشر موقعك'],
      },
    },
  }),
  course({
    id: 'uni-statistics', platform: 'learnsphere', subject: 'mathematics', level: 'university', rating: 4.5, reviews: 221, publishedDaysAgo: 150,
    lessons: [[22], [26], [28], [32]],
    text: {
      en: {
        title: 'Statistics for university students',
        description: 'Descriptive statistics, probability and hypothesis tests, with real datasets and clear intuition first.',
        outcomes: ['Describe and visualise data', 'Reason with probabilities', 'Use the normal distribution', 'Run and interpret hypothesis tests'],
        lessons: ['Describing data', 'Probability basics', 'Normal distribution', 'Hypothesis tests'],
      },
      fr: {
        title: 'Statistiques pour étudiants',
        description: 'Statistiques descriptives, probabilités et tests d’hypothèses, avec de vraies données et l’intuition d’abord.',
        outcomes: ['Décrire et représenter des données', 'Raisonner avec les probabilités', 'Utiliser la loi normale', 'Mener et interpréter des tests d’hypothèses'],
        lessons: ['Décrire des données', 'Bases des probabilités', 'La loi normale', 'Tests d’hypothèses'],
      },
      ar: {
        title: 'الإحصاء لطلبة الجامعة',
        description: 'الإحصاء الوصفي والاحتمالات واختبارات الفرضيات، ببيانات حقيقية وفهم بديهي أوّلًا.',
        outcomes: ['وصف البيانات وتمثيلها', 'الاستدلال بالاحتمالات', 'استعمال التوزيع الطبيعي', 'إجراء اختبارات الفرضيات وتفسيرها'],
        lessons: ['وصف البيانات', 'أساسيات الاحتمالات', 'التوزيع الطبيعي', 'اختبارات الفرضيات'],
      },
    },
  }),
  course({
    id: 'french-bac-essay', platform: 'lingualab', subject: 'french', level: 'bac', rating: 4.7, reviews: 305, publishedDaysAgo: 21,
    lessons: [[18], [22], [20], [26], [16]],
    text: {
      en: {
        title: 'French: acing the bac essay',
        description: 'A clear method to analyse the subject, build a plan and write a solid “dissertation” for the French bac.',
        outcomes: ['Analyse any essay subject', 'Build a clear plan', 'Write a strong introduction and conclusion', 'Choose convincing arguments and examples'],
        lessons: ['Understanding the subject', 'Building a plan', 'Writing the introduction', 'Arguments and examples', 'Conclusion and review'],
      },
      fr: {
        title: 'Français : réussir la dissertation du bac',
        description: 'Une méthode claire pour analyser le sujet, construire un plan et rédiger une dissertation solide.',
        outcomes: ['Analyser n’importe quel sujet', 'Construire un plan clair', 'Rédiger une introduction et une conclusion fortes', 'Choisir des arguments et des exemples convaincants'],
        lessons: ['Comprendre le sujet', 'Construire un plan', 'Rédiger l’introduction', 'Arguments et exemples', 'Conclusion et relecture'],
      },
      ar: {
        title: 'الفرنسية: النجاح في مقال الباكالوريا',
        description: 'منهجية واضحة لتحليل الموضوع وبناء خطّة وكتابة مقال (dissertation) متين في الفرنسية.',
        outcomes: ['تحليل أيّ موضوع مقال', 'بناء خطّة واضحة', 'كتابة مقدّمة وخاتمة قويّتين', 'اختيار حجج وأمثلة مقنعة'],
        lessons: ['فهم الموضوع', 'بناء الخطّة', 'كتابة المقدّمة', 'الحجج والأمثلة', 'الخاتمة والمراجعة'],
      },
    },
  }),
  course({
    id: 'uni-algorithms', platform: 'codenest', subject: 'computer-science', level: 'university', rating: 4.8, reviews: 467, publishedDaysAgo: 100,
    lessons: [[25], [30], [28], [32], [35]],
    text: {
      en: {
        title: 'Algorithms and data structures',
        description: 'The algorithms and data structures every computer science student needs, with visual explanations.',
        outcomes: ['Measure complexity with big O', 'Implement the main sorting algorithms', 'Use stacks, queues, lists and trees', 'Explore graphs'],
        lessons: ['Complexity and big O', 'Sorting algorithms', 'Stacks, queues and lists', 'Trees', 'Graphs'],
      },
      fr: {
        title: 'Algorithmique et structures de données',
        description: 'Les algorithmes et structures de données indispensables en informatique, avec des explications visuelles.',
        outcomes: ['Mesurer la complexité (notation O)', 'Coder les principaux algorithmes de tri', 'Utiliser piles, files, listes et arbres', 'Explorer les graphes'],
        lessons: ['Complexité et notation O', 'Algorithmes de tri', 'Piles, files et listes', 'Arbres', 'Graphes'],
      },
      ar: {
        title: 'الخوارزميات وهياكل البيانات',
        description: 'الخوارزميات وهياكل البيانات التي يحتاجها كلّ طالب إعلامية، مع شروحات مرئية.',
        outcomes: ['قياس التعقيد (ترميز O الكبير)', 'برمجة أهمّ خوارزميات الترتيب', 'استعمال المكدّسات والطوابير والقوائم والأشجار', 'استكشاف البيانات البيانية (Graphs)'],
        lessons: ['التعقيد وترميز O', 'خوارزميات الترتيب', 'المكدّسات والطوابير والقوائم', 'الأشجار', 'البيانات البيانية'],
      },
    },
  }),
]

// FAKE: when lessons were marked done (ms). Starts with 3 lessons earlier this week.
const LESSONS_DONE_AT = [1, 2, 4].map((d) => Date.now() - d * 86_400_000)

// FAKE only (used by services/week.js)
export const fakeLessonsDoneSince = (ms) => LESSONS_DONE_AT.filter((t) => t >= ms).length

// Error messages the fake API returns, in the student's language
const ERRORS = {
  lessonNotFound: { en: 'Lesson not found.', fr: 'Leçon introuvable.', ar: 'الدرس غير موجود.' },
}

const SORTS = {
  popular: (a, b) => b.reviews - a.reviews,
  newest: (a, b) => b.publishedAt.localeCompare(a.publishedAt),
  shortest: (a, b) => a.durationMinutes - b.durationMinutes,
}

// sort: 'popular' (default) | 'newest' | 'shortest'. platform = platform id. q matches title, subject, platform.
// TODO(backend): api.get('/courses', { subject, level, platform, q, sort })
export async function listCourses({ subject, level, platform, q, sort = 'popular' } = {}) {
  await wait()
  return COURSES.map((c) => publicCourse(c))
    .filter(
      (c) =>
        (!subject || c.subject === subject) &&
        (!level || c.level === level) &&
        (!platform || c.platform.id === platform) &&
        (!q || matches(`${c.title} ${i18n.t(`subjects.${c.subject}`)} ${c.subject} ${c.platform.name}`, q)),
    )
    .sort(SORTS[sort] ?? SORTS.popular)
}

// Everything the filter chips need, in display order (ids; the UI translates subjects and levels)
// TODO(backend): api.get('/courses/filters')
export async function getCourseFilters() {
  await wait()
  return copy({
    subjects: [...new Set(COURSES.map((c) => c.subject))].sort(),
    levels: LEVELS,
    platforms: PLATFORMS.map(({ id, name }) => ({ id, name })),
  })
}

// Returns null when the course doesn't exist (the API answers 404)
// TODO(backend): api.get(`/courses/${courseId}`)
export async function getCourse(courseId) {
  await wait()
  const found = COURSES.find((c) => c.id === courseId)
  return found ? publicCourse(found) : null
}

// Courses the user has started but not finished, most advanced first
// TODO(backend): api.get('/courses/continue')
export async function getContinueLearning() {
  await wait()
  return COURSES.map((c) => publicCourse(c))
    .filter((c) => c.progress > 0 && c.progress < 100)
    .sort((a, b) => b.progress - a.progress)
}

// Mark a lesson done (or not done) and get the updated course back
// TODO(backend): api.put(`/courses/${courseId}/lessons/${lessonId}`, { done })
export async function setLessonDone(courseId, lessonId, done) {
  await wait()
  const found = COURSES.find((c) => c.id === courseId)
  const lesson = found?.lessons.find((l) => l.id === lessonId)
  if (!lesson) throw new Error(pick(ERRORS.lessonNotFound))
  lesson.done = done
  if (done) LESSONS_DONE_AT.push(Date.now())
  else LESSONS_DONE_AT.pop()
  return publicCourse(found)
}
