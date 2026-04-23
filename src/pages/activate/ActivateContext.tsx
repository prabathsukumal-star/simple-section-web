import { createContext, useContext, useState, type ReactNode } from 'react';

export type ActivateData = {
  identifier: string;
  token: string;
  fullName: string;
  phone: string;
  password: string;
  avatarUrl: string;
};

type ActivateContextType = {
  data: ActivateData;
  update: (patch: Partial<ActivateData>) => void;
  reset: () => void;
};

const empty: ActivateData = {
  identifier: '', token: '', fullName: '', phone: '', password: '', avatarUrl: '',
};

const Ctx = createContext<ActivateContextType>({ data: empty, update: () => {}, reset: () => {} });

export function ActivateProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ActivateData>(empty);
  const update = (patch: Partial<ActivateData>) => setData(d => ({ ...d, ...patch }));
  const reset = () => setData(empty);
  return <Ctx.Provider value={{ data, update, reset }}>{children}</Ctx.Provider>;
}

export const useActivate = () => useContext(Ctx);