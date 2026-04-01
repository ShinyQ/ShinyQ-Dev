import { projects } from "../../ShinyQ/src/data/projects";
import { timelineItems } from "../../ShinyQ/src/data/timeline";
import { techItems } from "../../ShinyQ/src/data/techStack";
import { aboutInfo } from "../../ShinyQ/src/data/about";
import { SEED_BLOGS } from "../lib/actions/portfolio/portfolio.mock";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8002/api/v1";

async function postData(endpoint: string, data: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      if (res.status === 400 || res.status === 409) {
        console.warn(`[SKIP] Item in ${endpoint} likely already exists. (${data.title || data.name || data.slug || data.id})`);
      } else {
        const err = await res.text();
        console.error(`[ERROR] Failed to post to ${endpoint}: ${err}`);
      }
    } else {
      console.log(`[OK] Inserted into ${endpoint} (${data.title || data.name || data.slug || data.id})`);
    }
  } catch (err) {
    console.error(`[ERROR] Network error for ${endpoint}:`, err);
  }
}

async function putData(endpoint: string, data: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[ERROR] Failed to put to ${endpoint}: ${err}`);
    } else {
      console.log(`[OK] Inserted/Updated ${endpoint}`);
    }
  } catch (err) {
    console.error(`[ERROR] Network error for ${endpoint}:`, err);
  }
}

async function seed() {
  console.log("Seeding databases via FastAPI using data from ShinyQ...");

  console.log(`Seeding ${projects.length} projects...`);
  for (const project of projects) {
    // Remap 'id' to 'slug' for projects
    const { id, ...rest } = project;
    await postData("projects/", { slug: id, ...rest });
  }

  console.log(`Seeding ${timelineItems.length} timeline items...`);
  for (const timeline of timelineItems) {
    await postData("timeline/", timeline);
  }

  console.log(`Seeding ${techItems.length} tech-stack items...`);
  for (const tech of techItems) {
    await postData("tech-stack/", tech);
  }

  console.log(`Seeding ${SEED_BLOGS.length} blogs from mock...`);
  for (const blog of SEED_BLOGS) {
    await postData("blogs/", blog);
  }

  console.log("Seeding AboutInfo setting...");
  await putData("settings/app/about/", aboutInfo);

  console.log("Seeding completed.");
}

seed().catch(console.error);
