import React from "react";
import { SimpleIcon } from "simple-icons";

interface SimpleIconProps {
  icon: SimpleIcon;
  size?: number;
  className?: string;
}

const SimpleIconComponent: React.FC<SimpleIconProps> = ({
  icon,
  size = 20,
  className = "",
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      dangerouslySetInnerHTML={{ __html: icon.svg }}
    />
  );
};

export default SimpleIconComponent;
