import { useState } from 'react';

export function useGuestPrompt() {
  const [isOpen, setIsOpen] = useState(false);
  const [promptConfig, setPromptConfig] = useState({
    feature: 'profile' as 'favorites' | 'profile' | 'reviews' | 'notifications',
    title: '',
    description: ''
  });

  const showPrompt = (
    feature: 'favorites' | 'profile' | 'reviews' | 'notifications',
    title: string,
    description: string
  ) => {
    setPromptConfig({ feature, title, description });
    setIsOpen(true);
  };

  const hidePrompt = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    promptConfig,
    showPrompt,
    hidePrompt
  };
}