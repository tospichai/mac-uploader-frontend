import { useState, useEffect } from "react";

interface UseModalAnimationProps {
  isOpen: boolean;
  onClose: () => void;
}

export function useModalAnimation({ isOpen, onClose }: UseModalAnimationProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [isFirstRender, setIsFirstRender] = useState(true);

  // Handle opening animation
  useEffect(() => {
    if (isOpen && isFirstRender) {
      const timer = setTimeout(() => setIsFirstRender(false), 0);
      return () => clearTimeout(timer);
    } else if (!isOpen) {
      const timer = setTimeout(() => setIsFirstRender(true), 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isFirstRender]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300); // Match transition duration
  };

  const getModalStyle = () => ({
    opacity: isClosing ? 0 : isOpen ? 1 : 0,
    transform: isClosing
      ? "scale(0.95) translateY(10px)"
      : isOpen
      ? isFirstRender
        ? "scale(0.95) translateY(10px)"
        : "scale(1) translateY(0)"
      : "scale(0.95) translateY(10px)",
  });

  const getBackdropStyle = () => ({
    opacity: isClosing ? 0 : isOpen ? 1 : 0,
  });

  return {
    isClosing,
    isFirstRender,
    handleClose,
    getModalStyle,
    getBackdropStyle,
  };
}