
import { Difficulty, Question, Exam, Subject } from './types';

export const INITIAL_SUBJECTS: Subject[] = [
  // --- UP POLICE COMPUTER OPERATOR: COMPUTER SCIENCE ---
  {
    id: 's_cs_up',
    name: 'Computer Science (कंप्यूटर विज्ञान)',
    progress: 0,
    topics: [
      { name: 'Introduction: History, Generations, Hardware, Software, Algorithm & Flowcharts', completed: false },
      { name: 'Database Management System: Relational Model, SQL (Oracle/FoxPro), File Management', completed: false },
      { name: 'PC Software and Office Automation: GUI, EDI, Electronic Storage & Systems', completed: false },
      { name: 'Workplace productivity Tools: MS Office (Word, Excel, PPT, Access), Open Office, Unicode Fonts', completed: false },
      { name: 'Computer Networks: Topology, Security Measures, LAN, MAN, WAN', completed: false },
      { name: 'The Internet: Search Engines, E-commerce, E-banking, E-learning', completed: false },
      { name: 'Emerging Technologies: AI, Mobile Computing, Green Computing, OS (Win/Unix), HTML/JS', completed: false },
      { name: 'Boolean algebra: Truth Tables, Laws, SOP/POS, Karnaugh Maps (K-Map)', completed: false },
      { name: 'Data Structures: 1D & 2D Arrays, Stacks, Queues', completed: false }
    ]
  },
  {
    id: 's_mental_up',
    name: 'Mental Ability (Computer Operator)',
    progress: 0,
    topics: [
      { name: 'Logical Diagrams', completed: false },
      { name: 'Symbol-Relationship Interpretation', completed: false },
      { name: 'Perception Test', completed: false },
      { name: 'Word formation Test', completed: false },
      { name: 'Letter and number series', completed: false },
      { name: 'Word and alphabet Analogy', completed: false },
      { name: 'Common Sense Test', completed: false },
      { name: 'Direction sense Test', completed: false },
      { name: 'Logical interpretation of data', completed: false },
      { name: 'Forcefulness of argument', completed: false },
      { name: 'Determining implied meanings', completed: false }
    ]
  },
  {
    id: 's_reason_up',
    name: 'Reasoning (Computer Operator)',
    progress: 0,
    topics: [
      { name: 'Analogy & Similarities', completed: false },
      { name: 'Space visualization & Problem solving', completed: false },
      { name: 'Decision-making & Visual memory', completed: false },
      { name: 'Discrimination & Observation', completed: false },
      { name: 'Relationship Concepts', completed: false },
      { name: 'Arithmetical reasoning', completed: false },
      { name: 'Verbal and figure classification', completed: false },
      { name: 'Arithmetical number series', completed: false },
      { name: 'Abstract ideas and symbols', completed: false }
    ]
  },
  {
    id: 's_gk_up',
    name: 'General Knowledge (Computer Operator)',
    progress: 0,
    topics: [
      { name: 'General Science & History', completed: false },
      { name: 'Indian Constitution & Economy', completed: false },
      { name: 'Indian Agriculture, Commerce and Trade', completed: false },
      { name: 'Population, Environment and Urbanization', completed: false },
      { name: 'Geography of India & World', completed: false },
      { name: 'UP Culture & Social Practices', completed: false },
      { name: 'Human rights & Internal security', completed: false },
      { name: 'Cyber Crime & Social Media', completed: false },
      { name: 'GST, Demonetization & Its Impact', completed: false },
      { name: 'Awards, Honors & Important Days', completed: false }
    ]
  },

  // --- HOMEGUARD: CONSOLIDATED SINGLE SUBJECT ---
  {
    id: 's_gk_hg',
    name: 'General Knowledge (सामान्य ज्ञान)',
    progress: 0,
    topics: [
      { name: 'सामान्य ज्ञान एवं सामान्य विज्ञान', completed: false },
      { name: 'भारत का इतिहास, भारतीय संविधान', completed: false },
      { name: 'भारतीय अर्थव्यवस्था एवं संस्कृति', completed: false },
      { name: 'भारतीय कृषि, वाणिज्य एवं व्यापार', completed: false },
      { name: 'जनसंख्या, पर्यावरण एवं शहरीकरण', completed: false },
      { name: 'भारत का भूगोल', completed: false },
      { name: 'उत्तर प्रदेश के प्राकृतिक संसाधन', completed: false },
      { name: 'उत्तर प्रदेश की शिक्षा, संस्कृति एवं सामाजिक परंपराएँ', completed: false },
      { name: 'उत्तर प्रदेश के प्रमुख मेले एवं स्थानीय त्यौहार', completed: false },
      { name: 'खेल पुरस्कार एवं उपलब्धियाँ', completed: false },
      { name: 'UP राज्य स्थापना, पुलिस व्यवस्था एवं प्रशासन', completed: false },
      { name: 'मानवाधिकार, आंतरिक सुरक्षा एवं आतंकवाद', completed: false },
      { name: 'भारत और उसके पड़ोसी देशों के संबंध', completed: false },
      { name: 'राष्ट्रीय एवं अंतर्राष्ट्रीय समसामयिक घटनाएँ', completed: false },
      { name: 'राष्ट्रीय एवं अंतर्राष्ट्रीय संगठन', completed: false },
      { name: 'पुरस्कार एवं सम्मान', completed: false },
      { name: 'देश, राजधानियाँ एवं मुद्राएँ', completed: false },
      { name: 'महत्वपूर्ण दिवस, अनुसंधान एवं खोज', completed: false },
      { name: 'पुस्तकें एवं उनके लेखक', completed: false },
      { name: 'सोशल मीडिया संचार', completed: false },
      { name: 'UP सरकार की जनकल्याणकारी योजनाएँ', completed: false },
      { name: 'महिला सशक्तिकरण एवं औद्योगिक पहल', completed: false },
      { name: 'प्राकृतिक घटनाएँ', completed: false },
      { name: 'महत्वपूर्ण सम्मेलन एवं समारोह', completed: false }
    ]
  },

  // --- RRB GROUP D ---
  {
    id: 's_math_rrb',
    name: 'RRB Group D Mathematics',
    progress: 15,
    topics: [
      { name: 'Simplification & BODMAS', completed: true },
      { name: 'Decimals, Surds & Indices', completed: false },
      { name: 'LCM & HCF', completed: true },
      { name: 'Ratio & Proportion', completed: false },
      { name: 'Percentage', completed: false },
      { name: 'Mensuration (2D & 3D)', completed: false },
      { name: 'Time and Work / Pipes & Cistern', completed: false },
      { name: 'Speed, Time and Distance / Trains', completed: false },
      { name: 'Simple & Compound Interest', completed: false },
      { name: 'Profit and Loss', completed: false },
      { name: 'Algebra & Polynomials', completed: false },
      { name: 'Geometry & Co-ordinate Geometry', completed: false },
      { name: 'Trigonometry', completed: false },
      { name: 'Elementary Statistics / DI', completed: false },
      { name: 'Square Root', completed: false },
      { name: 'Age Calculations', completed: false },
      { name: 'Calendar & Clock', completed: false },
      { name: 'Probability (Basic)', completed: false }
    ]
  },
  {
    id: 's_reason_rrb',
    name: 'RRB Group D Reasoning',
    progress: 10,
    topics: [
      { name: 'Analogy (Letter/Number/GK)', completed: true },
      { name: 'Alphabetical and Number Series', completed: false },
      { name: 'Coding and Decoding', completed: false },
      { name: 'Mathematical Operations', completed: false },
      { name: 'Relationships (Blood Relation)', completed: false },
      { name: 'Syllogism & Venn Diagram', completed: false },
      { name: 'Jumbling / Word Formation', completed: false },
      { name: 'Data Interpretation and Sufficiency', completed: false },
      { name: 'Conclusions and Decision Making', completed: false },
      { name: 'Similarities and Differences', completed: false },
      { name: 'Analytical Reasoning', completed: false },
      { name: 'Classification', completed: false },
      { name: 'Directions', completed: false },
      { name: 'Statements – Arguments and Assumptions', completed: false }
    ]
  },
  {
    id: 's_science_rrb',
    name: 'RRB Group D General Science',
    progress: 5,
    topics: [
      { name: 'Physics (Work, Power, Energy, Motion)', completed: false },
      { name: 'Physics (Light, Electricity, Sound)', completed: false },
      { name: 'Chemistry (Periodic Table, Metals/Non-Metals)', completed: false },
      { name: 'Chemistry (Acids, Bases, Salts, Carbon)', completed: false },
      { name: 'Biology (Human Anatomy, Diseases)', completed: false },
      { name: 'Biology (Plant Kingdom, Genetics)', completed: false },
      { name: 'Earth and Space Sciences', completed: false },
      { name: 'Environmental Sciences', completed: false }
    ]
  },
  {
    id: 's_ga_rrb',
    name: 'RRB Group D General Awareness',
    progress: 0,
    topics: [
      { name: 'Science & Technology', completed: false },
      { name: 'Sports (Current & Static)', completed: false },
      { name: 'Culture & Personalities', completed: false },
      { name: 'Economics & Business', completed: false },
      { name: 'Polity & Constitution', completed: false },
      { name: 'Indian History & Freedom Struggle', completed: false },
      { name: 'Geography (Indian & World)', completed: false },
      { name: 'Current Affairs (National & International)', completed: false }
    ]
  }
];

export const INITIAL_EXAMS: Exam[] = [
  { id: 'e_rrb', name: 'RRB Group D', subjects: ['s_math_rrb', 's_reason_rrb', 's_science_rrb', 's_ga_rrb'] },
  { id: 'e_up_op', name: 'UP Police Computer Operator', subjects: ['s_cs_up', 's_mental_up', 's_reason_up', 's_gk_up'] },
  { id: 'e_hg', name: 'Homeguard', subjects: ['s_gk_hg'] }
];

// INITIAL_QUESTIONS is now an empty array. Admin must upload real questions from books.
export const INITIAL_QUESTIONS: Question[] = [];
