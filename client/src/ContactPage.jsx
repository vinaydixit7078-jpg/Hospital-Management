import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const contactInfos = [
  {
    title: 'Hospital Address',
    value: '123 Health Ave, Wellness City, USA',
    icon: (
      <svg className="h-6 w-6 text-cyan-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 21s7-4.35 7-10a7 7 0 10-14 0c0 5.65 7 10 7 10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 11a2 2 0 100-4 2 2 0 000 4z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    title: 'Phone Number',
    value: '+1 (555) 123-4567',
    icon: (
      <svg className="h-6 w-6 text-cyan-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.86 19.86 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.86 19.86 0 01-3.07-8.63A2 2 0 014.11 2h3a2 2 0 012 1.72c.12.81.33 1.6.61 2.35a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.72-1.72a2 2 0 012.11-.45c.75.28 1.54.49 2.35.61a2 2 0 011.72 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: 'Emergency Helpline',
    value: '+1 (555) 911-9111',
    icon: (
      <svg className="h-6 w-6 text-cyan-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M12 7v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M12 15h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: 'Email Address',
    value: 'help@cityhospital.com',
    icon: (
      <svg className="h-6 w-6 text-cyan-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 5h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22 7l-10 7L2 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: 'Working Hours',
    value: 'Mon–Sun: 24 hours',
    icon: (
      <svg className="h-6 w-6 text-cyan-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 12a9 9 0 11-9-9 9 9 0 019 9z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: 'Ambulance Service',
    value: '+1 (555) 222-1212',
    icon: (
      <svg className="h-6 w-6 text-cyan-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 11h1v7a2 2 0 002 2h12a2 2 0 002-2v-7h1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 7V4H8v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18 11H6v-2h12v2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 19h.01M17 19h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
];

const departmentContacts = [
  { name: 'Cardiology', phone: '+1 (555) 201-0101' },
  { name: 'Neurology', phone: '+1 (555) 202-0202' },
  { name: 'Orthopedics', phone: '+1 (555) 203-0303' },
  { name: 'Pediatrics', phone: '+1 (555) 204-0404' },
  { name: 'Emergency', phone: '+1 (555) 205-0505' },
  { name: 'Pharmacy', phone: '+1 (555) 206-0606' },
  { name: 'Laboratory', phone: '+1 (555) 207-0707' },
  { name: 'Billing', phone: '+1 (555) 208-0808' },
];

const faqs = [
  {
    question: 'How can I book an appointment?',
    answer: 'You can book an appointment through our website using the booking form, or call our helpline for immediate scheduling.',
  },
  {
    question: 'What are the hospital timings?',
    answer: 'We are open 24/7 for emergency services. Our outpatient clinic operates from 8:00 AM to 8:00 PM daily.',
  },
  {
    question: 'Do you provide emergency services?',
    answer: 'Yes, our emergency department is available 24/7 with a dedicated trauma and ambulance team.',
  },
  {
    question: 'How can I download my reports?',
    answer: 'Reports can be downloaded from your patient dashboard once you log in. Contact support if you need assistance.',
  },
  {
    question: 'How can I contact a doctor?',
    answer: 'You can request a consultation through the contact form or use the direct department phone numbers for urgent doctor referrals.',
  },
];

const socials = [
  { name: 'Facebook', href: '#', icon: 'f' },
  { name: 'Instagram', href: '#', icon: 'i' },
  { name: 'Twitter', href: '#', icon: 't' },
  { name: 'LinkedIn', href: '#', icon: 'in' },
  { name: 'YouTube', href: '#', icon: 'y' },
];

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

function FAQItem({ question, answer, isOpen, onClick }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-lg shadow-slate-950/20">
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-sm font-semibold text-slate-100 transition hover:bg-slate-900/70"
      >
        <span>{question}</span>
        <span className="text-cyan-300">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && <div className="border-t border-slate-800 px-5 py-4 text-sm text-slate-400">{answer}</div>}
    </div>
  );
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(faqs[0].question);

  const validate = () => {
    const validation = {};
    if (!form.name.trim()) validation.name = 'Full name is required.';
    if (!form.email.trim()) {
      validation.email = 'Email is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      validation.email = 'Enter a valid email address.';
    }
    if (!form.phone.trim()) validation.phone = 'Phone number is required.';
    if (!form.subject.trim()) validation.subject = 'Subject is required.';
    if (!form.message.trim()) validation.message = 'Message cannot be empty.';
    return validation;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      setFeedback('Please complete all fields before sending.');
      setStatus('error');
      return;
    }

    setSubmitting(true);
    setStatus('');
    setFeedback('');

    try {
      await api.post('/contact', form);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      setErrors({});
      setStatus('success');
      setFeedback('Your message has been sent successfully. Our team will contact you soon.');
    } catch (error) {
      setStatus('error');
      setFeedback(error.response?.data?.message || 'Unable to send your message. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.12),transparent_30%)] pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 overflow-hidden rounded-[2rem] border border-slate-800/70 bg-slate-900/85 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300 shadow-sm shadow-cyan-500/10">
                Contact City Hospital
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Reach out to our care team anytime.</h1>
                <Link
                  to="/"
                  className="rounded-full border border-slate-700/70 bg-slate-900/90 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-400/40 hover:bg-slate-900"
                >
                  Home
                </Link>
              </div>
              <p className="max-w-2xl text-lg text-slate-400">Whether you need appointment support, emergency assistance, or medical guidance, our hospital team is ready to answer your questions and provide expert care.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-5 shadow-lg shadow-slate-950/20">
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300 shadow-inner shadow-cyan-500/10">🏥</div>
                  <p className="text-sm text-slate-400">Dedicated care managers, fast response, and compassionate support at every step.</p>
                </div>
                <div className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-5 shadow-lg shadow-slate-950/20">
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-300 shadow-inner shadow-teal-500/10">💬</div>
                  <p className="text-sm text-slate-400">Send us a message and we&apos;ll respond as soon as possible with the right hospital support.</p>
                </div>
              </div>
            </div>
            <div className="rounded-[1.75rem] border border-slate-800/80 bg-slate-950/95 p-8 shadow-2xl shadow-slate-950/30">
              <div className="flex items-center gap-4 rounded-3xl bg-slate-900/80 p-5">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500 to-cyan-400 text-xl text-white shadow-lg shadow-cyan-500/20">✚</div>
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Trusted health support</p>
                  <p className="mt-1 text-xl font-semibold text-white">Premium hospital assistance</p>
                </div>
              </div>
              <p className="mt-6 text-slate-400">Our contact desk is staffed with experienced coordinators who connect you to the right department and help simplify your visit.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[0.95fr_0.9fr]">
          <div className="grid gap-5 sm:grid-cols-2">
            {contactInfos.map((item) => (
              <div key={item.title} className="rounded-[2rem] border border-slate-800/80 bg-slate-900/80 p-6 shadow-lg shadow-slate-950/20 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-cyan-400/40">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-950/70 text-white shadow-inner shadow-cyan-500/10">{item.icon}</div>
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm text-slate-400">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-[2rem] border border-slate-800/80 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Contact form</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">Send a message to our team</h2>
              </div>
              <div className="inline-flex rounded-3xl bg-slate-950/80 px-4 py-2 text-sm font-medium text-slate-200">Fast Response</div>
            </div>

            {feedback && (
              <div className={`mb-5 rounded-3xl px-4 py-3 text-sm ${status === 'success' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'}`}>
                {feedback}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Full Name</span>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                    placeholder="Jane Doe"
                  />
                  {errors.name && <span className="text-sm text-rose-400">{errors.name}</span>}
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Email Address</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                    placeholder="jane@example.com"
                  />
                  {errors.email && <span className="text-sm text-rose-400">{errors.email}</span>}
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Phone Number</span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.phone && <span className="text-sm text-rose-400">{errors.phone}</span>}
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Subject</span>
                  <input
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                    placeholder="Appointment inquiry"
                  />
                  {errors.subject && <span className="text-sm text-rose-400">{errors.subject}</span>}
                </label>
              </div>

              <label className="space-y-2 text-sm text-slate-300">
                <span>Message</span>
                <textarea
                  rows="5"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-4 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  placeholder="Describe how we can help you..."
                />
                {errors.message && <span className="text-sm text-rose-400">{errors.message}</span>}
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition duration-300 hover:-translate-y-0.5 hover:shadow-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-300/50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-10 grid gap-8 xl:grid-cols-[0.95fr_0.85fr]">
          <div className="rounded-[2rem] border border-slate-800/80 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
            <h2 className="text-xl font-semibold text-white">Find us on the map</h2>
            <p className="mt-3 text-sm text-slate-400">Visit our hospital location for appointments, consultations, or emergency care.</p>
            <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-slate-800 bg-slate-950/80 shadow-inner shadow-slate-950/20">
              <iframe
                title="Hospital Location"
                className="h-96 w-full border-0"
                loading="lazy"
                src="https://maps.google.com/maps?q=City%20Hospital%20Wellness%20City&t=&z=13&ie=UTF8&iwloc=&output=embed"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-800/80 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
              <h2 className="text-xl font-semibold text-white">Departments & emergency numbers</h2>
              <p className="mt-3 text-sm text-slate-400">Direct contacts for specialist departments and urgent support.</p>
              <div className="mt-6 grid gap-3">
                {departmentContacts.map((department) => (
                  <div key={department.name} className="rounded-3xl border border-slate-800/70 bg-slate-950/90 p-4 transition hover:border-cyan-400/40 hover:bg-slate-900/70">
                    <div className="flex items-center justify-between gap-4 text-sm text-slate-300">
                      <span className="font-medium text-white">{department.name}</span>
                      <span className="rounded-full bg-slate-900/80 px-3 py-1 text-xs text-cyan-300">{department.phone}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-800/80 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
              <h2 className="text-xl font-semibold text-white">Follow our updates</h2>
              <p className="mt-3 text-sm text-slate-400">Stay connected with hospital news, events, and health tips.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {socials.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-3xl border border-slate-800/70 bg-slate-950/90 px-4 py-3 text-sm text-slate-200 transition hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-slate-900/70"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-900 text-cyan-300 text-sm font-semibold">{social.icon}</span>
                    {social.name}
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-800/80 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
              <h2 className="text-xl font-semibold text-white">Frequently asked questions</h2>
              <div className="mt-6 space-y-3">
                {faqs.map((item) => (
                  <FAQItem
                    key={item.question}
                    question={item.question}
                    answer={item.answer}
                    isOpen={openFAQ === item.question}
                    onClick={() => setOpenFAQ(openFAQ === item.question ? '' : item.question)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => alert('Live chat is coming soon! Please call +1 (555) 123-4567 for immediate support.')}
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-2xl shadow-cyan-500/25 transition duration-300 hover:-translate-y-0.5 hover:shadow-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
      >
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-xl">💬</span>
        Chat with Us
      </button>
    </div>
  );
}
