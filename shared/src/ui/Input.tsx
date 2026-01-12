/**
 * @package @microfrontends/shared/ui
 * @description Переиспользуемый input
 */

import React from 'react';
import { classNames } from '../utils/helpers';
import { Colors, Borders, Spacing } from '../constants/design-tokens';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Метка поля
   */
  label?: string;
  
  /**
   * Текст ошибки
   */
  error?: string;
  
  /**
   * Текст подсказки
   */
  helperText?: string;
  
  /**
   * Полная ширина
   */
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  fullWidth = false,
  className,
  ...props
}) => {
  const hasError = Boolean(error);

  const wrapperStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: Spacing[2],
    width: fullWidth ? '100%' : 'auto',
  };

  const labelStyles: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 500,
    color: Colors.text.primary,
  };

  const inputStyles: React.CSSProperties = {
    padding: `${Spacing[2]} ${Spacing[3]}`,
    fontSize: '16px',
    border: `2px solid ${hasError ? Colors.error[500] : Colors.gray[300]}`,
    borderRadius: Borders.radius.base,
    outline: 'none',
    transition: 'all 0.3s ease',
    width: '100%',
  };

  const helperStyles: React.CSSProperties = {
    fontSize: '12px',
    color: hasError ? Colors.error[500] : Colors.text.secondary,
  };

  return (
    <div style={wrapperStyles} className={classNames('shared-input-wrapper', className)}>
      {label && <label style={labelStyles}>{label}</label>}
      <input style={inputStyles} {...props} />
      {(error || helperText) && (
        <span style={helperStyles}>{error || helperText}</span>
      )}
    </div>
  );
};


