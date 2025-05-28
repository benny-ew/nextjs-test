import { ApiError, ApiErrorType, ServerErrorResponse } from '@/types/api';

/**
 * Parse error response and return user-friendly error message
 */
export const parseApiError = async (response: Response): Promise<ApiError> => {
  let errorMessage = 'Something went wrong. Please try again.';
  let errorCode = 'UNKNOWN';
  let details = null;

  try {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const errorData: ServerErrorResponse = await response.json();
      errorMessage = errorData.message || errorMessage;
      errorCode = errorData.code || getErrorCodeFromStatus(response.status);
      details = errorData.errors || null;
    } else {
      errorMessage = await response.text() || response.statusText || errorMessage;
    }
  } catch (parseError) {
    // If we can't parse the error response, use status-based message
    errorMessage = getErrorMessageFromStatus(response.status);
    errorCode = getErrorCodeFromStatus(response.status);
  }

  return {
    message: errorMessage,
    status: response.status,
    code: errorCode,
    details
  };
};

/**
 * Get error code based on HTTP status
 */
export const getErrorCodeFromStatus = (status: number): string => {
  switch (status) {
    case 400:
      return ApiErrorType.VALIDATION_ERROR;
    case 401:
      return ApiErrorType.UNAUTHORIZED;
    case 403:
      return ApiErrorType.FORBIDDEN;
    case 404:
      return ApiErrorType.NOT_FOUND;
    case 408:
      return ApiErrorType.TIMEOUT;
    case 500:
    case 502:
    case 503:
    case 504:
      return ApiErrorType.SERVER_ERROR;
    default:
      return ApiErrorType.UNKNOWN;
  }
};

/**
 * Get user-friendly error message based on HTTP status
 */
export const getErrorMessageFromStatus = (status: number): string => {
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input and try again.';
    case 401:
      return 'You are not authorized to perform this action. Please log in and try again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 408:
      return 'Request timed out. Please check your connection and try again.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Internal server error. Please try again later.';
    case 502:
      return 'Server is temporarily unavailable. Please try again later.';
    case 503:
      return 'Service is currently unavailable. Please try again later.';
    case 504:
      return 'Request timed out. Please try again later.';
    default:
      return 'Something went wrong. Please try again.';
  }
};

/**
 * Handle network errors (no internet, DNS issues, etc.)
 */
export const handleNetworkError = (error: Error): ApiError => {
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return {
      message: 'Unable to connect to the server. Please check your internet connection and try again.',
      code: ApiErrorType.NETWORK_ERROR
    };
  }

  if (error.name === 'AbortError') {
    return {
      message: 'Request was cancelled. Please try again.',
      code: ApiErrorType.TIMEOUT
    };
  }

  return {
    message: error.message || 'An unexpected error occurred. Please try again.',
    code: ApiErrorType.UNKNOWN
  };
};

/**
 * Format validation errors for display
 */
export const formatValidationErrors = (details: any[]): string => {
  if (!details || !Array.isArray(details)) {
    return 'Please check your input and try again.';
  }

  const errorMessages = details
    .map(error => `${error.field}: ${error.message}`)
    .join(', ');

  return `Validation errors: ${errorMessages}`;
};

/**
 * Get user-friendly error message from ApiError
 */
export const getUserFriendlyErrorMessage = (error: ApiError): string => {
  if (error.details && Array.isArray(error.details)) {
    return formatValidationErrors(error.details);
  }

  return error.message;
};
