# ErrorBoundary Component

An accessible error boundary component that provides proper error handling, focus management, and screen reader support.

## Usage

```tsx
import { ErrorBoundary } from '@/components/core/ErrorBoundary';

// Basic usage
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// With custom error messages
<ErrorBoundary
  errorTitle="Unable to Load Data"
  errorRetryText="Retry Loading"
>
  <DataComponent />
</ErrorBoundary>

// With custom fallback component
<ErrorBoundary
  fallback={({ error, reset }) => (
    <CustomErrorUI error={error} onRetry={reset} />
  )}
>
  <YourComponent />
</ErrorBoundary>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | required | The components to render |
| fallback | ComponentType<{ error: Error; reset: () => void }> | undefined | Custom error component |
| errorTitle | string | 'Er is iets misgegaan' | Error message title |
| errorRetryText | string | 'Probeer opnieuw' | Retry button text |

## Accessibility Features

### Error Announcements

The error UI is automatically announced to screen readers:

```tsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

Features:
- Uses `role="alert"` for immediate announcement
- Proper ARIA labeling relationships
- Clear error message structure
- Focus management on error

### Focus Management

Focus is automatically managed when errors occur:

```tsx
<ErrorBoundary>
  {/* When an error occurs, focus moves to the error message */}
  <ComponentThatMightError />
</ErrorBoundary>
```

Features:
- Automatic focus on error container
- Proper focus restoration on retry
- Keyboard navigation support
- Focus trap in error UI

### Error Recovery

Multiple recovery options are provided:

```tsx
<ErrorBoundary
  errorTitle="Failed to Load Profile"
  errorRetryText="Try Again"
>
  <ProfileComponent />
</ErrorBoundary>
```

Features:
- Primary retry button
- Page reload option
- Clear action descriptions
- Keyboard accessible controls

### Custom Error Components

Support for custom error UIs while maintaining accessibility:

```tsx
function CustomErrorFallback({ error, reset }) {
  return (
    <div 
      role="alert"
      aria-labelledby="custom-error-title"
      aria-describedby="custom-error-message"
      tabIndex={-1} // For focus management
    >
      <h2 id="custom-error-title">Custom Error UI</h2>
      <p id="custom-error-message">{error.message}</p>
      <button 
        onClick={reset}
        aria-label={`Retry after error: ${error.message}`}
      >
        Retry
      </button>
    </div>
  );
}

<ErrorBoundary fallback={CustomErrorFallback}>
  <YourComponent />
</ErrorBoundary>
```

## Best Practices

1. Error Messages
   ```tsx
   // Good - clear and actionable
   <ErrorBoundary
     errorTitle="Unable to Load Comments"
     errorRetryText="Reload Comments"
   >
     <Comments />
   </ErrorBoundary>

   // Bad - generic messages
   <ErrorBoundary
     errorTitle="Error"
     errorRetryText="Retry"
   >
     <Comments />
   </ErrorBoundary>
   ```

2. Focus Management
   ```tsx
   // Good - maintains focus management
   function CustomError({ error, reset }) {
     const errorRef = React.useRef(null);
     
     React.useEffect(() => {
       errorRef.current?.focus();
     }, []);

     return (
       <div ref={errorRef} tabIndex={-1}>
         {/* Error content */}
       </div>
     );
   }

   // Bad - ignores focus management
   function CustomError({ error, reset }) {
     return <div>{/* Error content */}</div>;
   }
   ```

3. ARIA Attributes
   ```tsx
   // Good - proper ARIA relationships
   function CustomError({ error, reset }) {
     return (
       <div
         role="alert"
         aria-labelledby="error-title"
         aria-describedby="error-message"
       >
         <h2 id="error-title">Error Title</h2>
         <p id="error-message">{error.message}</p>
       </div>
     );
   }

   // Bad - missing ARIA attributes
   function CustomError({ error, reset }) {
     return (
       <div>
         <h2>Error Title</h2>
         <p>{error.message}</p>
       </div>
     );
   }
   ```

4. Recovery Options
   ```tsx
   // Good - multiple recovery paths
   function CustomError({ error, reset }) {
     return (
       <div role="alert">
         <button onClick={reset}>Try Again</button>
         <button onClick={() => window.location.reload()}>
           Reload Page
         </button>
       </div>
     );
   }

   // Bad - limited recovery options
   function CustomError({ error, reset }) {
     return (
       <div role="alert">
         <button onClick={reset}>Retry</button>
       </div>
     );
   }
   ```

## Examples

### Form Submission Error

```tsx
function SubmitForm() {
  return (
    <ErrorBoundary
      errorTitle="Form Submission Failed"
      errorRetryText="Try Submitting Again"
    >
      <form>
        {/* Form fields */}
        <button type="submit">Submit</button>
      </form>
    </ErrorBoundary>
  );
}
```

### Data Loading Error

```tsx
function DataTable() {
  return (
    <ErrorBoundary
      errorTitle="Unable to Load Data"
      errorRetryText="Reload Data"
      fallback={({ error, reset }) => (
        <div role="alert" className="p-4 border-red-500 rounded">
          <h3>Data Loading Error</h3>
          <p>{error.message}</p>
          <div className="mt-4 space-x-2">
            <button onClick={reset}>
              Reload Data
            </button>
            <button onClick={() => window.location.reload()}>
              Refresh Page
            </button>
          </div>
        </div>
      )}
    >
      <Table data={data} />
    </ErrorBoundary>
  );
}
```

### Nested Error Boundaries

```tsx
function Dashboard() {
  return (
    <ErrorBoundary errorTitle="Dashboard Error">
      <div className="grid grid-cols-2 gap-4">
        {/* Each widget has its own error boundary */}
        <ErrorBoundary errorTitle="Revenue Widget Error">
          <RevenueWidget />
        </ErrorBoundary>
        <ErrorBoundary errorTitle="Users Widget Error">
          <UsersWidget />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
}