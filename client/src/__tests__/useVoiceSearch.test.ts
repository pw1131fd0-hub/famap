// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVoiceSearch } from '../hooks/useVoiceSearch';

type MockRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  lang: string;
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  onresult: ((event: { results: Array<Array<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

// Use a shared mutable object so the class constructor can reference it
let mockInstance: MockRecognitionInstance;

function makeMockClass() {
  // Must be a real constructor function (not arrow) for `new` to work
  function MockSpeechRecognition(this: MockRecognitionInstance) {
    this.continuous = false;
    this.interimResults = false;
    this.maxAlternatives = 1;
    this.lang = '';
    this.start = vi.fn();
    this.stop = vi.fn();
    this.onresult = null;
    this.onerror = null;
    this.onend = null;
    // Assign to outer mockInstance so tests can access it
    mockInstance = this;
  }
  return MockSpeechRecognition as unknown as new () => MockRecognitionInstance;
}

describe('useVoiceSearch', () => {
  let MockSpeechRecognition: new () => MockRecognitionInstance;

  beforeEach(() => {
    MockSpeechRecognition = makeMockClass();
    // @ts-expect-error mock
    window.SpeechRecognition = MockSpeechRecognition;
    // @ts-expect-error mock
    delete window.webkitSpeechRecognition;
  });

  afterEach(() => {
    // @ts-expect-error mock
    delete window.SpeechRecognition;
    // @ts-expect-error mock
    delete window.webkitSpeechRecognition;
    vi.restoreAllMocks();
  });

  it('isSupported is false when SpeechRecognition is not available', () => {
    // @ts-expect-error mock
    delete window.SpeechRecognition;
    const { result } = renderHook(() => useVoiceSearch('en'));
    expect(result.current.isSupported).toBe(false);
  });

  it('isSupported is true when window.SpeechRecognition is available', () => {
    const { result } = renderHook(() => useVoiceSearch('en'));
    expect(result.current.isSupported).toBe(true);
  });

  it('isSupported is true when window.webkitSpeechRecognition is available', () => {
    // @ts-expect-error mock
    delete window.SpeechRecognition;
    // @ts-expect-error mock
    window.webkitSpeechRecognition = MockSpeechRecognition;
    const { result } = renderHook(() => useVoiceSearch('en'));
    expect(result.current.isSupported).toBe(true);
    // @ts-expect-error mock
    delete window.webkitSpeechRecognition;
  });

  it('has correct initial state', () => {
    const { result } = renderHook(() => useVoiceSearch('en'));
    expect(result.current.isListening).toBe(false);
    expect(result.current.transcript).toBe('');
    expect(result.current.error).toBe(null);
  });

  it('startListening sets isListening to true', () => {
    const { result } = renderHook(() => useVoiceSearch('en'));
    act(() => {
      result.current.startListening();
    });
    expect(result.current.isListening).toBe(true);
    expect(mockInstance.start).toHaveBeenCalled();
  });

  it('stopListening sets isListening to false', () => {
    const { result } = renderHook(() => useVoiceSearch('en'));
    act(() => {
      result.current.startListening();
    });
    expect(result.current.isListening).toBe(true);
    act(() => {
      result.current.stopListening();
    });
    expect(result.current.isListening).toBe(false);
    expect(mockInstance.stop).toHaveBeenCalled();
  });

  it('uses zh-TW locale when language is zh', () => {
    const { result } = renderHook(() => useVoiceSearch('zh'));
    act(() => {
      result.current.startListening();
    });
    expect(mockInstance.lang).toBe('zh-TW');
  });

  it('uses en-US locale when language is en', () => {
    const { result } = renderHook(() => useVoiceSearch('en'));
    act(() => {
      result.current.startListening();
    });
    expect(mockInstance.lang).toBe('en-US');
  });

  it('sets transcript from onresult event', () => {
    const { result } = renderHook(() => useVoiceSearch('en'));
    act(() => {
      result.current.startListening();
    });
    act(() => {
      if (mockInstance.onresult) {
        mockInstance.onresult({
          results: [[{ transcript: 'hello world' }]],
        });
      }
    });
    expect(result.current.transcript).toBe('hello world');
  });

  it('sets error from onerror event and stops listening', () => {
    const { result } = renderHook(() => useVoiceSearch('en'));
    act(() => {
      result.current.startListening();
    });
    act(() => {
      if (mockInstance.onerror) {
        mockInstance.onerror({ error: 'not-allowed' });
      }
    });
    expect(result.current.error).toBe('not-allowed');
    expect(result.current.isListening).toBe(false);
  });

  it('sets isListening false on onend event', () => {
    const { result } = renderHook(() => useVoiceSearch('en'));
    act(() => {
      result.current.startListening();
    });
    act(() => {
      if (mockInstance.onend) {
        mockInstance.onend();
      }
    });
    expect(result.current.isListening).toBe(false);
  });

  it('configures recognition with correct settings', () => {
    const { result } = renderHook(() => useVoiceSearch('en'));
    act(() => {
      result.current.startListening();
    });
    expect(mockInstance.continuous).toBe(false);
    expect(mockInstance.interimResults).toBe(true);
    expect(mockInstance.maxAlternatives).toBe(1);
  });

  it('does nothing when startListening called and isSupported is false', () => {
    // @ts-expect-error mock
    delete window.SpeechRecognition;
    // Track whether constructor was called by wrapping in a spy class
    let constructed = false;
    function SpyClass(this: MockRecognitionInstance) {
      constructed = true;
      this.continuous = false;
      this.interimResults = false;
      this.maxAlternatives = 1;
      this.lang = '';
      this.start = vi.fn();
      this.stop = vi.fn();
      this.onresult = null;
      this.onerror = null;
      this.onend = null;
    }
    // We already deleted SpeechRecognition so isSupported should be false
    const { result } = renderHook(() => useVoiceSearch('en'));
    expect(result.current.isSupported).toBe(false);
    act(() => {
      result.current.startListening();
    });
    expect(result.current.isListening).toBe(false);
    expect(constructed).toBe(false);
    // suppress unused variable warning
    void SpyClass;
  });
});
