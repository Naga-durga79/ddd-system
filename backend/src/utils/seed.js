const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const { Module, Section, Quiz } = require('../models/Module');
const { Question, Session, Attempt } = require('../models/Attempt');
const { Badge, Achievement } = require('../models/Badge');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ddd_system';

const rand     = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(2));

// ─────────────────────────────────────────────────────────────────────────────
//  ALL STUDENTS
//  • Spandan & peers  — fake emails / fake HP / fake csProgress (same role: student)
//  • Real cohort      — real emails, real HP from leaderboard, real csProgress
// ─────────────────────────────────────────────────────────────────────────────
const ALL_STUDENTS = [
  // ── Spandan & Peers (fake data, student role) ─────────────────────────────
  { name: 'Spandan Majumdar',       email: 'spandan.majumdar@vibebootcamp.dev',  currentHP: 194.20, csProgress: 100,   rank: 2   },
  { name: 'Aryan Dev',              email: 'aryandev@vibebootcamp.dev',           currentHP: 183.20, csProgress: 100,   rank: 11  },
  { name: 'Priya Chatterjee',       email: 'priya.chatterjee@vibebootcamp.dev',  currentHP: 176.80, csProgress: 100,   rank: 22  },
  { name: 'Rohan Bose',             email: 'rohan.bose@vibebootcamp.dev',         currentHP: 174.50, csProgress: 100,   rank: 29  },
  { name: 'Ananya Dasgupta',        email: 'ananya.dasgupta@vibebootcamp.dev',   currentHP: 171.30, csProgress: 100,   rank: 36  },
  { name: 'Siddharth Nair',         email: 'sid.nair@vibebootcamp.dev',           currentHP: 165.90, csProgress: 90.48, rank: 50  },
  { name: 'Kritika Sharma',         email: 'kritika.sharma@vibebootcamp.dev',    currentHP: 159.20, csProgress: 85.71, rank: 61  },
  { name: 'Aditya Banerjee',        email: 'aditya.banerjee@vibebootcamp.dev',   currentHP: 154.80, csProgress: 80.95, rank: 70  },
  { name: 'Meghna Roy',             email: 'meghna.roy@vibebootcamp.dev',         currentHP: 148.60, csProgress: 71.43, rank: 82  },
  { name: 'Vikrant Pillai',         email: 'vikrant.pillai@vibebootcamp.dev',    currentHP: 139.40, csProgress: 66.67, rank: 95  },

  // ── Real cohort — top tier (HP 187–197, CS 100%) ──────────────────────────
  { name: 'Nikhil Kumawat',               email: 'nikhil.jjn2006@gmail.com',                currentHP: 196.98, csProgress: 100,  rank: 1   },
  { name: 'V S I Raju',                   email: 'vsiraju3690@gmail.com',                   currentHP: 187.60, csProgress: 100,  rank: 3   },
  { name: 'Md Wasim',                     email: 'mdwasim19485@gmail.com',                  currentHP: 187.60, csProgress: 100,  rank: 4   },
  { name: 'Sharonya Banerjee CHS',        email: 'sharonyamita@gmail.com',                  currentHP: 187.60, csProgress: 100,  rank: 5   },
  { name: 'Jyothika Duggempudi',          email: 'jyothikaduggempudi@gmail.com',            currentHP: 187.60, csProgress: 100,  rank: 6   },
  { name: 'Shreyasi Paul',                email: 'shreyasi.paul.net@gmail.com',             currentHP: 187.60, csProgress: 100,  rank: 7   },
  { name: 'Tanmay Chakraborty',           email: 'tanmay.chakraborty2024.1@iem.edu.in',     currentHP: 187.60, csProgress: 100,  rank: 8   },
  { name: 'Ayush Sahu',                   email: 'ayushsahurajmarg@gmail.com',              currentHP: 187.60, csProgress: 100,  rank: 9   },
  { name: 'MOHINI MATHANIKAR',            email: 'mohinimathanikar4905@gmail.com',          currentHP: 187.60, csProgress: 100,  rank: 10  },
  { name: 'Anam Jumnal',                  email: 'anamjumnal908@gmail.com',                 currentHP: 187.60, csProgress: 100,  rank: 12  },
  { name: 'Shivani Negi',                 email: 'shivaninegi1602@gmail.com',               currentHP: 187.60, csProgress: 100,  rank: 13  },
  { name: 'Daameni Govathoti',            email: 'gdaameni777@gmail.com',                   currentHP: 187.60, csProgress: 100,  rank: 14  },
  { name: 'Venkata mahendra Nandam',      email: 'venkatamahendranandam@gmail.com',         currentHP: 187.60, csProgress: 100,  rank: 15  },
  { name: 'Manogna Bethapudi',            email: 'manognabethapudi@gmail.com',              currentHP: 187.60, csProgress: 100,  rank: 16  },
  { name: 'Rahul Cheedella',              email: 'rahulcheedella@gmail.com',                currentHP: 187.60, csProgress: 100,  rank: 17  },
  { name: 'Aman Kumar',                   email: 'traitorboy921@gmail.com',                 currentHP: 187.60, csProgress: 100,  rank: 18  },
  { name: 'Aditya Kumar',                 email: 'adityakumargupta082003@gmail.com',        currentHP: 187.60, csProgress: 100,  rank: 19  },
  { name: 'Pavithra Sree Pasumarthi',     email: 'ppavithrasree@gmail.com',                 currentHP: 187.60, csProgress: 100,  rank: 20  },
  { name: 'K Abhi Ram Reddy',             email: 'abhiramreddy123.k@gmail.com',             currentHP: 187.60, csProgress: 100,  rank: 21  },
  { name: 'DHANYA RAJU',                  email: 'dhanya03raju@gmail.com',                  currentHP: 187.60, csProgress: 100,  rank: 23  },
  { name: 'Jaswanth Koppireddy',          email: 'jaswanthkoppireddy2006@gmail.com',        currentHP: 187.60, csProgress: 100,  rank: 24  },
  { name: 'MAYANK RAI',                   email: 'mayank.raids2024@indoreinstitute.com',    currentHP: 187.60, csProgress: 100,  rank: 25  },
  { name: 'Manish Kumar',                 email: 'manishkumar020703@gmail.com',             currentHP: 187.60, csProgress: 100,  rank: 26  },
  { name: 'Kushagra Dewangan',            email: 'kushagradew2007@gmail.com',               currentHP: 187.60, csProgress: 100,  rank: 27  },

  // ── Real cohort — high tier (HP ~178, CS 100%) ────────────────────────────
  { name: 'Arunthathi N',                 email: 'agasthiyanagaraj91@gmail.com',            currentHP: 178.67, csProgress: 100,  rank: 28  },
  { name: 'Avi Kedare',                   email: 'avikedare75@gmail.com',                   currentHP: 178.67, csProgress: 100,  rank: 30  },
  { name: 'Kolasani Mahendra Krishna',    email: 'mahendrakolasani@gmail.com',              currentHP: 178.67, csProgress: 100,  rank: 31  },
  { name: 'Lekshmi Prasad',              email: 'lekshmiprasadpp@gmail.com',               currentHP: 178.67, csProgress: 100,  rank: 32  },
  { name: 'Ayush Patel',                  email: 'ayushpatel15673@gmail.com',               currentHP: 178.67, csProgress: 100,  rank: 33  },
  { name: 'Varshneya',                    email: 'varshneya3182@gmail.com',                 currentHP: 178.67, csProgress: 100,  rank: 34  },
  { name: 'Dipesh Patidar',              email: 'dipupatidar.6264@gmail.com',              currentHP: 178.67, csProgress: 100,  rank: 35  },
  { name: 'Raghavendra Patne',           email: 'rpatne12@gmail.com',                      currentHP: 178.67, csProgress: 100,  rank: 37  },
  { name: 'Reddi Harika',                 email: '323103310206@gvpce.ac.in',                currentHP: 178.67, csProgress: 100,  rank: 38  },
  { name: 'Anshu Bilawliya',             email: 'anshubilawliya2728@gmail.com',            currentHP: 178.67, csProgress: 100,  rank: 39  },
  { name: 'Shravani Mane',              email: 'maneshravani35@gmail.com',                 currentHP: 178.67, csProgress: 100,  rank: 40  },
  { name: 'Thurakapalli Srikanth',       email: 'srikanththurakapalli@gmail.com',           currentHP: 178.67, csProgress: 100,  rank: 41  },
  { name: 'Krishna',                      email: 'krishnapassi92@gmail.com',                currentHP: 178.67, csProgress: 100,  rank: 42  },
  { name: 'Krishna Kumar Singh',         email: 'krishna97802@gmail.com',                  currentHP: 178.67, csProgress: 100,  rank: 43  },
  { name: 'Kowsalya Peetha',             email: 'peethakowsalya@gmail.com',                currentHP: 178.67, csProgress: 100,  rank: 44  },
  { name: 'KESHAV PATIDAR',              email: 'keshavpatidar231235@acropolis.in',        currentHP: 178.67, csProgress: 100,  rank: 45  },
  { name: 'Subham Sadangi',              email: '24cseds031.subhamsadangi@giet.edu',       currentHP: 178.67, csProgress: 100,  rank: 46  },
  { name: 'Sawan Kumar',                 email: 'sawanmahna@gmail.com',                    currentHP: 178.67, csProgress: 100,  rank: 47  },
  { name: 'MAINAK KUNDU',                email: 'mainakkundu13@gmail.com',                 currentHP: 178.67, csProgress: 100,  rank: 48  },

  // ── Real cohort — mid tier (HP 169–170, CS 100%) ──────────────────────────
  { name: 'SANVI NAHAR',                  email: 'sanvinahar230695@acropolis.in',           currentHP: 170.16, csProgress: 100,  rank: 49  },
  { name: 'Rishabh Ranjan',               email: 'rishabh17717@gmail.com',                  currentHP: 170.16, csProgress: 100,  rank: 51  },
  { name: 'Mayank Pandey',               email: 'mayank131608@gmail.com',                  currentHP: 170.16, csProgress: 100,  rank: 52  },
  { name: 'Nandhini A T',                 email: 'nandhiniat2008@gmail.com',                currentHP: 170.16, csProgress: 100,  rank: 53  },
  { name: 'Madathanapalle Leena',         email: 'leena91919@gmail.com',                   currentHP: 170.16, csProgress: 100,  rank: 54  },
  { name: 'Akish Pandey',                 email: 'akishpandey2006@gmail.com',              currentHP: 170.16, csProgress: 100,  rank: 55  },
  { name: 'Durgesh Gupta',               email: 'durgs7642@gmail.com',                     currentHP: 170.16, csProgress: 100,  rank: 56  },
  { name: 'Seshadri naidu Manuvarthi',   email: 'seshmanuvarthi27@gmail.com',              currentHP: 170.16, csProgress: 100,  rank: 57  },
  { name: 'Tejasri Bobba',               email: 'bobbatejasri1@gmail.com',                 currentHP: 170.16, csProgress: 100,  rank: 58  },
  { name: 'Aryan Maheshwari',            email: 'aryms083@gmail.com',                      currentHP: 170.16, csProgress: 100,  rank: 59  },
  { name: 'DEVULAPALLI PAVANA KRISHNA',  email: 'pavanakrishna25@gmail.com',               currentHP: 170.16, csProgress: 100,  rank: 60  },
  { name: 'Noval Fernandes',             email: 'novalfernandes9@gmail.com',               currentHP: 170.16, csProgress: 100,  rank: 62  },
  { name: 'Akhil R',                      email: 'akhilradhakrishnan15@gmail.com',          currentHP: 169.74, csProgress: 100,  rank: 63  },
  { name: 'Khushi Kumari',               email: 'khushikumari18012006@gmail.com',          currentHP: 169.74, csProgress: 100,  rank: 64  },
  { name: 'Nitin Barak',                  email: 'baraknitin08@gmail.com',                  currentHP: 169.74, csProgress: 100,  rank: 65  },
  { name: 'Gurnain kaur',                email: 'kaurgurnain50@gmail.com',                 currentHP: 169.74, csProgress: 100,  rank: 66  },
  { name: 'Saransh jha',                  email: 'saranshjha06@gmail.com',                  currentHP: 161.65, csProgress: 100,  rank: 67  },
  { name: 'SAKSHI GUPTA',                email: 'sakshigupta230987@acropolis.in',           currentHP: 153.96, csProgress: 100,  rank: 69  },
  { name: 'Pooja Gaygaye',               email: 'poojagaygaye3@gmail.com',                 currentHP: 153.49, csProgress: 100,  rank: 72  },
  { name: 'Aditya Singh Khagi',          email: '246301012@gkv.ac.in',                     currentHP: 153.49, csProgress: 100,  rank: 73  },
  { name: 'Tanya Kumari',                email: 'tanyakumari.51111@gmail.com',             currentHP: 146.19, csProgress: 100,  rank: 79  },
  { name: 'NALLA NAGADURGA',             email: 'nagadurganalla79@gmail.com',              currentHP: 146.19, csProgress: 100,  rank: 80  },
  { name: 'Ratnesh Ranjan',              email: 'ratneshranjan484@gmail.com',              currentHP: 138.88, csProgress: 100,  rank: 84  },
  { name: 'Sunmathi',                     email: 'sunmathireporter@gmail.com',              currentHP: 138.88, csProgress: 100,  rank: 85  },
  { name: 'Nandini Singhal',             email: 'nandinisinghal2006@gmail.com',            currentHP: 132.26, csProgress: 100,  rank: 103 },
  { name: 'Girish jain',                 email: 'girishjainl3016@gmail.com',              currentHP: 103.11, csProgress: 100,  rank: 151 },
  { name: 'Adhin Mahesh',                email: 'adhinmahesh6@gmail.com',                  currentHP: 108.12, csProgress: 100,  rank: 150 },
  { name: 'Ayushi',                       email: 'ayushijangid14518@gmail.com',             currentHP: 125.96, csProgress: 100,  rank: 108 },

  // ── Partial progress ──────────────────────────────────────────────────────
  { name: 'Rithika Hamsa',               email: 'rithikahamsa0@gmail.com',                 currentHP: 139.22, csProgress: 83.33, rank: 83  },
  { name: 'Mohit Raj',                   email: 'mohitraj191130@gmail.com',                currentHP: 132.26, csProgress: 78.57, rank: 92  },
  { name: 'Dharshini N',                 email: 'dharshinin122006@gmail.com',              currentHP: 113.97, csProgress: 69.05, rank: 125 },
  { name: 'K Maha',                      email: 'kmaha132005@gmail.com',                   currentHP: 113.97, csProgress: 59.52, rank: 124 },
  { name: 'Jayapradha lakshmi S',        email: 'jayapradha1038@gmail.com',                currentHP: 113.97, csProgress: 47.62, rank: 126 },
  { name: 'Sujoy Giri',                  email: 'sujoygiri08@gmail.com',                   currentHP: 132.26, csProgress: 45.24, rank: 91  },
  { name: 'Gahan Das',                   email: '1234gahandas@gmail.com',                  currentHP: 103.11, csProgress: 45.24, rank: 153 },
  { name: 'Kanishka Kanishka',           email: 'kanishkasaravanan2006@gmail.com',         currentHP: 125.96, csProgress: 45.24, rank: 106 },
  { name: 'Aditya Raghuvanshi',          email: 'adityaraghuvanshi@zohomail.in',           currentHP: 132.26, csProgress: 42.86, rank: 93  },
  { name: 'George Kritsotakis',          email: 'george@kritsotakis.gr',                   currentHP: 125.96, csProgress: 42.86, rank: 107 },
  { name: 'DHARANISH B',                 email: 'dharani.priya430@gmail.com',              currentHP: 103.11, csProgress: 4.76,  rank: 152 },

  // ── Zero / very low progress ──────────────────────────────────────────────
  { name: 'Alka Varma',                  email: 'alkavarma0306@gmail.com',                 currentHP: 93.29,  csProgress: 0,    rank: 167 },
  { name: 'Manoranjith Sathishkumar',    email: 'manoranjithmanoranjith254@gmail.com',     currentHP: 93.29,  csProgress: 0,    rank: 168 },
  { name: 'Sai Sri',                     email: 'saisripadma321@gmail.com',                currentHP: 93.29,  csProgress: 0,    rank: 169 },
  { name: 'Deepika R',                   email: 'deepikarramkumar@gmail.com',              currentHP: 93.29,  csProgress: 0,    rank: 173 },
  { name: 'Ponmudi L',                   email: 'lponmudi267@gmail.com',                   currentHP: 93.29,  csProgress: 0,    rank: 182 },
];

