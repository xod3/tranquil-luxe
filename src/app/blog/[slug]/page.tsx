import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { blogPosts, getPostBySlug, getAllSlugs } from "../blogData";
import styles from "../blog.module.css";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.metaDescription,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      type: "article",
      publishedTime: post.date,
      authors: ["Tranquil Luxe Massage"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.metaDescription,
    },
  };
}

function renderMarkdown(content: string) {
  // Simple markdown-to-HTML for our blog posts
  const lines = content.split('\n');
  const html: string[] = [];
  let inList = false;
  let listType = '';

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('## ')) {
      if (inList) { html.push(listType === 'ul' ? '</ul>' : '</ol>'); inList = false; }
      html.push(`<h2>${trimmed.slice(3)}</h2>`);
    } else if (trimmed.startsWith('### ')) {
      if (inList) { html.push(listType === 'ul' ? '</ul>' : '</ol>'); inList = false; }
      html.push(`<h3>${trimmed.slice(4)}</h3>`);
    } else if (trimmed.startsWith('- **') || trimmed.startsWith('- ')) {
      if (!inList) { html.push('<ul>'); inList = true; listType = 'ul'; }
      const content = trimmed.slice(2);
      html.push(`<li>${formatInline(content)}</li>`);
    } else if (/^\d+\.\s/.test(trimmed)) {
      if (!inList) { html.push('<ol>'); inList = true; listType = 'ol'; }
      const content = trimmed.replace(/^\d+\.\s/, '');
      html.push(`<li>${formatInline(content)}</li>`);
    } else if (trimmed === '') {
      if (inList) { html.push(listType === 'ul' ? '</ul>' : '</ol>'); inList = false; }
    } else {
      if (inList) { html.push(listType === 'ul' ? '</ul>' : '</ol>'); inList = false; }
      html.push(`<p>${formatInline(trimmed)}</p>`);
    }
  }
  if (inList) html.push(listType === 'ul' ? '</ul>' : '</ol>');

  return html.join('\n');
}

function formatInline(text: string): string {
  // Bold
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Links
  text = text.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  return text;
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: "Tranquil Luxe Massage",
      url: "https://tranquilluxemassage.fit",
    },
    publisher: {
      "@type": "Organization",
      name: "Tranquil Luxe Massage",
      logo: {
        "@type": "ImageObject",
        url: "https://tranquilluxemassage.fit/logo.png",
      },
    },
  };

  return (
    <div className={`${styles.blogContainer}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className={styles.postContainer}>
        <Link href="/blog" className={styles.backLink}>
          ← Back to Blog
        </Link>

        <header className={styles.postHeaderSection}>
          <span className={styles.postCategory}>{post.category}</span>
          <h1 className={styles.postPageTitle}>{post.title}</h1>
          <div className={styles.postPageMeta}>
            <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span>{post.readTime}</span>
          </div>
        </header>

        <div
          className={styles.postContent}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
        />

        <div className={styles.postCta}>
          <h3>Ready to Experience Tranquil Luxe?</h3>
          <p>Book your private, in-home massage session today.</p>
          <Link href="/checkout" className="btn btn-primary">
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}
