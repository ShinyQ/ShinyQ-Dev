interface PageMetadata {
    title: string;
    description: string;
}

export const metadata: Record<string, PageMetadata> = {
    home: {
        title: "Software Engineer | Backend & Full-Stack Developer",
        description: "Welcome to the portfolio of Kurniadi Ahmad Wijaya, a Jakarta-based software engineer specializing in scalable backend and full-stack web development using Golang, Java, and modern frameworks. Explore projects, blogs, and expertise."
    },
    about: {
        title: "About – Software Engineer & Tech Enthusiast",
        description: "Learn more about Kurniadi Ahmad Wijaya, a passionate software engineer from Jakarta with expertise in backend, full-stack development, and modern technologies. Discover his journey, philosophy, and favorite tools."
    },
    blog: {
        title: "Blog – Software Engineering Insights by Kurniadi Ahmad Wijaya",
        description: "Read in-depth articles, tutorials, and insights on software engineering, backend development, and full-stack technologies by Kurniadi Ahmad Wijaya. Stay updated with the latest trends and best practices."
    },
    projects: {
        title: "Projects – Portfolio | Backend & Full-Stack Solutions",
        description: "Explore a curated portfolio of projects by Kurniadi Ahmad Wijaya, showcasing expertise in backend systems, full-stack applications, and innovative software solutions using Golang, Java, and modern frameworks."
    },
    journey: {
        title: "Career Journey | Software Engineering Milestones",
        description: "Discover the professional journey, achievements, and milestones of Kurniadi Ahmad Wijaya in software engineering, including education, certifications, and career highlights."
    },
    notFound: {
        title: "404 – Page Not Found",
        description: "Sorry, the page you are looking for does not exist. Visit the homepage of Kurniadi Ahmad Wijaya to explore software engineering projects, blogs, and more."
    }
}; 