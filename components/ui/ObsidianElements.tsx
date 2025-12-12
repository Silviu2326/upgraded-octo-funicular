import React from 'react';

// --- Obsidian Card (War Room Spec) ---
// Features: Backdrop blur, inner top highlight, deep drop shadow, breathing border capability
export const ObsidianCard: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  noPadding?: boolean;
  active?: boolean; // If true, border glows purple
}> = ({
  children,
  className = "",
  noPadding = false,
  active = false,
}) => {
  return (
    <div
      className={`
        bg-[#0F0F12]/80 
        backdrop-blur-[10px] 
        border 
        rounded-lg 
        relative 
        overflow-hidden
        transition-all duration-[2000ms]
        shadow-obsidian-deep
        ${active ? 'border-obsidian-accent/60 shadow-obsidian-glow' : 'border-white/[0.06]'}
        ${className}
      `}
      style={{
        // The specific "Inner Glow" from the spec
        boxShadow: active 
          ? '0 20px 40px -10px rgba(0,0,0,0.8), inset 0 1px 0 0 rgba(106, 79, 251, 0.3)' 
          : '0 20px 40px -10px rgba(0,0,0,0.8), inset 0 1px 0 0 rgba(255,255,255,0.05)'
      }}
    >
      <div className={`${noPadding ? '' : 'p-6'} relative z-10 h-full`}>
        {children}
      </div>
    </div>
  );
};

// --- Obsidian Input ---
interface ObsidianInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

export const ObsidianInput: React.FC<ObsidianInputProps> = ({ label, icon, className, ...props }) => {
  return (
    <div className={`group space-y-2 ${className}`}>
      {label && (
        <label className="block text-[11px] uppercase tracking-[0.2em] text-obsidian-text-muted font-medium ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-obsidian-text-muted/50 group-focus-within:text-white/60 transition-colors duration-300">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full 
            bg-[#0B0B0D]/50 
            text-obsidian-text-primary 
            font-light 
            text-sm 
            placeholder-obsidian-text-muted/30
            border border-white/[0.08] 
            rounded-md 
            py-3.5 
            ${icon ? 'pl-11' : 'pl-4'} 
            pr-4 
            outline-none 
            transition-all 
            duration-300
            focus:border-white/[0.15] 
            focus:bg-[#111114]
            focus:shadow-[0_0_15px_rgba(255,255,255,0.03)]
          `}
          {...props}
        />
      </div>
    </div>
  );
};

// --- Obsidian Button ---
interface ObsidianButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
}

export const ObsidianButton: React.FC<ObsidianButtonProps> = ({
  children,
  variant = 'primary',
  isLoading,
  className,
  ...props
}) => {
  const baseStyles = "w-full py-3.5 rounded-md text-sm font-light tracking-wide transition-all duration-300 flex items-center justify-center relative overflow-hidden";
  
  const variants = {
    primary: `
      bg-white/[0.03] 
      hover:bg-white/[0.06] 
      border border-white/[0.1] 
      text-white 
      hover:border-white/[0.2]
      shadow-lg
    `,
    secondary: `
      bg-transparent 
      text-obsidian-text-muted 
      hover:text-white 
      border border-transparent
    `,
    outline: `
      border border-white/[0.2]
      text-white
      font-medium
      tracking-widest
      hover:bg-white
      hover:text-black
      hover:border-white
      text-[11px]
      uppercase
    `
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-white/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="font-extralight tracking-widest text-xs uppercase">Processing</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

// --- Obsidian Slider (Precision Fader) ---
interface ObsidianSliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  valueDisplay?: string | number;
}

export const ObsidianSlider: React.FC<ObsidianSliderProps> = ({ label, valueDisplay, className, ...props }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex justify-between items-end">
        <label className="text-[10px] uppercase tracking-[0.2em] text-obsidian-text-muted font-medium">
          {label}
        </label>
        <span className="font-mono text-xs text-white">{valueDisplay}</span>
      </div>
      <div className="relative h-6 flex items-center group">
        <input
          type="range"
          className="
            appearance-none w-full h-[1px] bg-obsidian-text-muted/30 rounded-none outline-none 
            [&::-webkit-slider-thumb]:appearance-none 
            [&::-webkit-slider-thumb]:w-3 
            [&::-webkit-slider-thumb]:h-5 
            [&::-webkit-slider-thumb]:bg-[#16161A] 
            [&::-webkit-slider-thumb]:border 
            [&::-webkit-slider-thumb]:border-white/40 
            [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,255,255,0.2)] 
            [&::-webkit-slider-thumb]:cursor-pointer 
            [&::-webkit-slider-thumb]:transition-all
            group-hover:[&::-webkit-slider-thumb]:border-white
            group-hover:[&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(255,255,255,0.4)]
          "
          {...props}
        />
      </div>
    </div>
  );
};

// --- Obsidian Switch (Environment Toggle) ---
interface ObsidianSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const ObsidianSwitch: React.FC<ObsidianSwitchProps> = ({ label, checked, onChange }) => {
  return (
    <div 
      className="flex items-center justify-between cursor-pointer group py-2"
      onClick={() => onChange(!checked)}
    >
      <span className={`text-xs font-light transition-colors ${checked ? 'text-white' : 'text-obsidian-text-muted'}`}>
        {label}
      </span>
      <div className={`
        w-8 h-4 rounded-full border border-white/[0.1] relative transition-colors duration-300
        ${checked ? 'bg-obsidian-accent/20 border-obsidian-accent/50' : 'bg-transparent'}
      `}>
        <div className={`
          absolute top-[2px] w-2.5 h-2.5 rounded-full shadow-sm transition-all duration-300
          ${checked ? 'left-[18px] bg-obsidian-accent shadow-[0_0_8px_#6A4FFB]' : 'left-[3px] bg-obsidian-text-muted/50'}
        `} />
      </div>
    </div>
  );
};
