import { MetadataRoute } from "next";

const BASE_URL = "https://moon-learn.vercel.app";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/admin", "/api/", "/protected"],
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}
