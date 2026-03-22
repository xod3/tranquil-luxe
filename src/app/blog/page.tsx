import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "./blogData";
import styles from "./blog.module.css";

export const metadata: Metadata = {
  title: "Blog — Massage Tips, Wellness & Lifestyle",
  description: "Expert insights on luxury massage, wellness, intimacy, and self-care. Discover the art of relaxation with Tranquil Luxe Massage.",
  openGraph: {
    title: "Blog — Tranquil Luxe Massage",
    description: "Expert insights on luxury massage, wellness, intimacy, and self-care.",
  },
};

export default function BlogIndex() {
  return (
    <div className={`container ${styles.blogContainer}`}>
      <div className={styles.blogHeader}>
        <h1 className="section-title">The Luxe Journal</h1>
        <p className={styles.blogSubtitle}>
          Expert insights on massage, wellness, and the art of indulgent self-care
        </p>
      </div>

      <div className={styles.postsGrid}>
        {blogPosts.map((post) => (
          <Link href={`/blog/${post.slug}`} key={post.slug} style={{ textDecoration: 'none' }}>
            <article className={styles.postCard}>
              <div className={styles.postCardBody}>
                <span className={styles.postCategory}>{post.category}</span>
                <h2 className={styles.postTitle}>{post.title}</h2>
                <p className={styles.postExcerpt}>{post.excerpt}</p>
                <div className={styles.postMeta}>
                  <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
