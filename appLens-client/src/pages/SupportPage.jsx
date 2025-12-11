// Support page component
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Book, 
  Video, 
  Mail,
  Phone,
  ExternalLink,
  Search,
  ChevronDown,
  ChevronRight,
  Send,
  CheckCircle
} from 'lucide-react';

const SupportPage = () => {
  const [activeTab, setActiveTab] = useState('help');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [contactForm, setContactForm] = useState({
    subject: '',
    category: 'general',
    message: '',
    email: '',
    priority: 'medium'
  });

  const tabs = [
    { id: 'help', label: 'Help Center', icon: Book },
    { id: 'contact', label: 'Contact Us', icon: MessageSquare },
    // { id: 'resources', label: 'Resources', icon: Video }
  ];

  const faqs = [
    {
      id: 1,
      question: 'How do I upload a dataset?',
      answer: 'You can upload datasets by navigating to the Datasets page and clicking "Upload Dataset". We support CSV, JSON, and Excel files. You can also connect to external databases like PostgreSQL, MySQL, and MongoDB.'
    },
    {
      id: 2,
      question: 'What types of analytics can I generate?',
      answer: 'AppLens provides various analytics including summary statistics, correlation analysis, trend analysis, and AI-powered insights. You can also generate custom charts and visualizations.'
    },
    {
      id: 3,
      question: 'How do I create an AppSpace?',
      answer: 'AppSpaces help you organize your projects. Click "Create AppSpace" from the dashboard, provide a name and description, and start adding datasets and team members.'
    },
    {
      id: 4,
      question: 'Can I share my analytics with team members?',
      answer: 'Yes, you can invite team members to your AppSpace and control their permissions. They can view, edit, or manage datasets and analytics based on their assigned role.'
    },
    {
      id: 5,
      question: 'Is my data secure?',
      answer: 'Absolutely. We use enterprise-grade security with encryption at rest and in transit. Your data is stored securely and we never share it with third parties.'
    }
  ];

  const resources = [
    {
      title: 'Getting Started Guide',
      description: 'Learn the basics of AppLens and create your first analysis',
      type: 'Documentation',
      icon: Book,
      url: '#'
    },
    {
      title: 'Video Tutorials',
      description: 'Step-by-step video guides for common tasks',
      type: 'Video',
      icon: Video,
      url: '#'
    },
    {
      title: 'API Documentation',
      description: 'Technical documentation for API integration',
      type: 'API',
      icon: ExternalLink,
      url: '#'
    },
    {
      title: 'Best Practices',
      description: 'Tips and tricks for effective data analysis',
      type: 'Guide',
      icon: CheckCircle,
      url: '#'
    }
  ];

  const handleContactSubmit = (e) => {
    e.preventDefault();
    console.log('Contact form submitted:', contactForm);
    alert('Thank you for your message! We\'ll get back to you soon.');
  };

  const TabButton = ({ tab, isActive, onClick }) => (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(tab.id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer ${
        isActive 
          ? 'bg-blue-600 text-white' 
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
      }`}
    >
      <tab.icon className="w-4 h-4" />
      {tab.label}
    </motion.button>
  );

  const FaqItem = ({ faq }) => {
    const isExpanded = expandedFaq === faq.id;
    
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
      >
        <button
          onClick={() => setExpandedFaq(isExpanded ? null : faq.id)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors duration-200 cursor-pointer"
        >
          <h3 className="text-slate-900 dark:text-white font-medium">{faq.question}</h3>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          )}
        </button>
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 pb-4"
            >
              <p className="text-slate-600 dark:text-slate-400">{faq.answer}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
        {/* Tabs */}
        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <TabButton 
              key={tab.id} 
              tab={tab} 
              isActive={activeTab === tab.id}
              onClick={setActiveTab}
            />
          ))}
        </div>

        {/* Help Center */}
        {activeTab === 'help' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-600 dark:text-slate-400" />
              <input
                type="text"
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Quick Contact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center"
            >
              <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h3 className="text-slate-900 dark:text-white font-medium mb-2">Email Support</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">Get help via email</p>
              <a
                href="mailto:support@applens.com"
                className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-700 dark:hover:text-blue-300"
              >
                govind.d5578@gmail.com
              </a>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center"
            >
              <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h3 className="text-slate-900 dark:text-white font-medium mb-2">Live Chat</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">Chat with our team</p>
              <button className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-700 dark:hover:text-blue-300">
                Start Chat
              </button>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center"
            >
              <Phone className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h3 className="text-slate-900 dark:text-white font-medium mb-2">Phone Support</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">Call us directly</p>
              <a
                href="tel:+91 9985070132"
                className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-700 dark:hover:text-blue-300"
              >
                +91 9985070132
              </a>
            </motion.div>
          </div>

          {/* FAQ */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => (
                  <FaqItem key={faq.id} faq={faq} />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-600 dark:text-slate-400">No results found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

        {/* Contact Form */}
        {activeTab === 'contact' && (
          <div className="max-w-2xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6"
            >
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Contact Our Support Team</h2>
              
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-900 dark:text-white text-sm font-medium mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-900 dark:text-white text-sm font-medium mb-2">
                      Category
                    </label>
                    <select
                      value={contactForm.category}
                      onChange={(e) => setContactForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="general">General Question</option>
                      <option value="technical">Technical Issue</option>
                      <option value="billing">Billing Question</option>
                      <option value="feature">Feature Request</option>
                      <option value="bug">Bug Report</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-900 dark:text-white text-sm font-medium mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.subject}
                      onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Brief description of your issue"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-900 dark:text-white text-sm font-medium mb-2">
                      Priority
                    </label>
                    <select
                      value={contactForm.priority}
                      onChange={(e) => setContactForm(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-900 dark:text-white text-sm font-medium mb-2">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Please describe your issue in detail..."
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Resources */}
        {activeTab === 'resources' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resources.map((resource, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:border-blue-500/50 dark:hover:border-blue-400/50 transition-colors duration-200 group cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-lg group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors duration-200">
                    <resource.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-slate-900 dark:text-white font-medium mb-2">{resource.title}</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">{resource.description}</p>
                        <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-900 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">
                          {resource.type}
                        </span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-200" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
    </div>
  );
};

export default SupportPage;