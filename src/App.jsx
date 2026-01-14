import React, { useState, useEffect } from 'react';
import { PenTool, MessageSquare, Heart, Clock, AlertCircle, Sparkles, Feather, X, Type, Globe, Timer, Languages, Coffee, ExternalLink, Info } from 'lucide-react';
import { db, auth } from './firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { Analytics } from "@vercel/analytics/react"

export default function App() {
  const [view, setView] = useState('feed');
  const [showSupport, setShowSupport] = useState(false);
  const [showManifesto, setShowManifesto] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  
  const [stories, setStories] = useState([]);
  const [newStory, setNewStory] = useState({ title: '', content: '' });
  const [sentenceCount, setSentenceCount] = useState(0);

  useEffect(() => {
    signInAnonymously(auth).catch((error) => console.error("Giriş hatası:", error));
  }, []);

  useEffect(() => {
    const q = query(collection(db, "stories"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedStories = snapshot.docs.map(doc => {
        const data = doc.data();
        let dateDisplay = "Just now";
        if (data.createdAt) {
          const seconds = (Date.now() - data.createdAt.toMillis()) / 1000;
          if (seconds < 60) dateDisplay = "Just now";
          else if (seconds < 3600) dateDisplay = `${Math.floor(seconds / 60)} MINS AGO`;
          else dateDisplay = `${Math.floor(seconds / 3600)} HOURS AGO`;
        }
        return { id: doc.id, ...data, date: dateDisplay };
      });
      setStories(fetchedStories);
    });
    return () => unsubscribe();
  }, []);

  // Geri Sayım (UTC Gece Yarısı)
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setUTCHours(24, 0, 0, 0);
      const diff = tomorrow - now;
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      setTimeLeft(`${hours}h ${minutes}m`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 60000); 
    return () => clearInterval(interval);
  }, []);

  const countSentences = (text) => {
    if (!text) return 0;
    const matches = text.match(/[^\.!\?。！？]+[\.!\?。！？]+/g);
    return matches ? matches.length : 0;
  };

  const handleContentChange = (e) => {
    const text = e.target.value;
    setNewStory({ ...newStory, content: text });
    setSentenceCount(countSentences(text));
  };

  // Çeviri Özelliği (Google Translate Linki)
  const toggleTranslation = (text) => {
    const url = `https://translate.google.com/?sl=auto&tl=en&text=${encodeURIComponent(text)}&op=translate`;
    window.open(url, '_blank');
  };

  const handleSubmit = async () => {
    if (!newStory.title.trim() || !newStory.content.trim()) return;
    
    const colors = ["bg-[#C05636]", "bg-[#D4A03D]", "bg-[#5D6D38]", "bg-[#4A6C6F]", "bg-[#8C4B4B]", "bg-[#5C4B51]"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    try {
      await addDoc(collection(db, "stories"), {
        title: newStory.title,
        content: newStory.content,
        avatarColor: randomColor,
        likes: 0,
        createdAt: serverTimestamp(),
        lang: "auto"
      });
      setNewStory({ title: '', content: '' });
      setSentenceCount(0);
      setView('feed');
    } catch (e) {
      console.error("Hata:", e);
      alert("Hikaye gönderilemedi. İnternet bağlantınızı kontrol edin.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F2E8D5] font-serif text-[#2C241B]">
      
      {/* Manifesto/About Modal */}
      {showManifesto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C241B]/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#F9F4E8] border-2 border-[#2C241B] p-8 max-w-lg w-full shadow-[12px_12px_0px_0px_rgba(44,36,27,1)] relative rotate-1">
            <button onClick={() => setShowManifesto(false)} className="absolute top-4 right-4 p-1 hover:bg-[#E6DCC9] transition-colors"><X size={24} /></button>
            <div className="space-y-6">
              <h3 className="text-4xl font-black text-[#C05636] uppercase tracking-tighter transform -rotate-2 border-b-2 border-[#2C241B] pb-4">Manifesto</h3>
              <div className="space-y-4 text-lg font-medium">
                <p><span className="font-bold text-[#C05636]">"The internet remembers everything. We don't."</span></p>
                <p>Here, you are a ghost. No names, no profiles, no history.</p>
                <p>Speak in your mother tongue. Every language is welcome here.</p>
                <p>You have <span className="bg-[#2C241B] text-[#F2E8D5] px-1">50 sentences</span>. At midnight, the slate is wiped clean.</p>
              </div>
              <button onClick={() => { setShowManifesto(false); setView('write'); }} className="w-full py-3 bg-[#2C241B] text-[#F2E8D5] font-bold uppercase tracking-widest hover:bg-[#4A3B2C] shadow-[4px_4px_0px_0px_rgba(192,86,54,1)] active:translate-x-[2px] active:translate-y-[2px]">Start Writing</button>
            </div>
          </div>
        </div>
      )}

      {/* Support Modal */}
      {showSupport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C241B]/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#F9F4E8] border-2 border-[#2C241B] p-8 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(192,86,54,1)] relative">
            <button onClick={() => setShowSupport(false)} className="absolute top-4 right-4 p-1 hover:bg-[#E6DCC9] transition-colors"><X size={24} /></button>
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 bg-[#C05636] text-[#F2E8D5] flex items-center justify-center rounded-full border-2 border-[#2C241B]"><Coffee size={32} /></div>
              <div>
                <h3 className="text-2xl font-black text-[#2C241B] uppercase tracking-tight mb-2">Support the Platform</h3>
                <p className="text-[#2C241B]/80 font-serif">Your support keeps this independent space ad-free and alive.</p>
              </div>
              {/* BURAYA KENDİ BUY ME A COFFEE LİNKİNİ YAPIŞTIR: */}
              <a href="[https://www.buymeacoffee.com/KULLANICI_ADIN](https://www.buymeacoffee.com/KULLANICI_ADIN)" target="_blank" className="w-full py-4 bg-[#D4A03D] hover:bg-[#B8862D] text-[#2C241B] font-bold uppercase tracking-widest border-2 border-[#2C241B] shadow-[4px_4px_0px_0px_rgba(44,36,27,1)] active:translate-x-[2px] active:translate-y-[2px] flex items-center justify-center gap-2">
                <span>Buy Me a Coffee</span><ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-10 bg-[#F2E8D5] border-b-2 border-[#2C241B]">
        <div className="max-w-2xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('feed')}>
            <div className="w-10 h-10 bg-[#C05636] border-2 border-[#2C241B] text-[#F2E8D5] rounded-none flex items-center justify-center transform group-hover:-rotate-6 transition-transform shadow-[4px_4px_0px_0px_rgba(44,36,27,1)]"><Type size={24} /></div>
            <div><h1 className="font-serif text-2xl font-black tracking-tighter uppercase text-[#2C241B] leading-none">50 Sentences</h1><span className="text-[10px] font-mono uppercase tracking-widest text-[#2C241B]/60 block mt-1">Global • Ephemeral</span></div>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="hidden sm:flex flex-col items-end"><div className="flex items-center gap-1 text-[#C05636] font-bold text-xs uppercase tracking-widest"><Timer size={12} /><span>Wipe In</span></div><span className="font-mono text-lg leading-none font-bold text-[#2C241B]">{timeLeft}</span></div>
            <div className="flex items-center gap-2">
               <button onClick={() => setShowManifesto(true)} className="p-2 text-[#2C241B] hover:text-[#4A6C6F]" title="Manifesto"><Info size={24} /></button>
               <button onClick={() => setShowSupport(true)} className="p-2 text-[#2C241B] hover:text-[#C05636]" title="Support"><Coffee size={24} /></button>
              {view === 'feed' && <button onClick={() => setView('write')} className="px-4 sm:px-6 py-2 bg-[#2C241B] text-[#F2E8D5] text-sm font-bold tracking-widest hover:bg-[#4A3B2C] transition-all flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(192,86,54,1)] border-2 border-[#2C241B] active:translate-x-[2px] active:translate-y-[2px] uppercase"><PenTool size={16} /><span className="hidden sm:inline">Write</span></button>}
            </div>
          </div>
        </div>
      </header>

      <div className="sm:hidden bg-[#C05636] text-[#F2E8D5] text-xs font-mono font-bold text-center py-1 uppercase tracking-widest border-b-2 border-[#2C241B]">Data wipes in {timeLeft} • Write in any language</div>

      <main className="max-w-2xl mx-auto p-6">
        {view === 'write' && (
          <div className="bg-[#F9F4E8] border-2 border-[#2C241B] p-8 shadow-[8px_8px_0px_0px_rgba(44,36,27,0.2)] relative animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-8 border-b-2 border-[#2C241B]/20 pb-4">
                <h2 className="text-3xl font-black text-[#2C241B] tracking-tight uppercase">Tell Your Story</h2>
                <button onClick={() => setView('feed')} className="p-2 hover:bg-[#E6DCC9]"><X size={24} /></button>
            </div>
            <div className="space-y-6">
                <input type="text" dir="auto" placeholder="TITLE (OPTIONAL)" className="w-full text-2xl font-bold placeholder:text-[#2C241B]/40 border-b-2 border-[#2C241B]/20 focus:border-[#C05636] bg-transparent text-[#2C241B] px-0 py-2 focus:ring-0 uppercase font-serif" value={newStory.title} onChange={(e) => setNewStory({...newStory, title: e.target.value})} maxLength={50} />
                <div className="relative">
                  <textarea dir="auto" placeholder="Type in English, Türkçe, Español, 日本語..." className="w-full h-72 resize-none text-lg leading-loose text-[#2C241B] placeholder:text-[#2C241B]/40 border-2 border-[#2C241B]/10 focus:border-[#2C241B] focus:ring-0 p-4 bg-[#F2E8D5]/50 font-mono" value={newStory.content} onChange={handleContentChange} />
                  <div className={`absolute -bottom-3 right-4 px-4 py-1 text-xs font-bold border-2 tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${sentenceCount > 50 ? 'bg-[#8C4B4B] text-[#F9F4E8] border-[#2C241B]' : 'bg-[#F2E8D5] text-[#2C241B] border-[#2C241B]'}`}>{sentenceCount} / 50 SENTENCES</div>
                </div>
                <div className="pt-8 flex justify-between items-center">
                  <div className="flex flex-col gap-1 text-xs font-mono text-[#2C241B]/60 uppercase tracking-widest">
                    <div className="flex items-center gap-2"><AlertCircle size={14} /><span>Anonymous</span></div>
                    <div className="flex items-center gap-2"><Clock size={14} /><span>Vanish in 24h</span></div>
                  </div>
                  <button onClick={handleSubmit} disabled={sentenceCount > 50 || !newStory.content.trim()} className={`px-8 py-3 font-bold border-2 border-[#2C241B] uppercase tracking-widest ${sentenceCount > 50 || !newStory.content.trim() ? 'bg-[#E6DCC9] text-[#2C241B]/40 cursor-not-allowed border-dashed' : 'bg-[#C05636] text-[#F9F4E8] hover:bg-[#A84526] shadow-[4px_4px_0px_0px_rgba(44,36,27,1)] active:translate-x-[2px] active:translate-y-[2px]'}`}>Publish</button>
                </div>
            </div>
          </div>
        )}

        {view === 'feed' && (
          <div className="space-y-8">
            {stories.length === 0 ? (
              <div className="text-center py-20 opacity-50"><p className="text-xl font-bold">No stories yet.</p><p>Be the first ghost to whisper.</p></div>
            ) : (
              stories.map(story => (
                <div key={story.id} className="bg-[#F9F4E8] border-2 border-[#2C241B] p-8 shadow-[6px_6px_0px_0px_rgba(44,36,27,0.15)] hover:shadow-[8px_8px_0px_0px_rgba(192,86,54,1)] hover:-translate-y-1 transition-all duration-300 group">
                  <div className="flex items-center gap-4 mb-6 pb-4 border-b-2 border-[#2C241B]/10 border-dashed">
                    <div className={`w-10 h-10 border-2 border-[#2C241B] ${story.avatarColor} flex items-center justify-center text-[#F9F4E8]`}><Globe size={18} /></div>
                    <div className="flex-1"><h3 className="font-serif font-black text-xl text-[#2C241B] uppercase tracking-wide leading-none mb-1" dir="auto">{story.title || "UNTITLED STORY"}</h3><div className="text-xs font-mono text-[#2C241B]/50 flex items-center gap-1 uppercase tracking-widest"><Clock size={12} /><span>{story.date}</span></div></div>
                  </div>
                  <p className="text-[#2C241B] text-lg leading-relaxed font-serif" dir="auto">{story.content}</p>
                  <div className="mt-8 pt-4 flex items-center justify-between border-t-2 border-[#2C241B]/5 border-dashed">
                    <button className="flex items-center gap-2 text-[#2C241B]/60 hover:text-[#8C4B4B] transition-colors text-sm font-bold uppercase tracking-wider group/btn"><Heart size={18} className="group-hover/btn:fill-current border-2 border-transparent" /><span className="font-mono">{story.likes} LIKES</span></button>
                    <button onClick={() => toggleTranslation(story.content)} className="flex items-center gap-2 text-[#2C241B]/60 hover:text-[#4A6C6F] transition-colors text-sm font-bold uppercase tracking-wider" title="Translate via Google"><Languages size={18} /><span className="font-mono hidden sm:inline">TRANSLATE</span></button>
                  </div>
                </div>
              ))
            )}
            <div className="py-12 text-center border-t-2 border-[#2C241B]/10 border-dashed mt-8">
              <p className="font-mono text-[#2C241B]/50 text-sm uppercase tracking-widest mb-4">-- END OF DAY --</p>
              <button onClick={() => setView('write')} className="text-[#C05636] font-black hover:underline uppercase tracking-widest text-sm">Add Your Story</button>
            </div>
          </div>
        )}
      </main>
      <Analytics />
    </div>
  );
}