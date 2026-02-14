import React from 'react';

interface CustomToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const CustomToggle: React.FC<CustomToggleProps> = ({ checked, onChange }) => (
  <label className="relative inline-block w-[3.5em] h-[2em] text-[14px]">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="opacity-0 w-0 h-0"
    />
    <span
      className={`absolute cursor-pointer inset-0 rounded-[30px] transition-all duration-300 border ${
        checked
          ? 'bg-primary border-primary'
          : 'bg-white border-[hsl(var(--muted-foreground)/0.4)] dark:bg-muted'
      }`}
    >
      <span
        className={`absolute h-[1.4em] w-[1.4em] rounded-[20px] left-[0.27em] bottom-[0.25em] transition-all duration-300 ${
          checked
            ? 'translate-x-[1.4em] bg-white'
            : 'bg-[hsl(var(--muted-foreground)/0.5)]'
        }`}
      />
    </span>
  </label>
);

export { CustomToggle };
