// ────────────────────────────────────────────────────────────────────────────
// Mock seed data — adapted from the ShinyQ portfolio site.
// Used to pre-populate the in-memory store on first load.
// ────────────────────────────────────────────────────────────────────────────

import type { AboutInfo, BlogPost, Project, TechItem, TimelineItem } from "./portfolio.types";

export const SEED_PROJECTS: Project[] = [
  {
    id: "shinqy-portfolio",
    title: "ShinyQ Playground",
    description:
      "ShinyQ Playground is my personal site for showcasing projects, writing blogs, and testing ideas. It features a custom portfolio, a markdown-powered blog, and a simple dashboard to manage content.",
    coverImage: "projects/shinyqweb/cover.png",
    tags: ["Personal Website", "Blog", "Portfolio"],
    role: "Full Stack Developer",
    techStack: ["Astro", "React", "TailwindCSS", "TypeScript", "Shadcn UI", "Cloudflare R2", "Cloudflare Pages"],
    githubUrl: "https://github.com/ShinyQ/shinyq-playground",
    galleries: [],
  },
  {
    id: "shumishop",
    title: "Shumi Shop",
    description:
      "An e-commerce platform for anime figures and collectibles, featuring pre-order, late pre-order, ready stock, and voucher support.",
    coverImage: "projects/shumi/cover.png",
    tags: ["Backend Development", "E-commerce"],
    role: "Backend Engineer",
    techStack: ["Laravel", "PHP", "MySQL", "Google OAuth", "RajaOngkir API", "Payment Gateway", "AWS S3"],
    liveUrl: "https://shumi.shop/",
    galleries: [
      { id: "g1", project_id: "shumishop", image_key: "projects/shumi/1.png", order: 0 },
      { id: "g2", project_id: "shumishop", image_key: "projects/shumi/2.png", order: 1 },
      { id: "g3", project_id: "shumishop", image_key: "projects/shumi/3.png", order: 2 },
    ],
  },
  {
    id: "eha",
    title: "Electronic Hacking Automation",
    description:
      "Ethical Hacking Analytics Tools is a Node.js app built to support ethical hacking activities like vulnerability scanning and system monitoring.",
    coverImage: "projects/eha/cover.png",
    tags: ["Backend Development", "Ethical Hacking"],
    role: "Backend Engineer",
    techStack: ["Node.js", "Express.js", "MySQL", "Redis", "Nessus", "Sequelize"],
    galleries: [
      { id: "g4", project_id: "eha", image_key: "projects/eha/1.png", order: 0 },
      { id: "g5", project_id: "eha", image_key: "projects/eha/2.png", order: 1 },
    ],
  },
  {
    id: "sentiboard",
    title: "Sentiboard",
    description:
      "A sentiment analysis dashboard for universities to monitor Twitter data, featuring automated crawling and prediction using IndoBERT.",
    coverImage: "projects/sentiboard/cover.png",
    tags: ["Web Development", "Dashboard", "NLP", "Sentiment Analysis"],
    role: "Full Stack Developer",
    techStack: ["Python", "Django", "PostgreSQL", "Docker", "IndoBERT", "Twitter API"],
    githubUrl: "https://github.com/ShinyQ/Django_Thesis-Sentiboard-University-Sentiment-App",
    galleries: [
      { id: "g6", project_id: "sentiboard", image_key: "projects/sentiboard/1.png", order: 0 },
    ],
  },
  {
    id: "stock-portfolio-optimizer",
    title: "S&P500 Portfolio Optimizer",
    description:
      "A web app for maximizing monthly stock returns under custom constraints with interactive optimization and risk-based profiling.",
    coverImage: "projects/stockoptimization/cover.png",
    tags: ["Portfolio Optimization", "SLSQP", "Finance"],
    role: "Full Stack Developer",
    techStack: ["Python", "Pandas", "Numpy", "SciPy (SLSQP)", "Streamlit"],
    githubUrl: "https://github.com/ShinyQ/Streamlit_Stock-Allocation-Optimization-SLSQP",
    liveUrl: "https://stock-optimization-slsqp-group2.streamlit.app",
    galleries: [
      { id: "g7", project_id: "stock-portfolio-optimizer", image_key: "projects/stockoptimization/1.png", order: 0 },
    ],
  },
];

