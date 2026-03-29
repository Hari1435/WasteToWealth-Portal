import { useLoading } from '../context/LoadingContext';

export const useApiWithLoading = () => {
  const { setIsLoading, setLoadingMessage } = useLoading();

  const callWithLoading = async (apiCall, loadingMessage = 'Loading...') => {
    try {
      setIsLoading(true);
      setLoadingMessage(loadingMessage);
      const result = await apiCall();
      return result;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const showLoading = (message = 'Loading...') => {
    setIsLoading(true);
    setLoadingMessage(message);
  };

  const updateLoadingMessage = (message) => {
    setLoadingMessage(message);
  };

  const hideLoading = () => {
    setIsLoading(false);
  };

  return { callWithLoading, showLoading, updateLoadingMessage, hideLoading };
};

export default useApiWithLoading;