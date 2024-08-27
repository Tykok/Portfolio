import React, { ReactNode,useContext, useState } from 'react';

type LangContextType = {
  lang: string;
  setLang: (lang: string) => void;
};

const LangContext = React.createContext<LangContextType>({
  lang: 'fr',
  setLang: () => {}
});

const LangProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<string>('fr');

  const handleSetLang = (newLang: string) => {
    setLang(newLang);
  };

  return (
    <LangContext.Provider value={{ lang, setLang: handleSetLang }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);
export default LangProvider;