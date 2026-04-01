import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export const useNavigationHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const prev = sessionStorage.getItem('currentPath');
    if (prev && prev !== location.pathname) {
      sessionStorage.setItem('previousPath', prev);
    }
    sessionStorage.setItem('currentPath', location.pathname);
  }, [location.pathname]);

  const goBack = () => {
    const previousPath = sessionStorage.getItem('previousPath');
    if (previousPath && previousPath !== window.location.pathname) {
      navigate(previousPath);
    } else {
      navigate('/');
    }
  };

  const navigateTo = (path) => {
    sessionStorage.setItem('previousPath', location.pathname);
    navigate(path);
  };

  return { goBack, navigateTo };
};
