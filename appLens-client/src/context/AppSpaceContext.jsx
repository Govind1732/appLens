// AppSpaceContext: current appSpace selection (optional)
import React, { createContext, useState } from 'react';

export const AppSpaceContext = createContext();

export const AppSpaceProvider = ({ children }) => {
  const [currentAppSpace, setCurrentAppSpace] = useState(null);

  return (
    <AppSpaceContext.Provider value={{ currentAppSpace, setCurrentAppSpace }}>
      {children}
    </AppSpaceContext.Provider>
  );
};
