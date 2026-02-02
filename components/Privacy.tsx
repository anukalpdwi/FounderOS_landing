import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, UserCheck, Globe, Bell, FileText, Scale, Mail, ArrowRight } from 'lucide-react';

interface PrivacyProps {
  onNavigate: (page: string) => void;
}

const Privacy: React.FC<PrivacyProps> = ({ onNavigate }) => {
  const lastUpdated = "February 2, 2025";
  
  const sections = [
    {
      id: "information-collection",
      icon: Database,
      title: "Information We Collect",
      content: [
        {
          subtitle: "Account Information",
          text: "When you create a FounderOS AI account, we collect your name, email address, company name, and other optional profile information you choose to provide."
        },
        {
          subtitle: "Usage Data",
          text: "We automatically collect information about how you interact with our platform, including pages visited, features used, actions taken, timestamps, and device information."
        },
        {
          subtitle: "Connected Services",
          text: "When you connect third-party services (social media accounts, email providers, CRM systems), we access and process data from those services as authorized by you."
        },
        {
          subtitle: "AI Agent Data",
          text: "Our AI agents process business data you provide, including marketing content, customer interactions, and operational workflows to deliver automated services."
        }
      ]
    },
    {
      id: "data-usage",
      icon: Eye,
      title: "How We Use Your Data",
      content: [
        {
          subtitle: "Service Delivery",
          text: "We use your data to power our AI agents, automate your business operations, generate content, manage your social media presence, and provide analytics."
        },
        {
          subtitle: "Platform Improvement",
          text: "We analyze aggregated and anonymized usage patterns to improve our AI models, develop new features, and enhance overall platform performance."
        },
        {
          subtitle: "Communication",
          text: "We may send you important updates about your account, service changes, security alerts, and with your consent, marketing communications."
        },
        {
          subtitle: "Legal Compliance",
          text: "We may use your data to comply with applicable laws, respond to legal requests, and protect our rights and the rights of our users."
        }
      ]
    },
    {
      id: "data-sharing",
      icon: Globe,
      title: "Data Sharing & Third Parties",
      content: [
        {
          subtitle: "Service Providers",
          text: "We work with trusted third-party providers for cloud hosting (Google Cloud, AWS), payment processing (Stripe), and analytics. These providers are contractually bound to protect your data."
        },
        {
          subtitle: "AI Model Providers",
          text: "We use AI services from providers like Google and OpenAI to power our agents. Data shared with these services is processed according to their privacy policies and our data processing agreements."
        },
        {
          subtitle: "Connected Platforms",
          text: "When you authorize connections to platforms like LinkedIn, Twitter/X, Instagram, or email services, data flows between FounderOS AI and these platforms as per your settings."
        },
        {
          subtitle: "We Never Sell Your Data",
          text: "We do not sell, rent, or trade your personal information to third parties for their marketing purposes. Your data is yours."
        }
      ]
    },
    {
      id: "data-security",
      icon: Lock,
      title: "Data Security",
      content: [
        {
          subtitle: "Encryption",
          text: "All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. API keys and sensitive credentials are encrypted with additional security layers."
        },
        {
          subtitle: "Access Controls",
          text: "We implement strict role-based access controls, multi-factor authentication for employees, and regular security audits to protect your data."
        },
        {
          subtitle: "Infrastructure Security",
          text: "Our infrastructure is hosted on enterprise-grade cloud platforms with SOC 2 Type II compliance, regular penetration testing, and 24/7 monitoring."
        },
        {
          subtitle: "Incident Response",
          text: "We maintain a comprehensive incident response plan. In the unlikely event of a data breach, we will notify affected users within 72 hours as required by applicable laws."
        }
      ]
    },
    {
      id: "your-rights",
      icon: UserCheck,
      title: "Your Rights & Choices",
      content: [
        {
          subtitle: "Access & Portability",
          text: "You have the right to access your personal data and request a copy in a portable format. Contact us to request your data export."
        },
        {
          subtitle: "Correction & Deletion",
          text: "You can update your account information at any time. You may also request deletion of your personal data, subject to legal retention requirements."
        },
        {
          subtitle: "Consent Withdrawal",
          text: "You can withdraw consent for data processing at any time by adjusting your settings, disconnecting services, or contacting our support team."
        },
        {
          subtitle: "Opt-Out Options",
          text: "You can opt out of marketing communications, disable certain data collection features, and manage your cookie preferences through our settings."
        }
      ]
    },
    {
      id: "data-retention",
      icon: FileText,
      title: "Data Retention",
      content: [
        {
          subtitle: "Active Accounts",
          text: "We retain your data for as long as your account is active and as needed to provide our services. Usage logs are typically retained for 90 days."
        },
        {
          subtitle: "Account Deletion",
          text: "Upon account deletion request, we remove your personal data within 30 days, except for data we're legally required to retain."
        },
        {
          subtitle: "Backup Retention",
          text: "Backup copies may persist for up to 90 days after deletion for disaster recovery purposes, after which they are permanently destroyed."
        }
      ]
    },
    {
      id: "cookies",
      icon: Bell,
      title: "Cookies & Tracking",
      content: [
        {
          subtitle: "Essential Cookies",
          text: "We use essential cookies to maintain your session, remember your preferences, and ensure core platform functionality."
        },
        {
          subtitle: "Analytics Cookies",
          text: "With your consent, we use analytics tools (Vercel Analytics, Google Analytics) to understand how users interact with our platform."
        },
        {
          subtitle: "Managing Cookies",
          text: "You can control cookies through your browser settings. Blocking essential cookies may impact platform functionality."
        }
      ]
    },
    {
      id: "international",
      icon: Globe,
      title: "International Data Transfers",
      content: [
        {
          subtitle: "Global Infrastructure",
          text: "FounderOS AI operates globally. Your data may be processed in countries outside your residence, including the United States and the European Union."
        },
        {
          subtitle: "Safeguards",
          text: "We implement appropriate safeguards for international data transfers, including Standard Contractual Clauses and compliance with applicable data protection frameworks."
        }
      ]
    },
    {
      id: "children",
      icon: Shield,
      title: "Children's Privacy",
      content: [
        {
          subtitle: "Age Requirement",
          text: "FounderOS AI is designed for business use and is not intended for individuals under 18 years of age. We do not knowingly collect data from minors."
        }
      ]
    },
    {
      id: "changes",
      icon: Scale,
      title: "Policy Updates",
      content: [
        {
          subtitle: "Notification",
          text: "We may update this Privacy Policy periodically. We will notify you of material changes via email or prominent notice on our platform at least 30 days before they take effect."
        },
        {
          subtitle: "Continued Use",
          text: "Your continued use of FounderOS AI after policy changes constitutes acceptance of the updated terms."
        }
      ]
    }
  ];

  const tableOfContents = sections.map(section => ({
    id: section.id,
    title: section.title
  }));

  return (
    <div className="pt-32 pb-20 bg-gray-50 dark:bg-black min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-emerald-100/50 to-transparent dark:from-emerald-900/10 pointer-events-none"></div>
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-brand-green/5 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          {/* Shield Icon with Animation */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="relative w-24 h-24 mx-auto mb-8"
          >
            <div className="absolute inset-0 bg-brand-green/20 blur-2xl rounded-full animate-pulse"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-brand-green to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-brand-green/20">
              <Shield className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          <div className="inline-block px-4 py-1.5 mb-6 border border-brand-green/30 bg-brand-green/5 rounded-full text-brand-green text-xs font-bold uppercase tracking-widest">
            Legal
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
            Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-emerald-600">&</span> Policy
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
            Your privacy matters. Here's everything you need to know about how FounderOS AI collects, uses, and protects your data.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
            Last updated: <span className="font-semibold text-gray-700 dark:text-gray-300">{lastUpdated}</span>
          </p>
        </motion.div>

        {/* Trust Badges */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4 mb-16"
        >
          {[
            { icon: Lock, label: "AES-256 Encrypted" },
            { icon: Shield, label: "GDPR Compliant" },
            { icon: UserCheck, label: "Your Data, Your Control" },
          ].map((badge, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/10 text-sm">
              <badge.icon className="w-4 h-4 text-brand-green" />
              <span className="text-gray-700 dark:text-gray-300 font-medium">{badge.label}</span>
            </div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-12">
          
          {/* Table of Contents - Sticky Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-32 bg-white dark:bg-[#0A0A0A] rounded-3xl border border-gray-200 dark:border-white/5 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg">Quick Navigation</h3>
              <nav className="space-y-2">
                {tableOfContents.map((item, i) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block text-sm text-gray-600 dark:text-gray-400 hover:text-brand-green dark:hover:text-brand-green transition-colors py-1.5 pl-3 border-l-2 border-transparent hover:border-brand-green"
                  >
                    {item.title}
                  </a>
                ))}
              </nav>
              
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/10">
                <a 
                  href="mailto:privacy@founderosai.com"
                  className="flex items-center gap-2 text-sm text-brand-green hover:text-emerald-600 transition-colors font-medium"
                >
                  <Mail className="w-4 h-4" />
                  Contact Privacy Team
                </a>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-12">
            
            {/* Introduction Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-brand-green/10 to-emerald-500/5 rounded-3xl p-8 border border-brand-green/20"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Commitment to Privacy</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                At FounderOS AI, we believe that privacy is a fundamental right. We've built our platform with privacy-by-design principles, ensuring your data is protected at every level. This policy explains our practices in plain language — no legal jargon.
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We're committed to transparency. If you have any questions about this policy or our practices, our team is always here to help.
              </p>
            </motion.div>

            {/* Policy Sections */}
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: index * 0.05 }}
                className="scroll-mt-32"
              >
                <div className="bg-white dark:bg-[#0A0A0A] rounded-3xl border border-gray-200 dark:border-white/5 p-8 shadow-sm hover:shadow-lg transition-shadow">
                  {/* Section Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <section.icon className="w-6 h-6 text-brand-green" />
                    </div>
                    <div>
                      <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                        Section {String(index + 1).padStart(2, '0')}
                      </span>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {section.title}
                      </h2>
                    </div>
                  </div>
                  
                  {/* Section Content */}
                  <div className="space-y-6 pl-0 md:pl-16">
                    {section.content.map((item, i) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-brand-green/50 to-transparent rounded-full hidden md:block"></div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">
                          {item.subtitle}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Contact Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-black dark:bg-white/5 rounded-3xl p-8 md:p-12 border border-gray-800 dark:border-white/10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-brand-green/20 blur-[100px] rounded-full pointer-events-none"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="w-8 h-8 text-brand-green" />
                  <h2 className="text-2xl font-bold text-white">Questions About Privacy?</h2>
                </div>
                <p className="text-gray-400 mb-8 max-w-2xl">
                  If you have any questions about this Privacy Policy, want to exercise your data rights, or need to report a privacy concern, we're here to help.
                </p>
                
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <h3 className="font-semibold text-white mb-2">Email Us</h3>
                    <a href="mailto:privacy@founderosai.com" className="text-brand-green hover:underline">
                      privacy@founderosai.com
                    </a>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <h3 className="font-semibold text-white mb-2">Data Protection Officer</h3>
                    <a href="mailto:dpo@founderosai.com" className="text-brand-green hover:underline">
                      dpo@founderosai.com
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center py-12"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to get started?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Join thousands of founders using FounderOS AI to scale their businesses.
              </p>
              <button
                onClick={() => onNavigate('waitlist')}
                className="inline-flex items-center gap-2 px-8 py-4 bg-brand-green text-black rounded-full font-bold text-lg hover:bg-[#00c272] transition-colors shadow-[0_0_30px_rgba(0,220,130,0.3)]"
              >
                Join the Waitlist <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
