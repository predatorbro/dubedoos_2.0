"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles, NotebookPen, Timer, Wand2, Lock, Calendar } from "lucide-react";
import BadgeButton from "@/components/ui/badge-button";
import Link from 'next/link';

export default function LandingPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-black text-neutral-800 dark:text-neutral-100">
      {/* Hero Section */}
      <header className="w-full text-center px-4 min-h-svh flex flex-col justify-center">
        <div className="relative inline-block w-fit mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"
          >
            du-be-doos
          </motion.h1>
          <motion.div
            initial={{ x: 0, y: -10, rotate: 0 }}
            animate={{
              x: [0, 10, -10, 5, -5, 0],
              y: [-10, -15, -5, -20, -10, -10],
              rotate: [0, 10, -10, 5, -5, 0]
            }}
            transition={{
              repeat: Infinity,
              duration: 4,
              ease: "easeInOut"
            }}
            className="absolute top-0 right-0"
          >
            <Sparkles className="text-yellow-400 w-6 h-6" />
          </motion.div>

        </div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mt-6 text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"
        >
          <BadgeButton> Now with AI Integration </BadgeButton>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-3 text-lg md:text-xl max-w-2xl mx-auto text-neutral-600 dark:text-neutral-300"
        >
          A minimalist note-taking app that clears the clutter of your mind and boosts your productivity with{" "}
          <span className="font-semibold">Quickees</span>, <span className="font-semibold">AI Magic Buttons</span>,
          and <span className="font-semibold">Deadline Tracking</span>.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex justify-center gap-4"
        >
          <Link href="/login">
            <Button size="lg" className="rounded-full px-6 text-lg" >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg" className="rounded-full px-6 text-lg">
                How it works
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">How du-be-doos Works ?</DialogTitle>
              </DialogHeader>
              <ul className="list-disc pl-5 space-y-2 text-neutral-700 dark:text-neutral-300">
                <li>✨ Double-click on a Quickee to enhance it</li>
                <li>🔮 Use Magic Buttons to improve your notes</li>
                <li>📸 Notes supports uploading images too</li>
                <li>📌 Secure notes with password</li>
                <li>📅 Click a date to save notes for that day</li>
                <li>⏳ Track project deadlines with reminders</li>
                <li>📝 Save and manage your favourite links</li>
              </ul>
            </DialogContent>
          </Dialog>
        </motion.div>
      </header>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6 py-20">
        {[
          {
            title: "Quickees",
            desc: "Capture thoughts instantly and enhance with a double click.",
            icon: NotebookPen,
          },
          {
            title: "AI Magic",
            desc: "Enhance, rewrite, and organize notes with AI magic buttons.",
            icon: Wand2,
          },
          {
            title: "Secure Notes",
            desc: "Protect your notes with a password.",
            icon: Lock,
          },
          {
            title: "Smart Calendar",
            desc: "Save notes for specific dates for easy organization.",
            icon: Calendar,
          },
          {
            title: "Deadlines",
            desc: "Track time left for projects and never miss a deadline again.",
            icon: Timer,
          },
          {
            title: "Upload Images",
            desc: "Add images to your notes to make them more meaningful.",
            icon: Timer,
          },
        ].map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="shadow-lg hover:shadow-xl transition rounded-2xl h-full bg-white dark:bg-neutral-900">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <f.icon className="w-12 h-12 text-purple-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-neutral-600 dark:text-neutral-400">{f.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>

      {/* CTA Section */}
      <section className="text-center py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl font-bold"
        >
          Ready to clear your mind clutter?
        </motion.h2>
        <p className="mt-4 text-lg opacity-90">Start using du-be-doos today and make productivity effortless.</p>
        <Link href="/login">
          <Button size="lg" variant="secondary" className="mt-6 rounded-full px-8">
            Start Now <Sparkles className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-sm text-neutral-500 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-800">
        <p>© {new Date().getFullYear()} du-be-doos. All rights reserved.</p>
      </footer>
    </div>
  );
}
