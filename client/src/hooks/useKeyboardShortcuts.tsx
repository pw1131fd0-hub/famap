import { KeyboardShortcut } from './useKeyboardShortcuts';

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