export const SEED_TIMELINE: TimelineItem[] = [
  {
    slug: "jenius-software-engineer",
    startDate: "2024-06",
    endDate: "Present",
    title: "PT SMBC Indonesia Tbk (Jenius)",
    caption: "The largest digital bank in Indonesia",
    subtitle: "Software Engineer",
    description: [
      "Developed microservices with Express.js and Spring Boot, integrating 5+ insurance partners",
      "Reduced manual processes by 90% by automating policy workflows",
      "Built custom MFT SFTP service with 99.9% uptime",
    ],
    tools: ["Express.js", "Spring Boot", "Kafka", "Redis", "React.js", "Docker", "PostgreSQL", "AWS"],
    logo: "/company/jenius.png",
    type: "Full-Time",
  },
  {
    slug: "jatis-fullstack-developer",
    startDate: "2023-03",
    endDate: "2024-06",
    title: "PT Informasi Teknologi Indonesia (Jatis)",
    caption: "Provider of messaging and AI-driven solutions in Indonesia",
    subtitle: "Full Stack Developer",
    description: [
      "Built multi-tenant SaaS platforms for legal, asset, and task management",
      "Led architecture for Asset Management system including PRD, TRD, and ERD documentation",
    ],
    tools: ["Laravel", "MySQL", "Golang", "Next.js", "TailwindCSS", "SonarQube"],
    logo: "/company/jatis.png",
    type: "Full-Time",
  },
  {
    slug: "mnc-backend-engineer",
    startDate: "2022-02",
    endDate: "2023-02",
    title: "PT MNC Asia Holding Tbk",
    caption: "Indonesia's Leading Investment group",
    subtitle: "Backend Engineer",
    description: [
      "Built real-time services with AWS WebSocket and Redis",
      "Refactored payment gateway using GraphQL and Lambda",
    ],
    logo: "/company/mnc.png",
    tools: ["AWS Lambda", "GraphQL", "Gin", "Laravel", "MySQL", "Redis"],
    type: "Full-Time",
  },
  {
    slug: "its-mmt",
    startDate: "2024-01",
    endDate: "Present",
    title: "Sepuluh Nopember Institute of Technology",
    subtitle: "Master of Management Technology (MMT)",
    description: ["Current GPA: 3.60 / 4.00", "Thesis: Application Quality Improvement Recommendation System for Jenius"],
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
    description: ["Final GPA: 3.88 / 4.00", "Thesis: Sentiboard – Sentiment Analysis Dashboard using IndoBERT"],
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
    slug: "toefl-itp",
    startDate: "2024-01-03",
    endDate: "2026-01-03",
    title: "TOEFL ITP",
    subtitle: "English Test",
    caption: "IES Foundation",
    description: ["Score: 547"],
    type: "Certification",
  },
];

