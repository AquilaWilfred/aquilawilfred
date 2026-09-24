"use client";
import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TechDecorations from "@/components/ui/TechLoader";
import ProfileAvatar from "@/components/ui/ProfileAvatar";
import { portfolioData, profileImages } from "@/data/portfolio";
import { useSocials } from "@/hooks/useSocials";
import SocialIcon from "@/components/ui/SocialIcon";
import toast from "react-hot-toast";
const { owner } = portfolioData;

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const liveSocials = useSocials();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      setSent(true);
      toast.success("Message sent! I'll respond within 24 hours.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };
  return (<>
    <Navbar/><TechDecorations/>
    <main className="pt-24 pb-24 min-h-screen">
      {/* Hero strip with photo */}
      <section className="bg-gradient-to-r from-sky-600 via-violet-600 to-emerald-600 py-20">
        <div className="max-w-screen-2xl mx-auto px-8 lg:px-16">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <ProfileAvatar size="xl" variant="rounded" animated showRing/>
            <div className="text-white text-center lg:text-left">
              <span className="inline-block bg-white/20 text-white text-xs font-mono font-bold px-4 py-1.5 rounded-full mb-4 tracking-widest">GET IN TOUCH</span>
              <h1 className="font-display font-black text-5xl mb-3 leading-tight">Let's Build Something<br/>Extraordinary</h1>
              <p className="text-white/80 text-lg">{owner.name} · {owner.company} · {owner.location}</p>
              <div className="flex items-center gap-2 mt-3 justify-center lg:justify-start">
                <div className="pulse-dot"/><span className="text-emerald-200 text-sm font-mono">{owner.availability}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-hero grid-bg">
        <div className="max-w-screen-2xl mx-auto px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left: contact info + photo */}
            <div className="space-y-6">
              {/* Big contact photo */}
              <div className="card p-0 overflow-hidden">
                <div className="relative h-64">
                  <img src={profileImages.contact} alt={owner.name} className="w-full h-full object-cover object-top"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-sky-950/80 to-transparent flex items-end p-8">
                    <div>
                      <p className="text-white font-heading font-bold text-xl">{owner.name}</p>
                      <p className="text-sky-200 text-sm">{owner.company}</p>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <h2 className="font-heading font-bold text-sky-950 text-xl mb-6">Contact Information</h2>
                  <div className="space-y-5">
                    <a href={`mailto:${owner.email}`} className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center group-hover:bg-sky-500 group-hover:border-sky-500 transition-colors">
                        <Mail size={20} className="text-sky-500 group-hover:text-white transition-colors"/>
                      </div>
                      <div><p className="text-sky-900/40 text-xs font-mono mb-0.5">EMAIL</p><p className="text-sky-700 font-medium group-hover:text-sky-500 transition-colors">{owner.email}</p></div>
                    </a>
                    {owner.phone.map(p=>(
                      <a key={p} href={`tel:${p}`} className="flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                          <Phone size={20} className="text-emerald-500 group-hover:text-white transition-colors"/>
                        </div>
                        <div><p className="text-sky-900/40 text-xs font-mono mb-0.5">PHONE</p><p className="text-sky-700 font-medium group-hover:text-emerald-600 transition-colors">{p}</p></div>
                      </a>
                    ))}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
                        <MapPin size={20} className="text-violet-500"/>
                      </div>
                      <div><p className="text-sky-900/40 text-xs font-mono mb-0.5">LOCATION</p><p className="text-sky-700 font-medium">{owner.location}</p></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-8">
                <h3 className="font-heading font-bold text-sky-950 text-lg mb-5">Connect Online</h3>
                <div className="grid grid-cols-2 gap-3">
                  {liveSocials.map((s) => (
                    <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                      className="bg-sky-50 hover:bg-sky-100 rounded-xl p-4 flex items-center gap-3 transition-colors border border-sky-100 group">
                      <span className="text-sky-500 group-hover:text-sky-700 transition-colors shrink-0">
                        <SocialIcon id={s.id} size={20} />
                      </span>
                      <span className="text-sky-900 text-sm font-medium">{s.platform}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: form */}
            <div className="card p-8">
              {sent ? (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                  <CheckCircle size={64} className="text-emerald-500 mb-6" />
                  <h2 className="font-heading font-bold text-sky-950 text-2xl mb-3">Message Sent!</h2>
                  <p className="text-sky-700/70 mb-6">Thanks for reaching out. I'll get back to you within 24 hours.</p>
                  <button onClick={() => setSent(false)} className="btn-primary">Send Another Message</button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-8">
                    <ProfileAvatar size="md" showRing animated/>
                    <div>
                      <h2 className="font-heading font-bold text-sky-950 text-xl">Send a Message</h2>
                      <p className="text-sky-700/60 text-sm">to {owner.name}</p>
                    </div>
                  </div>
                  <form onSubmit={submit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {[{k:"name",l:"Name",t:"text",ph:"John Doe"},{k:"email",l:"Email",t:"email",ph:"you@example.com"}].map(f=>(
                        <div key={f.k}>
                          <label className="block text-sky-900/60 text-sm font-mono mb-2">{f.l.toUpperCase()} *</label>
                          <input type={f.t} required value={(form as any)[f.k]} onChange={e=>setForm({...form,[f.k]:e.target.value})} placeholder={f.ph} className="input-field"/>
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-sky-900/60 text-sm font-mono mb-2">SUBJECT *</label>
                      <input type="text" required value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} placeholder="Project Inquiry / Collaboration" className="input-field"/>
                    </div>
                    <div>
                      <label className="block text-sky-900/60 text-sm font-mono mb-2">MESSAGE *</label>
                      <textarea required rows={7} value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder={`Hi ${owner.name.split(" ")[0]}, I'd like to discuss...`} className="input-field resize-none"/>
                    </div>
                    <button type="submit" disabled={sending} className="w-full btn-primary justify-center text-base py-4 disabled:opacity-60">
                      {sending?<><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Sending...</>:<><Send size={17}/>Send Message to {owner.name.split(" ")[0]}</>}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
    <Footer/>
  </>);
}
