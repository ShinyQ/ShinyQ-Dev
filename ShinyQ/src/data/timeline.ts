export interface TimelineItem {
  slug: string;
  startDate: string;
  endDate: string;
  title: string;
  subtitle: string;
  caption?: string;
  description?: string[];
  tools?: string[];
  logo?: string;
  type:
  | "Full-Time"
  | "Part-Time"
  | "Education"
  | "Certification"
  | "Competition";
}

export interface TimelineProps {
  items: TimelineItem[];
  filters: { label: string; value: string | null }[];
}

export const timelineItems: TimelineItem[] = [
  {
    slug: "jenius-software-engineer",
    startDate: "2024-06",
    endDate: "Present",
    title: "PT SMBC Indonesia Tbk (Jenius)",
    caption:
      "The largest digital bank in Indonesia that provides a range of financial services like payment, investment, and insurance",
    subtitle: "Software Engineer",
    description: [
      "Developed microservices with Express.js and Spring Boot, integrating 5+ insurance partners",
      "Reduced manual processes by 90% by automating policy workflows",
      "Improved system performance by 30% using Kafka and Redis",
      "Built custom MFT SFTP service with 99.9% uptime, saving $50K in annual license costs",
      "Maintained 100% unit test coverage, cutting production issues by 30%",
      "Built React.js components for insurance dashboards, automating manual tasks",
    ],
    tools: [
      "Express.js",
      "Spring Boot",
      "Kafka",
      "Redis",
      "React.js",
      "Docker",
      "Mocha",
      "Chai",
      "Sinon",
      "PostgreSQL",
      "AWS",
      "Jenkins",
    ],
    logo: "/company/jenius.png",
    type: "Full-Time",
  },
  {
    slug: "jatis-fullstack-developer",
    startDate: "2023-03",
    endDate: "2024-06",
    title: "PT Informasi Teknologi Indonesia (Jatis)",
    caption:
      "Provider of messaging and AI-driven solutions in Indonesia, trusted by 500+ top corporations",
    subtitle: "Full Stack Developer",
    description: [
      "Built multi-tenant SaaS platforms for legal, asset, and task management used by 500+ users",
      "Led architecture for Asset Management system including PRD, TRD, and ERD documentation",
      "Developed Golang APIs and integrated them with Next.js frontend to improve user efficiency by 30%",
      "Cut technical debt by 60% using SonarQube, improving code quality",
    ],
    tools: [
      "Laravel",
      "MySQL",
      "Golang",
      "Next.js",
      "TailwindCSS",
      "SonarQube",
    ],
    logo: "/company/jatis.png",
    type: "Full-Time",
  },
  {
    slug: "mnc-backend-engineer",
    startDate: "2022-02",
    endDate: "2023-02",
    title: "PT MNC Asia Holding Tbk",
    caption:
      "Indonesia's Leading Investment group, sector across Media, Finance, and Hospitality",
    subtitle: "Backend Engineer",
    description: [
      "Built real-time services with AWS WebSocket and Redis, reducing latency by 15%",
      "Refactored payment gateway using GraphQL and Lambda, cutting transaction time by 30%",
      "Optimized MySQL with Gin and Laravel, speeding queries by 20% and cutting errors by 40%",
      "Migrated homepage backend to GraphQL, boosting load speed by 25%",
    ],
    logo: "/company/mnc.png",
    tools: ["AWS Lambda", "GraphQL", "Gin", "Laravel", "MySQL", "Redis"],
    type: "Full-Time",
  },
  {
    slug: "jublia-backend-engineer",
    startDate: "2023-09",
    endDate: "2023-12",
    title: "Jublia Pte Ltd (Singapore)",
    caption:
      "Empowering Events with Smart Business Matching & Data-Driven Networking Solutions.",
    subtitle: "Backend Engineer",
    description: [
      "Enhanced search relevance by 40% using Elasticsearch and Collaborative Filtering",
      "Reduced server response time by 25% through PostgreSQL optimization",
      "Created AI sentiment analysis service using OpenAI and LangChain with 96% accuracy",
      "Automated daily sentiment reports with RabbitMQ, increasing feedback analysis speed by 50%",
      "Removed legacy Flask features, cutting system overhead by 20%",
    ],
    tools: [
      "Elasticsearch",
      "PostgreSQL",
      "LangChain",
      "OpenAI",
      "RabbitMQ",
      "Flask",
    ],
    logo: "/company/jublia.png",
    type: "Part-Time",
  },
  {
    slug: "shumi-backend-engineer",
    startDate: "2019-09",
    endDate: "2022-12",
    title: "Shumi",
    caption: "One of the biggest action figures in e-commerce in Indonesia",
    subtitle: "Backend Engineer",
    description: [
      "Built REST APIs using Laravel for e-commerce and admin dashboard with 2,000+ daily users",
      "Integrated Ipaymu and RajaOngkir for payment and logistics, reducing manual tasks by 30%",
      "Integrated and deployed on DigitalOcean and implemented Sentry for monitoring",
    ],
    tools: [
      "Laravel",
      "MySQL",
      "Ipaymu",
      "RajaOngkir",
      "DigitalOcean",
      "Sentry",
    ],
    logo: "/company/shumi.png",
    type: "Part-Time",
  },
  {
    slug: "bssn-backend-engineer",
    startDate: "2023-05",
    endDate: "2023-07",
    title: "BSSN (Indonesia National Cyber and Crypto Agency)",
    caption: "Indonesia's National Cyber and Crypto Agency",
    subtitle: "Backend Engineer",
    description: [
      "Built Electronic Hacking Automation (EHA) for vulnerability scanning and asset management",
      "Integrated Nessus scanner API with Node.js backend for automated scans",
      "Deployed on AWS EC2 and implemented job scheduler for 24/7 monitoring, improving coverage by 20%",
    ],
    tools: ["Node.js", "Express.js", "Sequelize", "MySQL", "Nessus", "AWS EC2"],
    logo: "/company/bssn.png",
    type: "Part-Time",
  },
  {
    slug: "its-mmt",
    startDate: "2024-01",
    endDate: "Present",
    title: "Sepuluh Nopember Institute of Technology",
    subtitle: "Master of Management Technology (MMT)",
    description: [
      "Current GPA: 3.60 / 4.00",
      "Thesis: Application Quality Improvement Recommendation System for Jenius",
      "Built RAG-LLM system to analyze Jenius app reviews using ISO/IEC 25010:2011 framework. Stored data in PostgreSQL/ChromaDB, classified feedback into quality dimensions, and generated improvement recommendations.",
    ],
    tools: ["Python", "LangChain", "Llama 3.2", "PostgreSQL", "ChromaDB"],
    logo: "/company/its.png",
    type: "Education",
  },
  {
    slug: "telkom-university-bsc",
    startDate: "2019-08",
    endDate: "2023-08",
    title: "Telkom University",
    subtitle: "Bachelor of Computer Science (BSc)",
    description: [
      "Final GPA: 3.88 / 4.00",
      "Thesis: Sentiboard – Sentiment Analysis Dashboard using IndoBERT",
      "Created Django dashboard analyzing university feedback via Twitter API. Implemented IndoBERT model for Bahasa Indonesia sentiment analysis. Used incremental development and iterative testing to improve accuracy",
    ],
    tools: ["Python", "Django", "IndoBERT", "Twitter API"],
    logo: "/company/telyu.png",
    type: "Education",
  },
  {
    slug: "closer-hackathon-2022",
    startDate: "2022-11",
    endDate: "2022-11",
    title: "Closer 8th Hackathon Competition",
    subtitle: "2nd Place",
    caption: "Organized by Universitas Telkom",
    type: "Competition",
  },
  {
    slug: "business-plan-competition-2022",
    startDate: "2022-08",
    endDate: "2022-08",
    title: "International Business Plan Competition",
    subtitle: "2nd Place",
    caption: "Organized by Politeknik Negeri Bali",
    type: "Competition",
  },
  {
    slug: "ifest-data-analysis-2021",
    startDate: "2021-10",
    endDate: "2021-10",
    title: "IFEST 2021: Data Analysis Competition",
    subtitle: "1st Place",
    caption: "Organized by Universitas Padjadjaran",
    type: "Competition",
  },
  {
    slug: "isfest-data-competition-2021",
    startDate: "2021-07",
    endDate: "2021-07",
    title: "ISFEST UMN 2021: Data Competition",
    subtitle: "1st Place",
    caption: "Organized by Universitas Multimedia Nusantara",
    type: "Competition",
  },
  {
    slug: "foresty-ctf-2021",
    startDate: "2021-03",
    endDate: "2021-03",
    title: "Foresty CTF Competition 2021",
    subtitle: "1st Place",
    caption: "Organized by Forensic and Security Laboratory",
    type: "Competition",
  },
  {
    slug: "business-pitching-2021",
    startDate: "2021-01",
    endDate: "2021-01",
    title: "Business Pitching Competition",
    subtitle: "1st Place",
    caption: "Organized by BEM KEMA Telkom University",
    type: "Competition",
  },
  {
    slug: "scientific-writing-2020",
    startDate: "2020-12",
    endDate: "2020-12",
    title: "Scientific Writing Codig 3.0",
    subtitle: "2nd Place",
    caption: "Organized by Universitas Mercu Buana",
    type: "Competition",
  },
  {
    slug: "it-business-competition-2020",
    startDate: "2020-07",
    endDate: "2020-07",
    title: "IT Business Competition 2020",
    subtitle: "Favorite Winner",
    caption: "Organized by Amikom Computer Club",
    type: "Competition",
  },
  {
    slug: "uiux-design-competition-2020",
    startDate: "2020-05",
    endDate: "2020-05",
    title: "UI/UX Design Competition",
    subtitle: "1st Place",
    caption: "Organized by Gunadarma University",
    type: "Competition",
  },
  {
    slug: "ctf-competition-2020",
    startDate: "2020-02",
    endDate: "2020-02",
    title: "Capture The Flag Competition",
    subtitle: "3rd Place",
    caption: "Organized by Forensic and Security Laboratory",
    type: "Competition",
  },
  {
    slug: "uiux-competition-2019",
    startDate: "2019-11",
    endDate: "2019-11",
    title: "UI/UX Competition",
    subtitle: "2nd Place",
    caption: "Organized by Universitas Nasional",
    type: "Competition",
  },
  {
    slug: "sigma-idea-competition-2019",
    startDate: "2019-09",
    endDate: "2019-09",
    title: "Sigma Idea Competition 2019",
    subtitle: "2nd Place",
    caption: "Organized by Universitas Telkom",
    type: "Competition",
  },
  {
    slug: "web-dev-competition-2019",
    startDate: "2019-09",
    endDate: "2019-09",
    title: "Web Development Competition Vision",
    subtitle: "2nd Place",
    caption: "Organized by Universitas Sebelas Maret",
    type: "Competition",
  },
  {
    slug: "toefl-itp",
    startDate: "2024-01-03",
    endDate: "2026-01-03",
    title: "TOEFL ITP",
    subtitle: "English Test",
    caption: "IES Foundation",
    description: [
      "Score: 547",
    ],
    type: "Certification",
  },
  {
    slug: "digitalent-ml-certification",
    startDate: "2021-05-31",
    endDate: "2021-07-16",
    title: "Digitalent Machine Learning Certification",
    subtitle: "AI & Data",
    caption: "IBM & Kominfo",
    type: "Certification",
    description: [
      "Completed 160 hours (7 weeks) of comprehensive online training in machine learning as part of the Digital Talent Scholarship by Kominfo and IBM",
      "Covered foundational and intermediate topics including supervised/unsupervised learning, neural networks, and time series analysis",
      "Developed machine learning projects using Python, including NLP with TensorFlow, image classification with CNN, and time series forecasting",
      "Learned data preprocessing, feature engineering, model training, evaluation, and deployment practices",
      "Gained practical skills in data visualization using Matplotlib, Seaborn, and Google Sheets",
      "Received Certificates from Kominfo, IBM SkillsBuild, and Dicoding for successful course completion and project submissions"
    ],
    tools: ["Python", "scikit-learn", "TensorFlow", "Pytorch", "Keras", "Matplotlib", "Seaborn", "Google Colab"]
  },
  {
    slug: "microcredential-data-scientist",
    startDate: "2021-11-01",
    endDate: "2021-12-10",
    title: "Microcredential Certification: Associate Data Scientist",
    subtitle: "AI & Data",
    caption: "Indonesia AI Research Consortium (IARC) & APTIKOM",
    type: "Certification",
    description: [
      "Completed a national-scale microcredential certification program in Artificial Intelligence and Data Science organized by Indonesia AI Research Consortium (IARC) and APTIKOM",
      "Learned fundamentals of AI including data science, data engineering, data governance, and machine learning",
      "Studied mathematical foundations including probability, regression, PCA, clustering, Bayesian inference, linear algebra, and calculus",
      "Practiced data analysis, big data processing, supervised and unsupervised learning, reinforcement learning, NLP, and computer vision",
      "Engaged in hands-on projects and synchronous training sessions with industry and academic experts",
      "Participated in blended learning: self-paced modules, online discussions, and real-time video conferences"
    ],
    tools: ["Python", "Jupyter Notebook", "NumPy", "Pandas", "scikit-learn", "Matplotlib", "Seaborn", "Yolo v3"]
  },
];
