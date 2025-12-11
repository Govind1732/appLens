// WelcomePage - Marketing landing page for AppLens
import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  BarChart3,
  Sparkles,
  Users,
  Rocket,
  Database,
  MessageSquare,
  ArrowRight,
  Zap,
  Shield,
  Code2,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import ThemeToggle from '../components/common/ThemeToggle';
import logo from '../assets/icon2.png';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
};

// Header Component
function Header() {
  const navigate = useNavigate();

  return (
    <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
            {/* <BarChart3 className="w-5 h-5 text-white" /> */}
            <img src={logo} alt="logo" />
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">AppLens</span>
        </Link>

        {/* Right side navigation */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* How it works link - hidden on very small screens */}
          <a
            href="#how-it-works"
            className="hidden sm:block text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            How it works
          </a>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Login/Signup Button */}
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-blue-600/25 cursor-pointer"
          >
            <span>Login</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

// Hero Section
function HeroSection() {
  const navigate = useNavigate();

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="flex flex-col items-center text-center px-4 py-16 md:py-24"
    >
      {/* Badge */}
      <motion.div
        variants={fadeInUp}
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium mb-6"
      >
        <Sparkles className="w-3.5 h-3.5" />
        AI-Powered Analytics Platform
      </motion.div>

      {/* Title */}
      <motion.h1
        variants={fadeInUp}
        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-900 dark:text-white mb-4 max-w-4xl"
      >
        AppLens — AI dashboards for any app{' '}
        <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-purple-600">
          in minutes
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        variants={fadeInUp}
        className="text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-2xl text-center mb-8"
      >
        Instantly connect your data sources and let our AI generate the insights you need to grow.
        No complex setup, no SQL required.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        variants={fadeInUp}
        className="flex flex-wrap justify-center gap-4 mb-10"
      >
        <button
          onClick={() => navigate('/signup')}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-base font-bold rounded-lg transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 cursor-pointer"
        >
          Get Started Free
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Feature highlights */}
      <motion.div
        variants={fadeInUp}
        className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-slate-500 dark:text-slate-400"
      >
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-500" />
          <span>Connect CSV / JSON / databases</span>
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-purple-500" />
          <span>Auto-generated charts & KPIs</span>
        </div>
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-green-500" />
          <span>AI summaries & "ask your data" chat</span>
        </div>
      </motion.div>
    </motion.section>
  );
}

// Why AppLens Section
function WhyAppLensSection() {
  const features = [
    {
      icon: Rocket,
      title: 'For Founders',
      description: 'Get instant visibility into your app metrics without building complex dashboards from scratch.',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    {
      icon: Code2,
      title: 'For Developers',
      description: 'Skip weeks of dashboard development. Connect your database and let AI do the heavy lifting.',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      icon: Users,
      title: 'For Teams',
      description: 'Share insights across your organization with beautiful, auto-generated reports and dashboards.',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    }
  ];

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={staggerContainer}
      className="px-4 py-16 md:py-20"
    >
      <motion.div variants={fadeInUp} className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">
          Why AppLens?
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mx-auto">
          Built for modern teams who want insights, not infrastructure headaches.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            variants={scaleIn}
            transition={{ delay: index * 0.1 }}
            className="group bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-lg"
          >
            <div className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <feature.icon className={`w-6 h-6 ${feature.color}`} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

// How It Works Section
function HowItWorksSection() {
  const steps = [
    {
      number: '1',
      icon: Database,
      title: 'Connect Your Data',
      description: 'Link your databases, APIs, or upload CSV/JSON files in seconds.'
    },
    {
      number: '2',
      icon: BarChart3,
      title: 'Auto-Generate Dashboards',
      description: 'Our AI analyzes your data and creates beautiful charts and KPIs automatically.'
    },
    {
      number: '3',
      icon: Sparkles,
      title: 'Get AI Insights',
      description: 'Ask questions in plain English and get instant answers about your data.'
    }
  ];

  return (
    <motion.section
      id="how-it-works"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={staggerContainer}
      className="px-4 py-16 md:py-20 bg-slate-50 dark:bg-slate-900/50"
    >
      <motion.div variants={fadeInUp} className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">
          How AppLens Works
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          From raw data to actionable insights in three simple steps.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            variants={fadeInUp}
            transition={{ delay: index * 0.15 }}
            className="relative flex flex-col items-center text-center"
          >
            {/* Connector line (hidden on mobile and last item) */}
            {index < steps.length - 1 && (
              <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-linear-to-r from-blue-500/50 to-transparent" />
            )}

            {/* Step number */}
            <div className="relative mb-4">
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <step.icon className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-7 h-7 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center text-sm font-bold">
                {step.number}
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {step.title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

// Tech Stack Section
function TechStackSection() {
  const technologies = [
    { name: 'React', icon: '⚛️' },
    { name: 'Node.js', icon: '🟢' },
    { name: 'MongoDB', icon: '🍃' },
    { name: 'AI/ML', icon: '🤖' },
    { name: 'Real-time', icon: '⚡' }
  ];

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      className="px-4 py-12 border-t border-slate-200 dark:border-slate-800"
    >
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Built with modern technologies</p>
        <div className="flex flex-wrap justify-center gap-3">
          {technologies.map((tech) => (
            <div
              key={tech.name}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              <span>{tech.icon}</span>
              <span>{tech.name}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

// CTA Section
function CTASection() {
  const navigate = useNavigate();

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      className="px-4 py-16 md:py-20"
    >
      <div className="max-w-3xl mx-auto text-center bg-blue-600 rounded-3xl p-8 md:p-12 shadow-2xl shadow-blue-600/20">
        <Zap className="w-10 h-10 text-yellow-300 mx-auto mb-4" />
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
          Ready to unlock your data's potential?
        </h2>
        <p className="text-white mb-6 mx-auto">
          Join AppLens to make data-driven decisions faster.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-colors border border-white/20 cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </div>
    </motion.section>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <div className="w-5 h-5 bg-linear-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
            {/* <BarChart3 className="w-3 h-3 text-white" /> */}
            <img src={logo} alt="logo" />
          </div>
          <span>© 2025 AppLens. All rights reserved.</span>
        </div>
        {/* <div className="flex items-center gap-6 text-sm">
          <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            Terms
          </a>
          <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            Privacy
          </a>
          <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            Contact
          </a>
        </div> */}
      </div>
    </footer>
  );
}

// Main WelcomePage Component
function WelcomePage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Don't render if authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      <Header />

      <main className="flex-1 flex flex-col">
        <HeroSection />
        <WhyAppLensSection />
        <HowItWorksSection />
        <TechStackSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}

export default WelcomePage;
