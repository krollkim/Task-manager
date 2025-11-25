import './App.css';
import AppRouter from './components/AppRouter';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <div className="App">
      <ErrorBoundary>
        <AppRouter />
      </ErrorBoundary>
    </div>
  );
}

export default App;
