import React from 'react';

/**
 * ErrorBoundary - Capture les erreurs de l'interface
 * Affiche un message d'erreur gracieux au lieu de faire planter l'app
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="text-6xl">💥</div>
            <h2 className="text-2xl font-bold text-gray-900">Une erreur est survenue</h2>
            <p className="text-gray-600 max-w-md text-center">
              {this.state.error?.message || "Quelque chose de mal s'est produit. Veuillez réessayer."}
            </p>
            <button
              onClick={this.handleReset}
              className="mt-4 px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
            >
              Réessayer
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
