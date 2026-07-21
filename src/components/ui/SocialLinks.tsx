import React from "react";
import { GitBranch, Users, Globe, MessageCircle } from "lucide-react";

export default function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <a
        href="https://github.com/LingkonDash"
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="link"
        className="p-3 rounded-full bg-background-elevated/80 border border-border hover:border-accent/40 text-muted hover:text-accent transition-all duration-300 shadow-md hover:scale-105 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
        aria-label="GitHub"
      >
        <GitBranch size={20} />
      </a>
      <a
        href="https://www.linkedin.com/in/lingkon-dash/"
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="link"
        className="p-3 rounded-full bg-background-elevated/80 border border-border hover:border-accent/40 text-muted hover:text-accent transition-all duration-300 shadow-md hover:scale-105 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
        aria-label="LinkedIn"
      >
        <Users size={20} />
      </a>
      <a
        href="https://www.facebook.com/lingkon.dash.2025"
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="link"
        className="p-3 rounded-full bg-background-elevated/80 border border-border hover:border-accent/40 text-muted hover:text-accent transition-all duration-300 shadow-md hover:scale-105 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
        aria-label="Facebook"
      >
        <Globe size={20} />
      </a>
      <a
        href="https://wa.me/8801776572194"
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="link"
        className="p-3 rounded-full bg-background-elevated/80 border border-border hover:border-accent/40 text-muted hover:text-accent transition-all duration-300 shadow-md hover:scale-105 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
        aria-label="WhatsApp"
      >
        <MessageCircle size={20} />
      </a>
    </div>
  );
}
