"use client";
import { useState, useEffect } from "react";
import { Clock, ArrowRight, Calendar } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TechDecorations from "@/components/ui/TechLoader";
import { portfolioData, profileImages } from "@/data/portfolio";
const { owner } = portfolioData;

type BlogPost = typeof portfolioData.blog[0];

function mapRow(row: any): BlogPost {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    tags: row.tags || [],
    date: row.date,
    readTime: row.read_time,
    image: row.image,
    published: row.published,
  };
}

export default function BlogPage() {
  // Hardcoded posts are ALWAYS the base — they never disappear
  const [allPosts, setAllPosts] = useState<BlogPost[]>(portfolioData.blog);
  const [sel, setSel] = useState<BlogPost | null>(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetch("/api/blog")
      .then(r => r.json())
      .then(({ data }) => {
        if (!data?.length) return; // DB empty → hardcoded stays
        
        const dbPosts = data.map(mapRow);
        
        // ACCUMULATE: hardcoded + DB merged together
        // DB posts override hardcoded ones with same title (to avoid duplicates)
        // New DB posts are added on top
        const dbTitles = new Set(dbPosts.map((p: BlogPost) => p.title.toLowerCase().trim()));
        const hardcodedNotInDB = portfolioData.blog.filter(
          p => !dbTitles.has(p.title.toLowerCase().trim())
        );
        
        // DB posts first (newest), then hardcoded ones not already in DB
        setAllPosts([...dbPosts, ...hardcodedNotInDB]);
      })
      .catch(() => {}); // Network fail → hardcoded stays
  }, []);

  const allTags = ["All", ...Array.from(new Set(allPosts.flatMap(b => b.tags)))];
  const blog = allPosts; // keep original name for rest of component
  const posts = (filter === "All" ? blog : blog.filter(b => b.tags.includes(filter))).filter(p => p.published);

  const AuthorChip = ({size=32}:{size?:number}) => (
    <div className="flex items-center gap-2">
      <img src={profileImages.avatar} alt={owner.name} className="rounded-full border-2 border-sky-200 object-cover object-top shrink-0" style={{width:size,height:size}}/>
      <span className="text-sky-700 text-sm font-medium">{owner.name}</span>
    </div>
  );

  if(sel) return (<>
    <Navbar/>
    <main className="pt-24 pb-24 min-h-screen bg-hero">
      <div className="max-w-3xl mx-auto px-8">
        <button onClick={()=>setSel(null)} className="text-sky-600 text-sm font-mono mb-8 hover:underline flex items-center gap-2">← Back to Blog</button>
        <div className="relative h-80 rounded-3xl overflow-hidden mb-8 shadow-card">
          <img src={sel.image} alt={sel.title} className="w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-gradient-to-t from-sky-950/70 to-transparent flex items-end p-8">
            <AuthorChip size={40}/>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">{sel.tags.map(t=><span key={t} className="skill-tag">{t}</span>)}</div>
        <h1 className="font-heading font-black text-sky-950 text-4xl mb-5 leading-tight">{sel.title}</h1>
        <div className="flex items-center gap-5 mb-10 pb-6 border-b border-sky-100">
          <AuthorChip/>
          <span className="text-sky-900/40 text-sm font-mono flex items-center gap-1"><Calendar size={14}/>{sel.date}</span>
          <span className="text-sky-900/40 text-sm font-mono flex items-center gap-1"><Clock size={14}/>{sel.readTime}</span>
        </div>
        {/* Render content: HTML from rich editor OR plain text fallback */}
        {sel.content && sel.content.trim().startsWith("<") ? (
          // HTML content from rich editor — render as-is
          <div
            className="rich-content text-sky-900/70 leading-relaxed text-lg"
            dangerouslySetInnerHTML={{ __html: sel.content }}
          />
        ) : (
          // Plain text content — render as paragraphs, no code blocks
          <div className="rich-content text-sky-900/70 leading-relaxed text-lg">
            {sel.content?.split("\n").map((line, i) => {
              if (!line.trim()) return <br key={i} />;
              if (line.startsWith("## ")) return <h2 key={i} className="font-heading font-bold text-sky-950 text-2xl mt-8 mb-4">{line.slice(3)}</h2>;
              if (line.startsWith("# ")) return <h1 key={i} className="font-heading font-bold text-sky-950 text-3xl mt-8 mb-4">{line.slice(2)}</h1>;
              return <p key={i} className="mb-4">{line}</p>;
            })}
          </div>
        )}
        {/* Author bio at bottom */}
        <div className="card p-8 mt-12 flex gap-6 items-start">
          <img src={profileImages.hero} alt={owner.name} className="w-20 h-20 rounded-2xl object-cover object-top border-2 border-sky-100 shrink-0"/>
          <div>
            <p className="font-heading font-bold text-sky-950 text-lg">{owner.name}</p>
            <p className="text-sky-500 text-sm mb-2">{owner.company} · {owner.location}</p>
            <p className="text-sky-900/60 text-sm leading-relaxed">{owner.bio.slice(0,200)}...</p>
          </div>
        </div>
      </div>
    </main>
    <Footer/>
  </>);

  return (<>
    <Navbar/><TechDecorations/>
    <main className="pt-24 pb-24 min-h-screen bg-hero grid-bg">
      <div className="max-w-screen-2xl mx-auto px-8 lg:px-16">
        <div className="text-center mb-16 pt-10">
          <span className="inline-block bg-sky-100 text-sky-700 text-xs font-mono font-bold px-4 py-1.5 rounded-full mb-4 tracking-widest">INSIGHTS</span>
          <h1 className="section-title mb-4">Technical <span className="text-gradient">Blog</span></h1>
          <div className="flex items-center justify-center gap-3 mt-4">
            <img src={profileImages.avatar} alt={owner.name} className="w-10 h-10 rounded-full border-2 border-sky-300 object-cover object-top"/>
            <p className="text-sky-700 font-medium">Written by <span className="font-bold">{owner.name}</span></p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {allTags.map(t=>(
            <button key={t} onClick={()=>setFilter(t)} className={`px-5 py-2 rounded-full text-sm font-heading font-semibold transition-all ${filter===t?"btn-primary py-2 px-5":"btn-outline py-2 px-5"}`}>{t}</button>
          ))}
        </div>
        {posts[0] && (
          <div className="card overflow-hidden mb-12 cursor-pointer group" onClick={()=>setSel(posts[0])}>
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative overflow-hidden" style={{minHeight:280}}>
                <img src={posts[0].image} alt={posts[0].title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" style={{minHeight:280}}/>
                <div className="absolute bottom-4 left-4">
                  <img src={profileImages.avatar} alt={owner.name} className="w-12 h-12 rounded-full border-3 border-white object-cover object-top shadow-lg" style={{border:"3px solid white"}}/>
                </div>
              </div>
              <div className="p-10 flex flex-col justify-center">
                <span className="text-sky-500 font-mono text-xs mb-3 tracking-wider font-bold">FEATURED POST</span>
                <h2 className="font-heading font-black text-sky-950 text-2xl mb-4 leading-tight">{posts[0].title}</h2>
                <p className="text-sky-900/60 mb-5">{posts[0].excerpt}</p>
                <div className="flex items-center gap-4 mb-5">
                  <AuthorChip/>
                  <span className="text-sky-900/40 text-xs font-mono">{posts[0].date} · {posts[0].readTime}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-5">{posts[0].tags.map(t=><span key={t} className="skill-tag">{t}</span>)}</div>
                <span className="text-sky-600 flex items-center gap-2 font-semibold">Read Article <ArrowRight size={16}/></span>
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {posts.slice(1).map(post=>(
            <div key={post.id} className="card overflow-hidden group cursor-pointer" onClick={()=>setSel(post)}>
              <div className="relative h-52 overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                <div className="absolute inset-0 bg-gradient-to-t from-sky-950/70 to-transparent flex items-end p-4">
                  <img src={profileImages.avatar} alt={owner.name} className="w-9 h-9 rounded-full border-2 border-white object-cover object-top"/>
                </div>
              </div>
              <div className="p-7">
                <div className="flex flex-wrap gap-2 mb-3">{post.tags.slice(0,2).map(t=><span key={t} className="skill-tag">{t}</span>)}</div>
                <h3 className="font-heading font-bold text-sky-950 mb-3 leading-tight">{post.title}</h3>
                <p className="text-sky-900/60 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs font-mono text-sky-900/40 border-t border-sky-50 pt-4">
                  <AuthorChip size={24}/>
                  <span className="flex items-center gap-1"><Clock size={12}/>{post.readTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
    <Footer/>
  </>);
}
