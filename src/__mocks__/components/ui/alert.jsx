// src/__mocks__/components/ui/alert.jsx
export const Alert = ({ children, className }) => (
    <div data-testid="alert" className={className}>
      {children}
    </div>
  );
  
  export const AlertDescription = ({ children }) => (
    <div data-testid="alert-description">{children}</div>
  );