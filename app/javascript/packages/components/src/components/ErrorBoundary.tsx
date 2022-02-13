import React from 'react';
import I18n from '../../../../src/shared/FakeI18n';
import styled from '@emotion/styled';
import tw from 'twin.macro';

type Props = {
  variant?: string;
};

type State = {
  hasError: boolean;
};

const Svg = styled.svg`
  ${tw`h-5 w-5 text-red-400`}
`;

const ErrorBoundaryContainer = styled.div`
  ${tw`rounded-md bg-red-50 p-4 m-2`}
  .flex {
    ${tw`flex`}
  }
  .flex-shrink-0 {
    ${tw`flex-shrink-0`}
  }
  .text {
    ${tw`text-sm font-medium text-red-800`}
  }
  .ml-3 {
    ${tw`ml-3`}
  }
`;

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error) {
    // Actualiza el estado para que el siguiente renderizado muestre la interfaz de repuesto
    return { hasError: true };
  }

  componentDidCatch(_error, _errorInfo) {
    // También puedes registrar el error en un servicio de reporte de errores
    // logErrorToMyService(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.variant === 'very-wrong') {
        return this.renderVery();
      }
      return (
        <ErrorBoundaryContainer>
          <div className={`flex`}>
            <div className={`flex-shrink-0`}>
              <Svg
                xmlns="http://www.w3.org/2000/Svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </Svg>
            </div>
            <div className={`ml-3`}>
              <h3 className={`text`}>Something went wrong.</h3>
            </div>
          </div>
        </ErrorBoundaryContainer>
      );
    }

    return this.props.children;
  }

  renderVery() {
    return (
      <div className="bg-white dark:bg-black">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-black dark:text-white sm:text-4xl">
            <span className="block">{I18n.t('error_view.title')}</span>
            <span className="block">{I18n.t('error_view.subtitle')}</span>
          </h2>

          <p className="mt-4 text-lg leading-6 text-indigo-600 dark:text-indigo-300">
            {I18n.t('error_view.exp')}
          </p>
          <a
            href="/"
            className="mt-8 w-full inline-flex items-center 
        justify-center px-5 py-3 border border-transparent text-base 
        font-medium rounded-md 
        bg-indigo-600 text-white hover:bg-indigo-800 
        dark:bg-indigo-300 dark:text-black dark:hover:bg-indigo-100 
        sm:w-auto"
          >
            {I18n.t('error_view.cta')}
          </a>
        </div>
      </div>
    );
  }
}
