import React, { createContext, useContext, useState } from 'react';

const UserFlowContext = createContext();

export const UserFlowProvider = ({ children }) => {
  const [hasProceeded, setHasProceeded] = useState(false);

  return (
    <UserFlowContext.Provider value={{ hasProceeded, setHasProceeded }}>
      {children}
    </UserFlowContext.Provider>
  );
};

export const useUserFlow = () => useContext(UserFlowContext);
