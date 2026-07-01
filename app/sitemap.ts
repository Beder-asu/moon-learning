import { MetadataRoute } from "next";
import { getDatabase } from "@/lib/mongodb";

const BASE_URL = "https://moon-learn.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/courses`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/login`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.3,
        },
        {
            url: `${BASE_URL}/register`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.3,
        },
    ];

    try {
        const db = await getDatabase();
        const courses = await db
            .collection("courses")
            .find({}, { projection: { _id: 1, updatedAt: 1 } })
            .toArray();

        const coursePages: MetadataRoute.Sitemap = courses.map((course) => ({
            url: `${BASE_URL}/courses/${course._id.toString()}`,
            lastModified: course.updatedAt ?? new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.8,
        }));

        return [...staticPages, ...coursePages];
    } catch {
        // If DB is unavailable during build, return static pages only
        return staticPages;
    }
}
