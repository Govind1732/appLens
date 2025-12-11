// Signup Page for AppLens - Stunning Design with Framer Motion
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { Eye, EyeOff, Shield, Users, Rocket, CheckCircle } from 'lucide-react';
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

const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 }
};

function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const signupMutation = useMutation({
    mutationFn: (userData) => api.post('/api/auth/signup', userData),
    onSuccess: (data) => {
      const { user, token } = data;
      login(user, token);
      navigate('/dashboard');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    signupMutation.mutate({ name, email, password });
  };

  const benefits = [
    { icon: Shield, text: 'Enterprise-grade security' },
    { icon: Users, text: 'Team collaboration tools' },
    { icon: Rocket, text: 'Get started in minutes' },
    { icon: CheckCircle, text: 'No credit card required' }
  ];

  // Password strength indicator
  const getPasswordStrength = () => {
    if (password.length === 0) return { width: '0%', color: 'bg-slate-600', text: '' };
    if (password.length < 6) return { width: '25%', color: 'bg-red-500', text: 'Weak' };
    if (password.length < 8) return { width: '50%', color: 'bg-yellow-500', text: 'Fair' };
    if (password.length < 12) return { width: '75%', color: 'bg-blue-500', text: 'Good' };
    return { width: '100%', color: 'bg-green-500', text: 'Strong' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="relative flex min-h-screen w-full bg-slate-950 dark:bg-slate-950">
      <div className="flex h-full min-h-screen grow flex-col">
        <div className="flex flex-1">
          {/* Left Panel - Signup Form */}
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
                    <img src={logo} alt="AppLens Logo" className="" />
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AppLens</h1>
                </div>
              </motion.div>

              {/* Header */}
              <motion.div variants={fadeInUp} className="flex flex-col gap-2 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Create Your Account
                </h2>
                <p className="text-base text-slate-500 dark:text-slate-400">
                  Start your journey with powerful analytics.
                </p>
              </motion.div>

              {/* Form */}
              <motion.form variants={fadeInUp} onSubmit={handleSubmit} className="space-y-5">
                {/* Name Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="text-sm font-medium text-slate-800 dark:text-slate-300"
                  >
                    Full name
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    required
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-3 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>

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
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-3 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-800 dark:text-slate-300"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      required
                      minLength={6}
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

                  {/* Password Strength Indicator */}
                  {password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-2"
                    >
                      <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: passwordStrength.width }}
                          transition={{ duration: 0.3 }}
                          className={`h-full ${passwordStrength.color} rounded-full`}
                        />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Password strength: <span className={passwordStrength.color.replace('bg-', 'text-')}>{passwordStrength.text}</span>
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Error Message */}
                {signupMutation.isError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/50 rounded-lg px-4 py-3"
                  >
                    <p className="text-red-400 text-sm">
                      {signupMutation.error?.message || 'Signup failed. Please try again.'}
                    </p>
                  </motion.div>
                )}

                {/* Terms */}
                {/* <motion.p
                  variants={fadeInUp}
                  className="text-xs text-slate-500 dark:text-slate-400"
                >
                  By creating an account, you agree to our{' '}
                  <Link to="/terms" className="text-blue-500 hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-blue-500 hover:underline">Privacy Policy</Link>.
                </motion.p> */}

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 40px -10px rgba(59, 130, 246, 0.5)" }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={signupMutation.isPending}
                  className="relative flex w-full h-12 cursor-pointer items-center justify-center overflow-hidden rounded-lg px-5 bg-linear-to-r from-blue-500 to-blue-600 text-white text-base font-bold tracking-wide transition-all duration-300 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
                >
                  {signupMutation.isPending ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <span>Create Account</span>
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
                    Already have an account?
                  </span>
                </div>
              </motion.div>

              {/* Login Link */}
              <motion.div variants={fadeInUp} className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 font-medium text-blue-500 hover:text-blue-400 transition-colors group"
                >
                  <motion.span
                    className="inline-block"
                    animate={{ x: [0, -5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ←
                  </motion.span>
                  Sign in instead
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Panel - Branding */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={slideInRight}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative hidden w-1/2 flex-col items-center justify-center bg-slate-950 dark:bg-slate-950 p-12 lg:flex overflow-hidden"
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
                className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_800px_at_0%_200px,#15255a,transparent)]"
              />
              {/* Floating orbs */}
              <motion.div
                animate={{
                  y: [0, -30, 0],
                  x: [0, 15, 0],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"
              />
              <motion.div
                animate={{
                  y: [0, 25, 0],
                  x: [0, -10, 0],
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"
              />
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.15, 0.3, 0.15]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl"
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
                  whileHover={{ scale: 1.05, rotate: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex h-14 w-14 items-center justify-center rounded-xl shadow-lg"
                >
                  {/* <BarChart3 className="w-8 h-8 text-white" /> */}
                  <img src={logo} alt="AppLens Logo" className="w-12 h-12" />
                </motion.div>
                <h1 className="text-4xl font-bold text-white">AppLens</h1>
              </motion.div>

              {/* Tagline */}
              <motion.div variants={fadeInUp}>
                <h2 className="text-2xl font-bold text-white mb-3">
                  Start Your Analytics Journey
                </h2>
                <p className="text-lg leading-relaxed text-slate-400">
                  Join teams who trust AppLens to transform their data into actionable insights.
                </p>
              </motion.div>

              {/* Benefits */}
              <motion.div variants={fadeInUp} className="space-y-4 mt-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.text}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    // transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-blue-500/20 to-purple-500/20 border border-white/10">
                      <benefit.icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-base text-slate-300">{benefit.text}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Social Proof */}
              {/* <motion.div
                variants={fadeInUp}
                className="mt-6 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex -space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 + i * 0.1 }}
                        className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-purple-500 border-2 border-slate-100 dark:border-slate-900 flex items-center justify-center"
                      >
                        <span className="text-white text-xs font-medium">
                          {['JD', 'AK', 'MR', 'SL'][i]}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <motion.svg
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.2 + i * 0.05 }}
                        className="w-4 h-4 text-yellow-400 fill-current"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </motion.svg>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-400">
                  <span className="text-white font-semibold">10,000+</span> teams already using AppLens
                </p>
              </motion.div> */}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
