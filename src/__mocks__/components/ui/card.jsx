// src/__mocks__/components/ui/card.jsx
export const Card = ({ children }) => (
    <div data-testid="card">{children}</div>
  );
  
  export const CardContent = ({ children, className }) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  );