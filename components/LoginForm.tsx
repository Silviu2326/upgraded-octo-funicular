import React, { useState } from 'react';
import { ObsidianCard, ObsidianInput, ObsidianButton } from './ui/ObsidianElements';
import { Lock, Mail, ArrowRight, ShieldCheck, Activity, UserCircle } from 'lucide-react';
import type { LoginFormData } from '../types';

interface LoginFormProps {
  onLogin: (data: LoginFormData) => void;
  isLoading: boolean;
  error: string | null;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, isLoading, error }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({ email, pass });
  };

  const fillDemoCredentials = () => {
    setEmail('admin@obsidian.ai');
    setPass('123456');
  };

  const quickLogin = () => {
    onLogin({
      email: 'admin@obsidian.ai',
      pass: '123456'
    });
  };

  return (
    <div className="w-full max-w-[420px] relative z-10 px-4">
      {/* Decorative ambient background elements behind the card */}
      <div className="absolute -top-32 -left-20 w-64 h-64 bg-obsidian-accent/5 rounded-full blur-[100px] pointer-events-none opacity-50"></div>
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-[120px] pointer-events-none opacity-30"></div>

      <ObsidianCard className="p-10 md:p-12">
        {/* Header Section */}
        <div className="mb-12 text-center relative">
          <div className="inline-flex items-center gap-2 mb-6 border border-white/[0.08] bg-white/[0.02] px-3 py-1 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-obsidian-success shadow-[0_0_8px_#2ECC71]"></div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-obsidian-text-secondary font-medium">System Secure</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-thin text-white tracking-tight mb-3">
            Obsidian<span className="text-obsidian-text-muted">.</span>
          </h1>
          <p className="text-obsidian-text-muted text-xs font-light tracking-wide">
            ADVANCED CRM INTELLIGENCE
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <ObsidianInput
            label="Identity"
            type="email"
            placeholder="user@obsidian.ai"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={16} strokeWidth={1} />}
            required
          />

          <ObsidianInput
            label="Passkey"
            type="password"
            placeholder="••••••••••••"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            icon={<Lock size={16} strokeWidth={1} />}
            required
          />

          {error && (
            <div className="p-3 bg-red-500/5 border border-red-500/10 rounded flex items-center gap-3">
              <Activity size={14} className="text-red-400" />
              <span className="text-red-400/90 text-xs font-light tracking-wide">{error}</span>
            </div>
          )}

          <div className="pt-4">
            <ObsidianButton type="submit" isLoading={isLoading}>
              <span className="mr-2 uppercase tracking-[0.15em] text-[11px] font-medium">Authenticate</span>
              {!isLoading && <ArrowRight size={14} className="opacity-60" />}
            </ObsidianButton>
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/[0.04]">
             <a href="#" className="text-[10px] text-obsidian-text-muted hover:text-white transition-colors uppercase tracking-widest">
               Forgot Access?
             </a>
             <div className="flex items-center gap-1 text-obsidian-text-muted/40">
                <ShieldCheck size={12} strokeWidth={1} />
                <span className="text-[9px] uppercase tracking-widest">TLS 1.3 Encrypted</span>
             </div>
          </div>
        </form>
      </ObsidianCard>
      
      {/* Footer / Demo Link */}
      <div className="text-center mt-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
          <button
            type="button"
            onClick={quickLogin}
            disabled={isLoading}
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-obsidian-accent/10 border border-obsidian-accent/30 hover:bg-obsidian-accent/20 hover:border-obsidian-accent/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-obsidian-accent animate-pulse" />
            <span className="text-[10px] text-obsidian-accent group-hover:text-white font-medium tracking-widest uppercase">
              Acceso Rápido Demo
            </span>
            <ArrowRight size={12} className="text-obsidian-accent group-hover:text-white" />
          </button>

          <button
            type="button"
            onClick={fillDemoCredentials}
            disabled={isLoading}
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserCircle size={12} className="text-obsidian-text-muted group-hover:text-obsidian-accent transition-colors" />
            <span className="text-[9px] text-obsidian-text-muted group-hover:text-white font-medium tracking-widest uppercase">
              Llenar Credenciales
            </span>
          </button>
        </div>

        <p className="text-[10px] text-obsidian-text-muted/30 font-thin tracking-[0.3em]">
          V 2.0.4 — OBSIDIAN DARK UI
        </p>
      </div>
    </div>
  );
};

export default LoginForm;