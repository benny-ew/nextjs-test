import '@testing-library/jest-dom'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  })),
  useParams: jest.fn(() => ({})),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  usePathname: jest.fn(() => '/'),
}))

// Mock react-query
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
  QueryClient: jest.fn(),
  QueryClientProvider: ({ children }) => children,
}))

// Mock react-hook-form
jest.mock('react-hook-form', () => ({
  useForm: jest.fn(() => ({
    register: jest.fn(() => ({
      name: 'test',
      onChange: jest.fn(),
      onBlur: jest.fn(),
      ref: jest.fn(),
    })),
    handleSubmit: jest.fn((fn) => jest.fn((event) => {
      event?.preventDefault?.();
      return fn({
        title: '',
        description: '',
        status: 'TO_DO',
      });
    })),
    watch: jest.fn(() => ''),
    reset: jest.fn(),
    getValues: jest.fn(() => ({
      title: '',
      description: '',
      status: 'TO_DO',
    })),
    setValue: jest.fn(),
    clearErrors: jest.fn(),
    formState: {
      errors: {},
      isDirty: false,
      isValid: true,
    },
  })),
  Controller: ({ render, ...props }) => render({ field: props }),
  useController: jest.fn(),
}))

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})
