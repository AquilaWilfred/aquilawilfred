import { NextRequest, NextResponse } from "next/server";

const GITHUB_USERNAME = "AquilaWilfred";

const allowedCategories = [
  "ai-ml",
  "data-engineering",
  "cyber-security",
  "cloud-devops",
  "mobile",
  "fintech-solution",
  "data-science",
  "renewable-tech",
  "computer-vision",
  "nlp",
  "web-engineering",
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // ========== Query Parameters ==========
    const category = searchParams.get("category");          // e.g. ai-ml
    const search = searchParams.get("search")?.toLowerCase(); // title/description search
    const featured = searchParams.get("featured");          // "true" | "false"
    const language = searchParams.get("language");          // e.g. TypeScript
    const sort = searchParams.get("sort") || "updated";     // updated | stars | name
    const order = searchParams.get("order") || "desc";      // asc | desc
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const minStars = Number(searchParams.get("minStars")) || 0;

    // ========== Fetch from GitHub ==========
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          // Uncomment if you have a token (recommended)
          // Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
        next: { revalidate: 3600 }, // cache 1 hour
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch GitHub repositories", data: [] },
        { status: 502 }
      );
    }

    const repos = await res.json();

    // ========== Transform ==========
    let projects = repos
      .filter((repo: any) => !repo.fork && !repo.private)
      .map((repo: any) => {
        const topics: string[] = repo.topics || [];
        const matchedCategory =
          topics.find((t) => allowedCategories.includes(t)) || "web-engineering";

        const techStack = topics.filter((t) => !allowedCategories.includes(t));

        return {
          id: String(repo.id),
          title: repo.name
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c: string) => c.toUpperCase()),
          description: repo.description || "No description provided.",
          longDesc: repo.description || "No detailed description available.",
          tech: techStack.length > 0 ? techStack : [repo.language].filter(Boolean),
          stats: {
            stars: repo.stargazers_count ?? 0,
            forks: repo.forks_count ?? 0,
            language: repo.language || "—",
            updated: repo.updated_at,
          },
          category: matchedCategory
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" "),
          rawCategory: matchedCategory, // useful for filtering
          image: `https://opengraph.githubassets.com/1/${GITHUB_USERNAME}/${repo.name}`,
          featured: (repo.stargazers_count ?? 0) > 5,
          github: repo.html_url,
          live: repo.homepage || "#",
          createdAt: repo.created_at,
          updatedAt: repo.updated_at,
        };
      });

    // ========== Filtering ==========
    if (category && category !== "All") {
      projects = projects.filter(
        (p: any) =>
          p.rawCategory === category.toLowerCase() ||
          p.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (search) {
      projects = projects.filter(
        (p: any) =>
          p.title.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          p.tech.some((t: string) => t.toLowerCase().includes(search))
      );
    }

    if (featured === "true") {
      projects = projects.filter((p: any) => p.featured);
    } else if (featured === "false") {
      projects = projects.filter((p: any) => !p.featured);
    }

    if (language) {
      projects = projects.filter(
        (p: any) =>
          p.stats.language?.toLowerCase() === language.toLowerCase()
      );
    }

    if (minStars > 0) {
      projects = projects.filter((p: any) => p.stats.stars >= minStars);
    }

    // ========== Sorting ==========
    projects.sort((a: any, b: any) => {
      let comparison = 0;

      switch (sort) {
        case "stars":
          comparison = a.stats.stars - b.stats.stars;
          break;
        case "name":
          comparison = a.title.localeCompare(b.title);
          break;
        case "updated":
        default:
          comparison =
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }

      return order === "asc" ? comparison : -comparison;
    });

    // ========== Pagination ==========
    const total = projects.length;
    const start = (page - 1) * limit;
    const paginated = projects.slice(start, start + limit);

    return NextResponse.json({
      data: paginated,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: start + limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("GitHub projects fetch failed:", error);
    return NextResponse.json(
      { error: "Internal server error", data: [] },
      { status: 500 }
    );
  }
}