// ─────────────────────────────────────────────────────────────────────────────
//  COURSE STRUCTURE
//  Mirrors the real Vibe cohort: TS (19 CS) · React (10 CS) · MongoDB (3 CS) · Express (10 CS)
// ─────────────────────────────────────────────────────────────────────────────
const COURSE_MODULES = [
  {
    title: 'TypeScript Fundamentals',
    description: 'Core TS — types, interfaces, generics, utility types (19 case studies)',
    coverColor: '#3178c6',
    sections: [
      { title: 'Types & Interfaces',       quizzes: ['Type Basics Quiz',        'Advanced Interfaces Quiz']     },
      { title: 'Generics & Utility Types', quizzes: ['Generics Deep Dive',      'Mapped & Conditional Types']  },
      { title: 'Async TypeScript',          quizzes: ['Promises & async/await',  'Error Handling Patterns']     },
      { title: 'Decorators & Metadata',    quizzes: ['Class Decorators',         'Method & Property Decorators']},
      { title: 'TypeScript in Practice',   quizzes: ['TS Config & Tooling',      'Migration Strategies']        },
    ],
  },
  {
    title: 'React Ecosystem',
    description: 'Modern React — hooks, context, performance, patterns (10 case studies)',
    coverColor: '#61dafb',
    sections: [
      { title: 'Hooks & State',             quizzes: ['useState & useReducer',      'useEffect & Custom Hooks']    },
      { title: 'Context & Data Flow',       quizzes: ['Context API',                'State Management Patterns']   },
      { title: 'Performance Optimisation',  quizzes: ['Memoization Techniques',     'Code Splitting & Suspense']   },
      { title: 'React Testing',             quizzes: ['React Testing Library',       'Integration Testing']         },
      { title: 'Next.js Basics',            quizzes: ['SSR & SSG',                  'App Router Patterns']         },
    ],
  },
  {
    title: 'MongoDB & NoSQL',
    description: 'Document databases, aggregation pipelines, Mongoose ODM (3 case studies)',
    coverColor: '#00ed64',
    sections: [
      { title: 'MongoDB Core',              quizzes: ['CRUD Operations',            'Query Operators']             },
      { title: 'Aggregation Pipeline',      quizzes: ['Stages & Expressions',       'Lookup & Facets']             },
      { title: 'Mongoose ODM',              quizzes: ['Schemas & Models',           'Middleware & Virtuals']       },
    ],
  },
  {
    title: 'Express & Node.js',
    description: 'Server-side JS — REST APIs, middleware, auth, WebSockets (10 case studies)',
    coverColor: '#68a063',
    sections: [
      { title: 'Express Fundamentals',      quizzes: ['Routing Basics',             'Middleware Chain']            },
      { title: 'Authentication',            quizzes: ['JWT & Sessions',             'OAuth 2.0 Patterns']          },
      { title: 'Error Handling & Testing',  quizzes: ['Global Error Handlers',      'Supertest & Jest']            },
      { title: 'WebSockets',               quizzes: ['Socket.IO Basics',           'Real-time Patterns']          },
      { title: 'Deployment',               quizzes: ['Docker Basics',              'CI/CD with GitHub Actions']   },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  QUESTION BANK  (5 MCQs per module)
// ─────────────────────────────────────────────────────────────────────────────
const QUESTION_BANK = {
  'TypeScript Fundamentals': [
    { text: 'Which symbol makes a TypeScript interface property optional?',
      options: [{ text: '?', isCorrect: true }, { text: '!', isCorrect: false }, { text: '*', isCorrect: false }, { text: '~', isCorrect: false }] },
    { text: 'What does the `readonly` modifier prevent?',
      options: [{ text: 'Reassignment after initialisation', isCorrect: true }, { text: 'Making a field optional', isCorrect: false }, { text: 'Removing the type', isCorrect: false }, { text: 'Adding nullability', isCorrect: false }] },
    { text: 'Which utility type makes all properties of T optional?',
      options: [{ text: 'Partial<T>', isCorrect: true }, { text: 'Required<T>', isCorrect: false }, { text: 'Readonly<T>', isCorrect: false }, { text: 'Pick<T,K>', isCorrect: false }] },
    { text: 'What does the `never` type represent?',
      options: [{ text: 'A value that never occurs / unreachable code', isCorrect: true }, { text: 'Any value', isCorrect: false }, { text: 'A null type', isCorrect: false }, { text: 'An object type', isCorrect: false }] },
    { text: 'What is a TypeScript generic?',
      options: [{ text: 'A reusable type placeholder', isCorrect: true }, { text: 'An optional field marker', isCorrect: false }, { text: 'A union type shortcut', isCorrect: false }, { text: 'A type alias keyword', isCorrect: false }] },
  ],
  'React Ecosystem': [
    { text: 'Which hook replaces componentDidMount in functional components?',
      options: [{ text: 'useEffect', isCorrect: true }, { text: 'useState', isCorrect: false }, { text: 'useRef', isCorrect: false }, { text: 'useMemo', isCorrect: false }] },
    { text: 'What is the primary purpose of React.memo?',
      options: [{ text: 'Prevent unnecessary re-renders', isCorrect: true }, { text: 'Create local state', isCorrect: false }, { text: 'Fetch remote data', isCorrect: false }, { text: 'Handle DOM events', isCorrect: false }] },
    { text: 'Which hook is best for complex state transitions?',
      options: [{ text: 'useReducer', isCorrect: true }, { text: 'useState', isCorrect: false }, { text: 'useContext', isCorrect: false }, { text: 'useCallback', isCorrect: false }] },
    { text: 'What does useCallback return?',
      options: [{ text: 'A memoized function reference', isCorrect: true }, { text: 'A memoized computed value', isCorrect: false }, { text: 'A context value', isCorrect: false }, { text: 'A DOM ref object', isCorrect: false }] },
    { text: "What is React's tree-diffing process called?",
      options: [{ text: 'Reconciliation', isCorrect: true }, { text: 'Morphing', isCorrect: false }, { text: 'Patching', isCorrect: false }, { text: 'Hydration', isCorrect: false }] },
  ],
  'MongoDB & NoSQL': [
    { text: 'Which operator checks if a field exists in a document?',
      options: [{ text: '$exists', isCorrect: true }, { text: '$has', isCorrect: false }, { text: '$defined', isCorrect: false }, { text: '$is', isCorrect: false }] },
    { text: 'What does the $lookup aggregation stage do?',
      options: [{ text: 'Left-outer join between collections', isCorrect: true }, { text: 'Filter documents by condition', isCorrect: false }, { text: 'Group documents by a field', isCorrect: false }, { text: 'Project specific fields', isCorrect: false }] },
    { text: 'What is a MongoDB index?',
      options: [{ text: 'A data structure that speeds up queries', isCorrect: true }, { text: 'A backup of a collection', isCorrect: false }, { text: 'A schema definition file', isCorrect: false }, { text: 'A connection-pool setting', isCorrect: false }] },
    { text: 'Which aggregation stage limits the number of returned documents?',
      options: [{ text: '$limit', isCorrect: true }, { text: '$skip', isCorrect: false }, { text: '$match', isCorrect: false }, { text: '$count', isCorrect: false }] },
    { text: 'Which Mongoose method bypasses schema validation?',
      options: [{ text: 'Model.updateOne() with $set directly', isCorrect: true }, { text: 'Model.save()', isCorrect: false }, { text: 'Model.create()', isCorrect: false }, { text: 'Model.insertOne()', isCorrect: false }] },
  ],
  'Express & Node.js': [
    { text: 'What three arguments does Express middleware receive?',
      options: [{ text: 'req, res, next', isCorrect: true }, { text: 'req, res', isCorrect: false }, { text: 'ctx, next', isCorrect: false }, { text: 'request, response, done', isCorrect: false }] },
    { text: 'Which HTTP status code means "Resource Not Found"?',
      options: [{ text: '404', isCorrect: true }, { text: '500', isCorrect: false }, { text: '401', isCorrect: false }, { text: '403', isCorrect: false }] },
    { text: 'What does JWT stand for?',
      options: [{ text: 'JSON Web Token', isCorrect: true }, { text: 'JavaScript Web Toolkit', isCorrect: false }, { text: 'JSON Widget Type', isCorrect: false }, { text: 'Java Web Thread', isCorrect: false }] },
    { text: 'Which Express method handles ALL HTTP verbs on a route?',
      options: [{ text: 'app.all()', isCorrect: true }, { text: 'app.use()', isCorrect: false }, { text: 'app.any()', isCorrect: false }, { text: 'app.route()', isCorrect: false }] },
    { text: 'Which event signals a Node.js readable stream has finished?',
      options: [{ text: 'end', isCorrect: true }, { text: 'finish', isCorrect: false }, { text: 'close', isCorrect: false }, { text: 'done', isCorrect: false }] },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
//  HELPER — derive per-student metrics from HP + csProgress
// ─────────────────────────────────────────────────────────────────────────────
function studentMetrics(s) {
  const hp = s.currentHP;
  const cs = s.csProgress;

  // HP 93–197  →  totalPoints 300–2800
  const totalPoints = Math.round(((hp - 93) / (197 - 93)) * 2500 + 300);

  // streak correlated with HP
  const streak =
    hp >= 185 ? rand(14, 25) :
    hp >= 170 ? rand(9,  18) :
    hp >= 145 ? rand(5,  12) :
    hp >= 110 ? rand(2,   7) : rand(0, 3);

  // accuracy correlated with CS progress
  const baseAccuracy =
    cs === 100 ? randFloat(78, 99) :
    cs >= 75   ? randFloat(62, 85) :
    cs >= 40   ? randFloat(45, 68) :
    cs >  0    ? randFloat(28, 52) : randFloat(10, 32);

  // response time inversely correlated with rank
  const avgResponseTime =
    s.rank <= 15  ? randFloat(3.5,  8) :
    s.rank <= 50  ? randFloat(7,   15) :
    s.rank <= 110 ? randFloat(12,  22) : randFloat(18, 35);

  return { totalPoints, streak, baseAccuracy, avgResponseTime };
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN SEEDER
// ─────────────────────────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅  Connected to MongoDB');

  await Promise.all(
    [User, Module, Section, Quiz, Question, Session, Attempt, Badge, Achievement]
      .map(M => M.deleteMany({}))
  );
  console.log('🧹  Cleaned existing data');

  // ── Badges ─────────────────────────────────────────────────────────────────
  const badges = await Badge.insertMany([
    { name: 'First Blood',         description: 'Complete your first quiz',           icon: '🎯', color: '#ef4444', category: 'completion', condition: { type: 'completion',   value: 1   }, rarity: 'common'    },
    { name: 'Speed Demon',         description: 'Avg response time under 5 seconds',  icon: '⚡', color: '#f59e0b', category: 'speed',      condition: { type: 'speed_lte',    value: 5   }, rarity: 'rare'      },
    { name: 'Perfect Score',       description: 'Achieve 100% accuracy on a quiz',    icon: '💎', color: '#8b5cf6', category: 'accuracy',   condition: { type: 'accuracy_gte', value: 100 }, rarity: 'epic'      },
    { name: 'Streak Master',       description: 'Maintain a 7-day learning streak',   icon: '🔥', color: '#f97316', category: 'streak',     condition: { type: 'streak_gte',   value: 7   }, rarity: 'rare'      },
    { name: 'Top Scorer',          description: 'Rank #1 in a live session',          icon: '👑', color: '#eab308', category: 'score',      condition: { type: 'rank_eq',      value: 1   }, rarity: 'legendary' },
    { name: 'Case Study Champion', description: 'Complete 100% of all case studies',  icon: '📚', color: '#10b981', category: 'completion', condition: { type: 'cs_complete',  value: 100 }, rarity: 'epic'      },
    { name: 'Vibe Warrior',        description: 'Maintain HP above 180 throughout',   icon: '🛡️', color: '#6366f1', category: 'score',      condition: { type: 'hp_gte',       value: 180 }, rarity: 'legendary' },
    { name: 'Consistent Learner',  description: 'Attempt quizzes across 3+ modules',  icon: '🌟', color: '#06b6d4', category: 'completion', condition: { type: 'modules_gte',  value: 3   }, rarity: 'rare'      },
  ]);
  console.log(`🏅  Created ${badges.length} badges`);

  // ── Teacher ────────────────────────────────────────────────────────────────
  const teacher = await User.create({
    name: 'Dr. Priya Iyer',
    email: 'instructor@vibebootcamp.dev',
     password: 'Welcome',  
     role: 'teacher',
    totalPoints: 0,
  });
  console.log(`👩‍🏫  Created teacher: ${teacher.name}`);

  // ── Students ───────────────────────────────────────────────────────────────
  const studentDocs = await User.insertMany(
    ALL_STUDENTS.map(s => {
      const { totalPoints, streak } = studentMetrics(s);
      return { name: s.name, email: s.email, role: 'student', totalPoints, streak, password: 'Welcome' };
    })
  );

  // Build email → { doc, raw } lookup
  const studentMap = {};
  ALL_STUDENTS.forEach((raw, i) => { studentMap[raw.email] = { doc: studentDocs[i], raw }; });
  console.log(`🎓  Created ${studentDocs.length} students`);

  // ── Modules → Sections → Quizzes → Questions ──────────────────────────────
  const allModuleDocs   = [];
  const allSectionDocs  = [];
  const allQuizDocs     = [];
  const allQuestionDocs = [];

  for (const modDef of COURSE_MODULES) {
    const modDoc = await Module.create({
      title: modDef.title,
      description: modDef.description,
      teacher: teacher._id,
      coverColor: modDef.coverColor,
    });

    const sectionIds = [];
    const qBank = QUESTION_BANK[modDef.title] || QUESTION_BANK['TypeScript Fundamentals'];

    for (let si = 0; si < modDef.sections.length; si++) {
      const secDef = modDef.sections[si];
      const secDoc = await Section.create({ title: secDef.title, module: modDoc._id, order: si + 1 });

      const quizIds = [];
      for (let qi = 0; qi < secDef.quizzes.length; qi++) {
        const isAdvanced = qi === 1;
        const quizDoc = await Quiz.create({
          title: secDef.quizzes[qi],
          section: secDoc._id,
          module: modDoc._id,
          maxPoints: isAdvanced ? 150 : 100,
          timeLimit: isAdvanced ? 30 : 20,
        });

        // 5 questions per quiz
        const questionIds = [];
        for (let i = 0; i < 5; i++) {
          const q = qBank[i % qBank.length];
          const qDoc = await Question.create({
            text: q.text,
            quiz: quizDoc._id,
            type: 'mcq',
            options: q.options,
            points: 10 + rand(0, 10),
            difficulty: ['easy', 'medium', 'hard'][i % 3],
            totalAttempts: rand(20, studentDocs.length),
            correctCount:  rand(10, Math.floor(studentDocs.length * 0.85)),
          });
          questionIds.push(qDoc._id);
          allQuestionDocs.push(qDoc);
        }

        quizDoc.questions = questionIds;
        await quizDoc.save();
        quizIds.push(quizDoc._id);
        allQuizDocs.push(quizDoc);
      }

      secDoc.quizzes = quizIds;
      await secDoc.save();
      sectionIds.push(secDoc._id);
      allSectionDocs.push(secDoc);
    }

    modDoc.sections = sectionIds;
    await modDoc.save();
    allModuleDocs.push(modDoc);
  }
  console.log(`📦  ${allModuleDocs.length} modules · ${allSectionDocs.length} sections · ${allQuizDocs.length} quizzes · ${allQuestionDocs.length} questions`);

  // ── Live session (first quiz) ──────────────────────────────────────────────
  const liveQuiz = allQuizDocs[0];

  const liveSession = await Session.create({
    quiz: liveQuiz._id,
    teacher: teacher._id,
    status: 'live',
    startTime: new Date(Date.now() - 35 * 60 * 1000),
    participants: studentDocs.map(s => s._id),
    totalQuestions: 5,
    totalPoints: 100,
  });
  console.log(`📡  Created live session: ${liveSession._id}`);

  // ── Attempts ───────────────────────────────────────────────────────────────
  // Each student attempts quizzes proportional to their csProgress
  let attemptCount = 0;

  for (const rawStudent of ALL_STUDENTS) {
    const { doc: studentDoc } = studentMap[rawStudent.email];
    const metrics = studentMetrics(rawStudent);
    const cs = rawStudent.csProgress;

    // Scale quizzes attempted by CS progress (0 CS → only 1 quiz, 100 CS → all quizzes)
    const maxQuizzes = cs === 0
      ? 1
      : Math.max(1, Math.round((cs / 100) * allQuizDocs.length));
    const quizzesToAttempt = allQuizDocs.slice(0, maxQuizzes);

    for (const quiz of quizzesToAttempt) {
      const quizModDoc = allModuleDocs.find(m => m._id.equals(quiz.module));
      const quizSecDoc = allSectionDocs.find(s => s._id.equals(quiz.section));

      // Slight per-quiz accuracy variation
      const accuracy = Math.min(100, Math.max(5, metrics.baseAccuracy + randFloat(-8, 8)));
      const correctCount = Math.round((accuracy / 100) * 5);

      const answers = (quiz.questions || []).map((qId, idx) => ({
        question: qId,
        isCorrect: idx < correctCount,
        responseTime: Math.max(1, metrics.avgResponseTime + randFloat(-3, 6)),
        pointsEarned: idx < correctCount ? rand(8, 15) : 0,
      }));

      const totalPoints = answers.reduce((sum, a) => sum + a.pointsEarned, 0);
      const isLive = quiz._id.equals(liveQuiz._id);

      await Attempt.create({
        student: studentDoc._id,
        quiz: quiz._id,
        session: isLive ? liveSession._id : undefined,
        module: quizModDoc?._id,
        section: quizSecDoc?._id,
        answers,
        totalPoints,
        accuracy,
        avgResponseTime: Math.max(1, metrics.avgResponseTime + randFloat(-2, 4)),
        completedAt: new Date(Date.now() - rand(0, 30) * 24 * 60 * 60 * 1000),
        isFirstAttempt: true,
      });
      attemptCount++;
    }
  }
  console.log(`📝  Created ${attemptCount} attempts`);

  // ── Achievements ───────────────────────────────────────────────────────────
  const badgeMap = Object.fromEntries(badges.map(b => [b.name, b]));
  let achievementCount = 0;

  for (const rawStudent of ALL_STUDENTS) {
    const { doc: studentDoc } = studentMap[rawStudent.email];
    const metrics = studentMetrics(rawStudent);
    const toAward = [];

    // Every student who did at least one quiz gets First Blood
    toAward.push(badgeMap['First Blood']);

    if (rawStudent.currentHP >= 180)        toAward.push(badgeMap['Vibe Warrior']);
    if (rawStudent.csProgress === 100)      toAward.push(badgeMap['Case Study Champion']);
    if (metrics.streak >= 7)               toAward.push(badgeMap['Streak Master']);
    if (metrics.avgResponseTime < 8)       toAward.push(badgeMap['Speed Demon']);
    if (metrics.baseAccuracy >= 95)        toAward.push(badgeMap['Perfect Score']);
    if (rawStudent.rank <= 10)             toAward.push(badgeMap['Top Scorer']);
    if (rawStudent.csProgress > 60)        toAward.push(badgeMap['Consistent Learner']);

    const unique = [...new Map(toAward.filter(Boolean).map(b => [b._id.toString(), b])).values()];

    for (const badge of unique) {
      await Achievement.create({ student: studentDoc._id, badge: badge._id, context: { session: liveSession._id } });
      achievementCount++;
    }

    await User.updateOne(
      { _id: studentDoc._id },
      { $addToSet: { badges: { $each: unique.map(b => b._id) } } }
    );
  }
  console.log(`🏆  Created ${achievementCount} achievements`);

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('✅   SEED COMPLETE');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Students      : ${studentDocs.length}  (10 Spandan & peers + ${studentDocs.length - 10} real cohort)`);
  console.log(`  Modules       : ${allModuleDocs.length}  (TS · React · MongoDB · Express)`);
  console.log(`  Sections      : ${allSectionDocs.length}`);
  console.log(`  Quizzes       : ${allQuizDocs.length}`);
  console.log(`  Questions     : ${allQuestionDocs.length}`);
  console.log(`  Attempts      : ${attemptCount}`);
  console.log(`  Achievements  : ${achievementCount}`);
  console.log('───────────────────────────────────────────────────────');
  console.log(`  Teacher ID    : ${teacher._id}`);
  console.log(`  Live Session  : ${liveSession._id}`);
  console.log(`  Module IDs    :`);
  allModuleDocs.forEach(m => console.log(`    • ${m.title}: ${m._id}`));
  console.log('═══════════════════════════════════════════════════════\n');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌  Seed failed:', err);
  process.exit(1);
});