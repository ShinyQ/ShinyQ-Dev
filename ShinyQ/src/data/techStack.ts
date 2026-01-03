interface TechItem {
  name: string;
  icon: string;
  type?: string;
  site?: string;
}

export const techItems: TechItem[] = [
  // Backend
  { name: "Spring Boot", icon: "/icons/spring-boot.webp", type: "backend", site: "https://spring.io/projects/spring-boot" },
  { name: "ExpressJS", icon: "/icons/expressjs.webp", type: "backend", site: "https://expressjs.com/" },
  { name: "Laravel", icon: "/icons/laravel.webp", type: "backend", site: "https://laravel.com/" },
  { name: "Flask", icon: "/icons/flask.webp", type: "backend", site: "https://flask.palletsprojects.com/" },
  { name: "FastAPI", icon: "/icons/fastapi.webp", type: "backend", site: "https://fastapi.tiangolo.com/" },
  { name: "Django", icon: "/icons/django.webp", type: "backend", site: "https://www.djangoproject.com/" },
  { name: "Gin", icon: "/icons/gin.webp", type: "backend", site: "https://gin-gonic.com/" },
  { name: "Echo", icon: "/icons/echo.webp", type: "backend", site: "https://echo.labstack.com/" },
  { name: "Huggingface", icon: "/icons/huggingface.webp", type: "backend", site: "https://huggingface.co/" },
  { name: "Langchain", icon: "/icons/langchain.webp", type: "backend", site: "https://www.langchain.com/" },

  // Frontend
  { name: "React", icon: "/icons/react.webp", type: "frontend", site: "https://react.dev/" },
  { name: "Vue", icon: "/icons/vue.webp", type: "frontend", site: "https://vuejs.org/" },
  { name: "Next.js", icon: "/icons/nextjs.webp", type: "frontend", site: "https://nextjs.org/" },
  { name: "Radix UI", icon: "/icons/radix-ui.webp", type: "frontend", site: "https://www.radix-ui.com/" },
  { name: "Shadcn UI", icon: "/icons/shadcn-ui.webp", type: "frontend", site: "https://ui.shadcn.com/" },
  { name: "Tailwind", icon: "/icons/tailwind.webp", type: "frontend", site: "https://tailwindcss.com/" },
  { name: "Streamlit", icon: "/icons/streamlit.webp", type: "frontend", site: "https://streamlit.io/" },
  { name: "Bootstrap", icon: "/icons/bootstrap.webp", type: "frontend", site: "https://getbootstrap.com/" },
  { name: "Svelte", icon: "/icons/svelte.webp", type: "frontend", site: "https://svelte.dev/" },
  { name: "Astro", icon: "/icons/astro.webp", type: "frontend", site: "https://astro.build/" },
  { name: "Vite", icon: "/icons/vite.webp", type: "frontend", site: "https://vitejs.dev/" },

  // Others
  { name: "Docker", icon: "/icons/docker.webp", type: "other", site: "https://www.docker.com/" },
  { name: "Git", icon: "/icons/git.webp", type: "other", site: "https://git-scm.com/" },
  { name: "PostgreSQL", icon: "/icons/postgresql.webp", type: "other", site: "https://www.postgresql.org/" },
  { name: "MySQL", icon: "/icons/mysql.webp", type: "other", site: "https://www.mysql.com/" },
  { name: "MongoDB", icon: "/icons/mongodb.webp", type: "other", site: "https://www.mongodb.com/" },
  { name: "Jenkins", icon: "/icons/jenkins.webp", type: "other", site: "https://www.jenkins.io/" },
  { name: "AWS", icon: "/icons/aws.webp", type: "other", site: "https://aws.amazon.com/" },
  { name: "Sentry", icon: "/icons/sentry.webp", type: "other", site: "https://sentry.io/" },
  { name: "Redis", icon: "/icons/redis.webp", type: "other", site: "https://redis.io/" },
  { name: "Kafka", icon: "/icons/kafka.webp", type: "other", site: "https://kafka.apache.org/" },
]; 