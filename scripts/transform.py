import os

def update_file(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

app_tsx_replacements = [
    ('min-h-screen bg-[#0A0A0A] text-[#E4E3E0]', 'min-h-screen bg-brutal-yellow text-black font-sans selection:bg-brutal-pink selection:text-black'),
    ('fixed inset-0 grid-overlay -z-10 opacity-50', 'fixed inset-0 pointer-events-none -z-10 opacity-10 bg-[url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDIwaDQwTTIwIDB2NDAiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+")]'),
    ('technical-card', 'brutal-card'),
    ('bg-[#1E1F23]/50', 'bg-white'),
    ('border-[#2A2B2E]', 'border-black'),
    ('border-indigo-500/30', 'border-black'),
    ('border-indigo-500/20', 'border-black'),
    ('bg-[#151619]', 'bg-white'),
    ('bg-indigo-500/10', 'bg-brutal-pink/20'),
    ('bg-emerald-500/10', 'bg-brutal-green/20'),
    ('bg-amber-500/10', 'bg-brutal-orange/20'),
    ('bg-[#0A0A0A]', 'bg-white'),
    ('text-white', 'text-black'),
    ('text-[#8E9299]', 'text-black/70 font-bold'),
    ('text-indigo-400', 'text-brutal-blue'),
    ('text-emerald-400', 'text-brutal-green'),
    ('text-emerald-500', 'text-brutal-green'),
    ('text-amber-500', 'text-brutal-orange'),
    ('bg-indigo-500', 'bg-brutal-blue text-white'),
    ('bg-indigo-600', 'bg-brutal-pink'),
    ('shadow-2xl shadow-indigo-500/5', 'brutal-shadow'),
    ('shadow-[0_0_10px_rgba(99,102,241,0.5)]', ''),
    ('shadow-[0_0_15px_rgba(99,102,241,0.5)]', ''),
    ('shadow-[0_0_25px_rgba(79,70,229,0.4)]', 'brutal-shadow'),
    ('border-l-4 border-indigo-500', 'border-l-8 border-brutal-pink'),
    ('mono-label', 'font-mono text-[10px] md:text-xs uppercase tracking-widest text-black font-black bg-white px-2 py-1 border-2 border-black inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-2'),
    ('text-5xl font-black tracking-tighter leading-[0.95] mb-6', 'text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-6 uppercase font-display bg-white px-4 py-2 border-4 border-black brutal-shadow inline-block'),
    ('rounded-xl', 'rounded-none'),
    ('rounded-2xl', 'rounded-none'),
    ('rounded-lg', 'rounded-none'),
    ('bg-white text-black px-6 py-3 rounded-none font-bold text-xs uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all active:scale-95 shadow-xl shadow-white/5', 'bg-brutal-pink text-black px-6 py-3 font-bold text-sm uppercase tracking-widest brutal-btn'),
    ('border border-[#2A2B2E] text-white px-6 py-3 rounded-none font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all', 'bg-white text-black px-6 py-3 font-bold text-sm uppercase tracking-widest brutal-btn'),
    ('w-full bg-[#0A0A0A] border border-[#2A2B2E] rounded-none px-24 py-6 font-black text-xl focus:border-indigo-500 outline-none transition-all placeholder:text-[#2A2B2E]', 'w-full bg-white border-4 border-black px-24 py-6 font-black text-2xl focus:border-brutal-blue outline-none transition-all placeholder:text-black/30 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'),
    ('w-full bg-white text-black py-6 rounded-none font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3', 'w-full bg-brutal-blue text-white py-6 font-bold uppercase tracking-widest text-xl flex items-center justify-center gap-3 brutal-btn'),
    ('w-full bg-indigo-600 text-white py-6 rounded-none font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 shadow-xl', 'w-full bg-brutal-pink text-black py-6 font-bold uppercase tracking-widest text-xl flex items-center justify-center gap-3 brutal-btn'),
    ('border-2 border-dashed border-[#2A2B2E]', 'border-4 border-black bg-white brutal-shadow'),
    ('border-b border-[#2A2B2E]', 'border-b-4 border-black'),
    ('border-t border-[#2A2B2E]', 'border-t-4 border-black'),
    ('text-3xl font-black text-white', 'text-4xl font-black text-black font-display uppercase'),
    ('text-4xl font-black text-white', 'text-5xl font-black text-black font-display uppercase'),
    ('text-6xl font-black text-white', 'text-7xl font-black text-black font-display uppercase'),
    ('bg-[#151619] border border-[#2A2B2E] rounded-none overflow-hidden shadow-2xl', 'brutal-card'),
]

update_file('d:/l5/l5/src/App.tsx', app_tsx_replacements)

navbar_replacements = [
    ('bg-[#0A0A0A]/90 backdrop-blur-xl border-[#2A2B2E] shadow-2xl', 'bg-brutal-yellow border-black border-b-4 brutal-shadow'),
    ('text-[#8E9299]', 'text-black font-bold'),
    ('hover:text-white', 'hover:text-brutal-blue'),
    ('group-hover:text-indigo-400', 'group-hover:text-brutal-pink'),
    ('text-white', 'text-black'),
    ('border-[#2A2B2E]', 'border-black'),
    ('border-[#2A2B2E]/50', 'border-black'),
    ('bg-[#2A2B2E]/50', 'bg-white brutal-btn p-2'),
    ('border border-amber-500/30 text-amber-500 text-[9px] font-bold uppercase tracking-widest hover:bg-amber-500/10 transition-all font-mono', 'bg-white text-black px-4 py-2 text-xs font-bold uppercase tracking-widest font-mono brutal-btn'),
    ('group relative flex items-center gap-2 bg-indigo-600 px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest text-white transition-all shadow-[0_0_25px_rgba(79,70,229,0.4)]', 'group relative flex items-center gap-2 bg-brutal-pink px-6 py-3 font-bold text-sm uppercase tracking-widest text-black brutal-btn'),
    ('border-2 border-indigo-500/30 shadow-2xl shadow-indigo-500/20', 'border-4 border-black brutal-shadow'),
    ('w-16 h-16', 'w-16 h-16 bg-white'),
]

update_file('d:/l5/l5/src/components/Navbar.tsx', navbar_replacements)
