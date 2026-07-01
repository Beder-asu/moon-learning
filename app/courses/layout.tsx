import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "All Courses",
    description: "Browse all available courses on Moon Learning. Master chess, strategy, and more with expert video lessons.",
    openGraph: {
        title: "All Courses | Moon Learning",
        description: "Browse all available courses on Moon Learning. Master chess, strategy, and more with expert video lessons.",
        url: "https://moon-learn.vercel.app/courses",
    },
};

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
