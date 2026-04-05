import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description?: string;
  scopes?: ('global' | 'map' | 'sidebar' | 'detail')[];
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  shortcuts: KeyboardShortcut[];
}

export function useKeyboardShortcuts({ enabled = true, shortcuts }: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      // Allow Escape to blur inputs
      if (event.key !== 'Escape') {
        return;
      }
    }

    for (const shortcut of shortcuts) {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;

      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        event.preventDefault();
        shortcut.action();
        return;
      }
    }
  }, [enabled, shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Pre-defined shortcut sets
export const createNavigationShortcuts = ({
  onFindMe,
  onSearch,
  onToggleSidebar,
  onToggleDarkMode,
  onLanguageSwitch,
}: {
  onFindMe?: () => void;
  onSearch?: () => void;
  onToggleSidebar?: () => void;
  onToggleDarkMode?: () => void;
  onLanguageSwitch?: () => void;
}): KeyboardShortcut[] => [
  {
    key: 'm',
    action: () => onToggleSidebar?.(),
    description: 'Toggle sidebar',
  },
  {
    key: 'f',
    action: () => onFindMe?.(),
    description: 'Find my location',
  },
  {
    key: '/',
    action: () => onSearch?.(),
    description: 'Focus search',
  },
  {
    key: 'd',
    ctrl: true,
    action: () => onToggleDarkMode?.(),
    description: 'Toggle dark mode',
  },
  {
    key: 'l',
    ctrl: true,
    shift: true,
    action: () => onLanguageSwitch?.(),
    description: 'Switch language',
  },
];

// Help modal with shortcut reference
export function KeyboardShortcutsHelp({ shortcuts, language }: { shortcuts: KeyboardShortcut[]; language: 'zh' | 'en' }) {
  return (
    <div className="keyboard-shortcuts-help" role="dialog" aria-label="Keyboard shortcuts">
      <h3>{language === 'zh' ? '鍵盤快捷鍵' : 'Keyboard Shortcuts'}</h3>
      <table>
        <thead>
          <tr>
            <th>{language === 'zh' ? '快捷鍵' : 'Shortcut'}</th>
            <th>{language === 'zh' ? '說明' : 'Description'}</th>
          </tr>
        </thead>
        <tbody>
          {shortcuts.map((shortcut, i) => (
            <tr key={i}>
              <td>
                <kbd>
                  {shortcut.ctrl && (language === 'zh' ? 'Ctrl+' : 'Ctrl+')}
                  {shortcut.shift && (language === 'zh' ? 'Shift+' : 'Shift+')}
                  {shortcut.alt && (language === 'zh' ? 'Alt+' : 'Alt+')}
                  {shortcut.key.toUpperCase()}
                </kbd>
              </td>
              <td>{shortcut.description || shortcut.action.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
