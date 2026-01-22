import React, { createContext, useContext, useState } from 'react';
import { tokens } from '../tokens/design-tokens';

interface ThemeContextProps {
  theme: typeof tokens;
  setTheme: React.Dispatch<React.SetStateAction<typeof tokens>>;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: tokens,
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState(tokens);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);