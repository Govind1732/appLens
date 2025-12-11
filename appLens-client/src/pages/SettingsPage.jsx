// Settings page component
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Bell, 
  Shield, 
  Database,
  Palette,
  Globe,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

// Helper components moved outside to avoid recreating during render
const SectionButton = ({ section, isActive, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => onClick(section.id)}
    className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-colors duration-200 cursor-pointer ${
      isActive 
        ? 'bg-blue-600 text-white' 
        : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
    }`}
  >
    <section.icon className="w-5 h-5" />
    {section.label}
  </motion.button>
);

const InputField = ({ label, type = 'text', value, onChange, placeholder, required = false }) => (
  <div>
    <label className="block text-slate-900 dark:text-slate-100 text-sm font-medium mb-2">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
);

const ToggleSwitch = ({ label, checked, onChange, description }) => (
  <div className="flex items-start justify-between">
    <div className="flex-1">
      <h3 className="text-slate-900 dark:text-slate-100 font-medium">{label}</h3>
      {description && <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
        checked ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-slate-900 dark:text-slate-100 text-sm font-medium mb-2">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const { user } = useAuthStore();
  
  // Get initial theme from localStorage or default to light
  const getInitialTheme = () => {
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        return savedTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  };
  
  const [settings, setSettings] = useState({
    // Profile settings
    name: user?.name || 'User',
    email: user?.email || 'User@example.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    
    // Notification settings
    emailNotifications: true,
    pushNotifications: false,
    analyticsAlerts: true,
    weeklyReports: true,
    
    // Security settings
    twoFactorAuth: false,
    sessionTimeout: '30',
    
    // Data settings
    dataRetention: '90',
    autoBackup: true,
    
    // Appearance settings
    theme: getInitialTheme(),
  });

  // Sync theme on mount and when localStorage changes
  useEffect(() => {
    const syncTheme = () => {
      const savedTheme = localStorage.getItem('theme') || 'light';
      const root = document.documentElement;
      
      if (savedTheme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      } else if (savedTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      setSettings(prev => ({ ...prev, theme: savedTheme }));
    };

    syncTheme();
  }, []);

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    // { id: 'notifications', label: 'Notifications', icon: Bell },
    // { id: 'security', label: 'Security', icon: Shield },
    // { id: 'data', label: 'Data', icon: Database },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    // { id: 'general', label: 'General', icon: Globe }
  ];

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    
    // If theme is being changed, apply it immediately
    if (field === 'theme') {
      const root = document.documentElement;
      const body = document.body;
      
      // Remove existing class first
      root.classList.remove('dark');
      
      if (value === 'system') {
        // Use system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          root.classList.add('dark');
        }
        localStorage.setItem('theme', 'system');
      } else if (value === 'dark') {
        root.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        localStorage.setItem('theme', 'light');
      }
      
      // Force a repaint by triggering reflow
      void body.offsetHeight;
    }
  };

  const handleSave = () => {
    console.log('Settings saved:', settings);
    // TODO: Implement API call to save settings
  };

  return (
    <div className="space-y-8">
        {/* Save Button */}
        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <nav className="space-y-2">
                {sections.map((section) => (
                  <SectionButton
                    key={section.id}
                    section={section}
                    isActive={activeSection === section.id}
                    onClick={setActiveSection}
                  />
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={activeSection}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6"
            >
              {/* Profile Settings */}
              {activeSection === 'profile' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Profile Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Full Name"
                      value={settings.name}
                      onChange={(value) => handleInputChange('name', value)}
                      placeholder="Enter your full name"
                      required
                    />
                    <InputField
                      label="Email Address"
                      type="email"
                      value={settings.email}
                      onChange={(value) => handleInputChange('email', value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div className="relative">
                        <InputField
                          label="Current Password"
                          type={showPassword ? 'text' : 'password'}
                          value={settings.currentPassword}
                          onChange={(value) => handleInputChange('currentPassword', value)}
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                          label="New Password"
                          type="password"
                          value={settings.newPassword}
                          onChange={(value) => handleInputChange('newPassword', value)}
                          placeholder="Enter new password"
                        />
                        <InputField
                          label="Confirm Password"
                          type="password"
                          value={settings.confirmPassword}
                          onChange={(value) => handleInputChange('confirmPassword', value)}
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeSection === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Notification Settings</h2>
                  
                  <div className="space-y-4">
                    <ToggleSwitch
                      label="Email Notifications"
                      description="Receive notifications via email"
                      checked={settings.emailNotifications}
                      onChange={(value) => handleInputChange('emailNotifications', value)}
                    />
                    <ToggleSwitch
                      label="Push Notifications"
                      description="Receive push notifications in your browser"
                      checked={settings.pushNotifications}
                      onChange={(value) => handleInputChange('pushNotifications', value)}
                    />
                    <ToggleSwitch
                      label="Analytics Alerts"
                      description="Get notified about important data insights"
                      checked={settings.analyticsAlerts}
                      onChange={(value) => handleInputChange('analyticsAlerts', value)}
                    />
                    <ToggleSwitch
                      label="Weekly Reports"
                      description="Receive weekly analytics summaries"
                      checked={settings.weeklyReports}
                      onChange={(value) => handleInputChange('weeklyReports', value)}
                    />
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeSection === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Security Settings</h2>
                  
                  <div className="space-y-6">
                    <ToggleSwitch
                      label="Two-Factor Authentication"
                      description="Add an extra layer of security to your account"
                      checked={settings.twoFactorAuth}
                      onChange={(value) => handleInputChange('twoFactorAuth', value)}
                    />
                    
                    <SelectField
                      label="Session Timeout"
                      value={settings.sessionTimeout}
                      onChange={(value) => handleInputChange('sessionTimeout', value)}
                      options={[
                        { value: '15', label: '15 minutes' },
                        { value: '30', label: '30 minutes' },
                        { value: '60', label: '1 hour' },
                        { value: '120', label: '2 hours' },
                        { value: 'never', label: 'Never' }
                      ]}
                    />
                  </div>
                </div>
              )}

              {/* Data Settings */}
              {activeSection === 'data' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Data Settings</h2>
                  
                  <div className="space-y-6">
                    <SelectField
                      label="Data Retention Period"
                      value={settings.dataRetention}
                      onChange={(value) => handleInputChange('dataRetention', value)}
                      options={[
                        { value: '30', label: '30 days' },
                        { value: '90', label: '90 days' },
                        { value: '180', label: '6 months' },
                        { value: '365', label: '1 year' },
                        { value: 'unlimited', label: 'Unlimited' }
                      ]}
                    />
                    
                    <ToggleSwitch
                      label="Automatic Backup"
                      description="Automatically backup your data daily"
                      checked={settings.autoBackup}
                      onChange={(value) => handleInputChange('autoBackup', value)}
                    />
                  </div>
                </div>
              )}

              {/* Appearance Settings */}
              {activeSection === 'appearance' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Appearance Settings</h2>
                  
                  <div className="space-y-6">
                    <SelectField
                      label="Theme"
                      value={settings.theme}
                      onChange={(value) => handleInputChange('theme', value)}
                      options={[
                        { value: 'dark', label: 'Dark' },
                        { value: 'light', label: 'Light' },
                        { value: 'system', label: 'System' }
                      ]}
                    />
                    
                    {/* <SelectField
                      label="Language"
                      value={settings.language}
                      onChange={(value) => handleInputChange('language', value)}
                      options={[
                        { value: 'en', label: 'English' },
                        { value: 'es', label: 'Spanish' },
                        { value: 'fr', label: 'French' },
                        { value: 'de', label: 'German' }
                      ]}
                    /> */}
                  </div>
                </div>
              )}

              {/* General Settings */}
              {activeSection === 'general' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">General Settings</h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    General application settings will be available here.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
  );
};

export default SettingsPage;