export const SEED_TECH_STACK: TechItem[] = [
  { name: "Spring Boot", icon: "/icons/spring-boot.webp", type: "backend", site: "https://spring.io/projects/spring-boot" },
  { name: "ExpressJS", icon: "/icons/expressjs.webp", type: "backend", site: "https://expressjs.com/" },
  { name: "Laravel", icon: "/icons/laravel.webp", type: "backend", site: "https://laravel.com/" },
  { name: "FastAPI", icon: "/icons/fastapi.webp", type: "backend", site: "https://fastapi.tiangolo.com/" },
  { name: "Django", icon: "/icons/django.webp", type: "backend", site: "https://www.djangoproject.com/" },
  { name: "Gin", icon: "/icons/gin.webp", type: "backend", site: "https://gin-gonic.com/" },
  { name: "React", icon: "/icons/react.webp", type: "frontend", site: "https://react.dev/" },
  { name: "Next.js", icon: "/icons/nextjs.webp", type: "frontend", site: "https://nextjs.org/" },
  { name: "Tailwind", icon: "/icons/tailwind.webp", type: "frontend", site: "https://tailwindcss.com/" },
  { name: "Astro", icon: "/icons/astro.webp", type: "frontend", site: "https://astro.build/" },
  { name: "Docker", icon: "/icons/docker.webp", type: "other", site: "https://www.docker.com/" },
  { name: "PostgreSQL", icon: "/icons/postgresql.webp", type: "other", site: "https://www.postgresql.org/" },
  { name: "Redis", icon: "/icons/redis.webp", type: "other", site: "https://redis.io/" },
  { name: "Kafka", icon: "/icons/kafka.webp", type: "other", site: "https://kafka.apache.org/" },
  { name: "AWS", icon: "/icons/aws.webp", type: "other", site: "https://aws.amazon.com/" },
];

export const SEED_ABOUT: AboutInfo = {
  intro:
    "I am a Software Engineer with over three years of experience designing and developing robust backend and full-stack systems across fintech, e-commerce, SaaS, and AI domains.",
  philosophy: [
    "Simple is good — as long as it's still powerful and flexible.",
    "I build systems that can fail and recover, not ones that pretend to be perfect.",
    "Tech debt is a choice, not an excuse. Fix it later, and refactor when needed.",
    "Code should be easy to read. Clean structure and clear docs always matter.",
  ],
  workingStyle: [
    "I like working with full focus, especially for hard problems.",
    "I use chat for quick stuff, calls and meetings when we need discuss bigger things",
    "I enjoy code reviews that help us learn, not just catch mistakes.",
    "I'm always learning new tools and ideas to stay sharp.",
  ],
  favoriteTech: [
    "Backend: Go and Spring Boot — fast, reliable, strong for scaling",
    "Databases: PostgreSQL for structured data, MongoDB for flexible stuff",
    "Infra: Docker and Kubernetes to make environments the same everywhere",
    "DevOps: GitHub Actions — automate tests, builds, and deployments",
    "Monitoring: Prometheus and Grafana — I want to see what's really going on",
  ],
  quote: "Every shortcut in development code is a future bug with your name on it.",
  profilePhoto: "photo/profile.png",
};

export const SEED_BLOGS: BlogPost[] = [
  {
    slug: "the-sun-the-moon-and-the-dark-sea",
    title: "The Sun, The Moon, and The Dark Sea",
    date: "2025-06-06",
    coverImage: "blog/sun-moon-darksea.png",
    excerpt: "Hitam, putih, abu-abu. Rasanya bukan soal keberanian, tapi kehilangan arah di labirin rasa yang tak bernama.",
    tags: ["Personal Growth"],
    readingTime: "8 min",
    author: "Kurniadi Ahmad Wijaya",
    category: "Personal Growth",
    featured: true,
    content: "Hitam, putih, abu-abu.\\n\\nRasanya bukan soal keberanian, tapi kehilangan arah di labirin rasa yang tak bernama. Terjebak dalam pola yang membungkam ekspresi, jarak antara diri dan orang lain makin melebar.\\n\\nDi tengah keramaian, ada ruang kosong yang hampa. Di balik tawa dan pencapaian, diri hanya jadi pengamat.",
  },
  {
    slug: "react-19-features",
    title: "Exploring React 19 Features",
    date: "2024-04-12",
    coverImage: "blog/react-19.png",
    excerpt: "A deep dive into the new hooks like useActionState and the React compiler.",
    tags: ["React", "Frontend", "Web Dev"],
    readingTime: "5 min",
    author: "Kurniadi Ahmad Wijaya",
    category: "Software Engineering",
    featured: false,
    content: "# React 19 is Here!\\n\\nReact 19 brings a lot of excitement with the new compiler and action-based forms. Let's explore what this means for your next project.\\n\\n## Actions\\nForms are now fully supported with action states...",
  }
];

