import Link from "next/link";
import { ArrowRight, Camera, Clock, Shield, Wrench, Zap, Star, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/layout/footer";

const features = [
  {
    icon: Camera,
    title: "AI Analýza fotografií",
    description: "Vyfotografujte závadu a AI ji okamžitě identifikuje s 95% přesností.",
  },
  {
    icon: Wrench,
    title: "500+ návodů",
    description: "Rozsáhlá databáze oprav s detailními postupy krok za krokem.",
  },
  {
    icon: Shield,
    title: "Bezpečnostní varování",
    description: "Každý návod obsahuje důležitá bezpečnostní upozornění.",
  },
  {
    icon: Clock,
    title: "Úspora času i peněz",
    description: "Průměrně ušetříte 1000 Kč na každé opravě ve srovnání s řemeslníkem.",
  },
];

const stats = [
  { value: "500+", label: "Návodů na opravy" },
  { value: "30s", label: "Průměrný čas analýzy" },
  { value: "95%", label: "Přesnost AI" },
  { value: "10k+", label: "Spokojených uživatelů" },
];

const testimonials = [
  {
    quote: "FIXO mi ušetřilo 2000 Kč za instalatéra. Opravil jsem kapající kohoutek sám za 15 minut!",
    author: "Jan K.",
    role: "Praha",
    rating: 5,
  },
  {
    quote: "Konečně aplikace, která mi pomůže s drobnými opravami. Návody jsou srozumitelné i pro začátečníky.",
    author: "Marie S.",
    role: "Brno",
    rating: 5,
  },
  {
    quote: "Jako správce bytového domu používám FIXO denně. Skvělá databáze oprav.",
    author: "Petr V.",
    role: "Ostrava",
    rating: 5,
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-lg">
        <nav className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-bold text-xl shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
              F
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">FIXO</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/pricing" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
              Ceník
            </Link>
            <Link href="/about" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
              O nás
            </Link>
            <Button className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all" asChild>
              <Link href="/dashboard">
                Spustit aplikaci
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <Button size="sm" className="md:hidden bg-gradient-to-r from-indigo-500 to-indigo-600 text-white" asChild>
            <Link href="/dashboard">Spustit</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 text-white min-h-[90vh] flex items-center">
          {/* Animated background elements */}
          <div className="absolute inset-0 hero-pattern" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-400/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-amber-400/10 to-transparent rounded-full blur-3xl" />

          <div className="container relative py-24 md:py-36">
            <div className="mx-auto max-w-4xl text-center">
              {/* Badge */}
              <div className="animate-slide-down inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
                <Zap className="h-4 w-4 text-yellow-300" />
                <span className="text-sm font-medium">AI-powered diagnostika za 30 sekund</span>
              </div>

              <h1 className="animate-slide-up text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
                Opravte cokoliv.
                <br />
                <span className="bg-gradient-to-r from-teal-300 via-amber-200 to-indigo-300 bg-clip-text text-transparent">Kdekoliv. Okamžitě.</span>
              </h1>

              <p className="animate-slide-up mt-8 text-xl leading-8 text-indigo-100 max-w-2xl mx-auto" style={{ animationDelay: "0.1s" }}>
                Vyfotografujte zavadu a AI vam okamzite poradi, jak ji opravit.
                Usetrete tisice korun na remeslnicich.
              </p>

              <div className="animate-slide-up mt-12 flex flex-col sm:flex-row items-center justify-center gap-4" style={{ animationDelay: "0.2s" }}>
                <Button size="xl" className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-semibold hover:from-amber-300 hover:to-amber-400 shadow-xl hover:shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 hover:-translate-y-1 border-0" asChild>
                  <Link href="/dashboard">
                    <Camera className="mr-2 h-5 w-5" />
                    Vyfotit závadu
                  </Link>
                </Button>
                <Button size="xl" variant="outline" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm hover:border-white/50 transition-all duration-300" asChild>
                  <Link href="/dashboard/repairs">
                    Prohlédnout databázi
                  </Link>
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="animate-slide-up mt-16 flex flex-wrap items-center justify-center gap-8 text-indigo-200 text-sm" style={{ animationDelay: "0.3s" }}>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-teal-400" />
                  <span>Zdarma k vyzkoušení</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-teal-400" />
                  <span>Bezpečnostní varování</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-400" />
                  <span>10 000+ uživatelů</span>
                </div>
              </div>
            </div>
          </div>

          {/* Wave divider */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
              <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
            </svg>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-b bg-muted/50 py-8">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-fixo-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 md:py-32">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center mb-20">
              <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700 mb-4">
                Funkce
              </span>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Proč si vybrat FIXO?
              </h2>
              <p className="mt-6 text-lg text-muted-foreground">
                Vše, co potřebujete pro úspěšné domácí opravy, na jednom místě.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 stagger-children">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="text-center group hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-2 hover:border-indigo-200 bg-gradient-to-b from-white to-slate-50/50">
                    <CardContent className="pt-8 pb-6">
                      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-teal-100 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                        <Icon className="h-8 w-8 text-indigo-600" />
                      </div>
                      <h3 className="font-bold text-lg">{feature.title}</h3>
                      <p className="mt-3 text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-gradient-to-b from-slate-50 to-white py-24 md:py-32">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center mb-20">
              <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-teal-100 text-teal-700 mb-4">
                Jak to funguje
              </span>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                3 jednoduché kroky
              </h2>
              <p className="mt-6 text-lg text-muted-foreground">
                Od fotografie k opravě za pár minut.
              </p>
            </div>
            <div className="relative">
              {/* Connection line - desktop only */}
              <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-indigo-400 via-teal-400 to-amber-400" />

              <div className="grid gap-12 md:gap-8 md:grid-cols-3">
                {[
                  { step: 1, title: "Vyfoťte závadu", description: "Nahrajte fotografii poškozeného předmětu nebo místa.", icon: Camera, color: "from-indigo-500 to-indigo-600" },
                  { step: 2, title: "AI analyzuje", description: "Umělá inteligence identifikuje problém během sekund.", icon: Zap, color: "from-teal-500 to-teal-600" },
                  { step: 3, title: "Opravte sami", description: "Postupujte podle detailního návodu krok za krokem.", icon: Wrench, color: "from-amber-500 to-amber-600" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.step} className="relative text-center group">
                      <div className={`relative z-10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                        <Icon className="h-10 w-10" />
                        <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md border-2 border-slate-200 text-slate-700 font-bold text-sm">
                          {item.step}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold">{item.title}</h3>
                      <p className="mt-3 text-muted-foreground max-w-xs mx-auto">{item.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 md:py-28">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Co říkají uživatelé
              </h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.author}>
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                    <div className="mt-4">
                      <div className="font-semibold">{testimonial.author}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 py-20">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-teal-400 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-400 rounded-full blur-3xl" />
          </div>

          <div className="container relative text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Připraveni začít opravovat?
            </h2>
            <p className="text-indigo-200 mb-8 max-w-xl mx-auto text-lg">
              Přidejte se k tisícům spokojených uživatelů, kteří již ušetřili na řemeslnících.
            </p>
            <Button size="xl" className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-semibold hover:from-amber-300 hover:to-amber-400 shadow-xl hover:shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 hover:-translate-y-1" asChild>
              <Link href="/dashboard">
                Spustit FIXO zdarma
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
