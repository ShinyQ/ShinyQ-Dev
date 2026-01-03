interface AboutInfo {
  intro: string;
  philosophy: string[];
  workingStyle: string[];
  favoriteTech: string[];
  quote?: string;
  profilePhoto?: string;
}

export const aboutInfo: AboutInfo = {
  intro: "I am a Software Engineer with over three years of experience designing and developing robust backend and full-stack systems across fintech, e-commerce, SaaS, and AI domains. My career began with a strong drive to solve real-world problems through code—a passion that has evolved into building scalable, high-performance systems that are resilient, maintainable, and purpose-driven. I take pride in delivering solutions that are not only technically sound but also built to adapt and endure in dynamic environments.",
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
    "I’m always learning new tools and ideas to stay sharp.",
  ],
  favoriteTech: [
    "Backend: Go and Spring Boot — fast, reliable, strong for scaling",
    "Databases: PostgreSQL for structured data, MongoDB for flexible stuff",
    "Infra: Docker and Kubernetes to make environments the same everywhere",
    "DevOps: GitHub Actions — automate tests, builds, and deployments",
    "Monitoring: Prometheus and Grafana — I want to see what’s really going on",
  ],
  quote: "Every shortcut in development code is a future bug with your name on it.",
  profilePhoto: "photo/profile.png",
};
