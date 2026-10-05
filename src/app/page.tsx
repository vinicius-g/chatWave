import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/chat");

  return (
    <main className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Background animado com efeito aurora */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-gray-950 to-purple-950" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl animate-pulse delay-500" />
        {/* Grid de pontos decorativos */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #6366f1 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-sm">
            CW
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            ChatWave
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 shadow-lg shadow-indigo-500/25"
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-20 max-w-5xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-1.5 mb-8 text-sm text-indigo-300">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Real-time messaging platform
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold leading-tight mb-6">
          Connect.{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
            Chat.
          </span>{" "}
          <br />
          Belong.
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl leading-relaxed mb-10">
          Join thousands of people having real conversations in real time.
          ChatWave brings you closer to a community that actually listens.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link
            href="/register"
            className="group relative bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-8 py-4 rounded-full text-base font-bold transition-all duration-300 shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105"
          >
            Start chatting — it&apos;s free
            <span className="ml-2 group-hover:translate-x-1 inline-block transition-transform">→</span>
          </Link>
          <Link
            href="/login"
            className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-8 py-4 rounded-full text-base font-semibold transition-all duration-300 hover:scale-105"
          >
            Sign in to your account
          </Link>
        </div>

        {/* Preview do Chat (mockup decorativo) */}
        <div className="relative w-full max-w-2xl mx-auto float">
          <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/20 glow">
            {/* Barra de topo do mockup */}
            <div className="flex items-center gap-2 px-5 py-3 bg-gray-800/60 border-b border-white/5">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-3 text-xs text-gray-400 font-medium">ChatWave — Global Chat</span>
              <div className="ml-auto flex items-center gap-1.5 text-xs text-green-400">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                142 online
              </div>
            </div>
            {/* Mensagens exemplo */}
            <div className="p-5 space-y-4 text-left">
              {[
                { user: "Maria S.", msg: "Hey everyone! 👋 Just joined!", color: "from-pink-500 to-red-400" },
                { user: "Alex T.", msg: "Welcome Maria! This place is amazing 🔥", color: "from-blue-500 to-cyan-400" },
                { user: "Sam K.", msg: "ChatWave is honestly the best chat app I've used", color: "from-green-500 to-emerald-400" },
                { user: "You", msg: "Just discovered this too. The vibe here is incredible!", color: "from-indigo-500 to-purple-400", isYou: true },
              ].map((m, i) => (
                <div key={i} className={`flex items-start gap-3 ${m.isYou ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center text-xs font-bold shrink-0`}>
                    {m.user[0]}
                  </div>
                  <div className={`${m.isYou ? "items-end" : "items-start"} flex flex-col`}>
                    <span className="text-xs text-gray-500 mb-1">{m.user}</span>
                    <div className={`${m.isYou ? "bg-indigo-600/70" : "bg-white/5"} rounded-2xl ${m.isYou ? "rounded-tr-sm" : "rounded-tl-sm"} px-4 py-2 text-sm text-gray-100 max-w-xs`}>
                      {m.msg}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Input mockup */}
            <div className="px-5 pb-5">
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-500 flex items-center justify-between">
                <span>Type a message...</span>
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs">↵</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
        <h2 className="text-center text-4xl font-bold mb-4">
          Everything you need to{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            connect
          </span>
        </h2>
        <p className="text-center text-gray-400 mb-16 max-w-xl mx-auto">
          Built for speed, designed for community. ChatWave delivers a seamless experience from the first message.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: "⚡",
              title: "Real-Time Messaging",
              description: "Messages appear instantly via WebSocket technology. No refresh, no delay — just pure connection.",
              color: "from-yellow-500/20 to-orange-500/10",
              border: "border-yellow-500/20",
            },
            {
              icon: "👥",
              title: "See Who's Online",
              description: "Know who's active in the community at any given moment. Never feel like you're talking to an empty room.",
              color: "from-green-500/20 to-emerald-500/10",
              border: "border-green-500/20",
            },
            {
              icon: "🔒",
              title: "Secure Authentication",
              description: "Your account is protected with industry-standard encryption. Your identity, your privacy.",
              color: "from-blue-500/20 to-cyan-500/10",
              border: "border-blue-500/20",
            },
            {
              icon: "🛡️",
              title: "Safe Community",
              description: "Our moderation tools keep conversations healthy. Bad actors get banned instantly.",
              color: "from-red-500/20 to-rose-500/10",
              border: "border-red-500/20",
            },
            {
              icon: "📊",
              title: "Admin Dashboard",
              description: "Powerful analytics and user management right in your browser. Full visibility, full control.",
              color: "from-purple-500/20 to-violet-500/10",
              border: "border-purple-500/20",
            },
            {
              icon: "🌊",
              title: "Smooth Experience",
              description: "Beautifully designed interface that feels as natural as a face-to-face conversation.",
              color: "from-indigo-500/20 to-blue-500/10",
              border: "border-indigo-500/20",
            },
          ].map((f, i) => (
            <div
              key={i}
              className={`relative bg-gradient-to-br ${f.color} border ${f.border} rounded-2xl p-6 hover:scale-105 transition-all duration-300 group`}
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { value: "10K+", label: "Active Users" },
            { value: "1M+", label: "Messages Sent" },
            { value: "99.9%", label: "Uptime" },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-4xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
                {s.value}
              </div>
              <div className="text-gray-400 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="relative z-10 py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-3xl p-16">
          <h2 className="text-4xl font-extrabold mb-4">
            Ready to join the wave?
          </h2>
          <p className="text-gray-400 mb-8">
            Create a free account and start chatting in seconds.
          </p>
          <Link
            href="/register"
            className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-10 py-4 rounded-full text-lg font-bold shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-300"
          >
            Create My Account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-6 border-t border-white/5 text-center text-sm text-gray-600">
        <p>© 2026 ChatWave. Built with Next.js, Socket.IO & ❤️</p>
      </footer>
    </main>
  );
}
