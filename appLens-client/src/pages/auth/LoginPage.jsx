import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { Eye, EyeOff, BarChart3, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { api } from '../../api/apiClient';
import { useAuthStore } from '../../stores/authStore';
import logo from '../../assets/icon2.png';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
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
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 }
};

const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0 }
};

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const loginMutation = useMutation({
    mutationFn: (credentials) => api.post('/api/auth/login', credentials),
    onSuccess: (data) => {
      const { user, token } = data;
      login(user, token);
      navigate('/dashboard');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  const features = [
    { icon: BarChart3, text: 'Real-time Analytics' },
    { icon: Sparkles, text: 'AI-Powered Insights' },
    { icon: TrendingUp, text: 'Performance Tracking' },
    { icon: Zap, text: 'Instant Reports' }
  ];

  return (
    <div className="relative flex min-h-screen w-full bg-slate-50 dark:bg-slate-950">
      <div className="flex h-full min-h-screen grow flex-col">
        <div className="flex flex-1">
          {/* Left Panel - Branding */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={slideInLeft}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative hidden w-1/2 flex-col items-center justify-center bg-slate-900 dark:bg-slate-900 p-12 lg:flex overflow-hidden"
          >
            {/* Animated Grid Background */}
            <div className="absolute inset-0 z-0">
              <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-size-[14px_24px]" />
              <motion.div
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%'],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'linear'
                }}
                className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_800px_at_100%_200px,#15255a,transparent)]"
              />
              {/* Floating orbs */}
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"
              />
              <motion.div
                animate={{
                  y: [0, 20, 0],
                  opacity: [0.2, 0.5, 0.2]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
              />
            </div>

            {/* Content */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="z-10 flex flex-col gap-8 text-left max-w-lg"
            >
              {/* Logo */}
              <motion.div variants={fadeInUp} className="flex items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex h-14 w-14 items-center justify-center rounded-xl shadow-lg"
                >
                  {/* <BarChart3 className="w-8 h-8 text-white" /> */}
                  <img src={logo} alt="logo" />
                </motion.div>
                <h1 className="text-4xl font-bold text-slate-50">AppLens</h1>
              </motion.div>

              {/* Tagline */}
              <motion.p variants={fadeInUp} className="text-xl leading-relaxed text-slate-400">
                Harness the power of AI to gain deep insights from your application data.
                Monitor, analyze, and optimize your app's performance with our comprehensive analytics dashboard.
              </motion.p>

              {/* Features */}
              <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-4 mt-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.text}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    // transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10"
                  >
                    <feature.icon className="w-5 h-5 text-blue-400" />
                    <span className="text-sm text-slate-300">{feature.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Panel - Login Form */}
          <div className="flex w-full flex-1 flex-col items-center justify-center p-4 sm:p-6 lg:w-1/2 bg-slate-50 dark:bg-slate-950">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="w-full max-w-md space-y-8"
            >
              {/* Mobile Logo */}
              <motion.div variants={scaleIn} className="flex justify-center lg:hidden mb-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl">
                    {/* <BarChart3 className="w-7 h-7 text-white" /> */}
                    <img src={logo} alt="AppLens Logo" className="w-12 h-12" />
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AppLens</h1>
                </div>
              </motion.div>

              {/* Header */}
              <motion.div variants={fadeInUp} className="flex flex-col gap-2 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Welcome Back
                </h2>
                <p className="text-base text-slate-500 dark:text-slate-400">
                  Sign in to manage your App Spaces and dashboards.
                </p>
              </motion.div>

              {/* Form */}
              <motion.form variants={fadeInUp} onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-slate-800 dark:text-slate-300"
                  >
                    Email address
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-3 bg-transparent text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-slate-800 dark:text-slate-300"
                    >
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-sm font-medium text-blue-500 hover:text-blue-400 hover:underline transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-3 pr-12 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center justify-center px-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </motion.button>
                  </div>
                </div>

                {/* Error Message */}
                {loginMutation.isError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/50 rounded-lg px-4 py-3"
                  >
                    <p className="text-red-400 text-sm">
                      {loginMutation.error?.message || 'Login failed. Please try again.'}
                    </p>
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 40px -10px rgba(59, 130, 246, 0.5)" }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="relative flex w-full h-12 cursor-pointer items-center justify-center overflow-hidden rounded-lg px-5 bg-linear-to-r from-blue-500 to-blue-600 text-white text-base font-bold tracking-wide transition-all duration-300 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
                >
                  {loginMutation.isPending ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <span>Sign in</span>
                  )}
                </motion.button>
              </motion.form>

              {/* Divider */}
              <motion.div variants={fadeInUp} className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400">
                    New to AppLens?
                  </span>
                </div>
              </motion.div>

              {/* Signup Link */}
              <motion.div variants={fadeInUp} className="text-center">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 font-medium text-blue-500 hover:text-blue-400 transition-colors group"
                >
                  Create an account
                  <motion.span
                    className="inline-block"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
