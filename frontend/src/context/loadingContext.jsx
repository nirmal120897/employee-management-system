import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

const LoadingContext = createContext();

// axios.js React tree ke bahar hai, isliye ek module-level reference rakhte hai
// taaki wahan se bhi loader trigger kar sake bina hooks use kiye.
let externalLoader = { showLoader: () => {}, hideLoader: () => {} };

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const countRef = useRef(0); // kitni requests abhi pending hain

  const showLoader = useCallback(() => {
    countRef.current += 1;
    setLoading(true);
  }, []);

  const hideLoader = useCallback(() => {
    countRef.current = Math.max(0, countRef.current - 1);
    if (countRef.current === 0) setLoading(false);
  }, []);

  useEffect(() => {
    externalLoader = { showLoader, hideLoader };
  }, [showLoader, hideLoader]);

  return (
    <LoadingContext.Provider value={{ loading, showLoader, hideLoader }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const UseLoading = () => useContext(LoadingContext);

export const ShowGlobalLoader = () => externalLoader.showLoader();
export const HideGlobalLoader = () => externalLoader.hideLoader();