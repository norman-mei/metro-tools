export const getKeystrokeFromEvent = (e: KeyboardEvent): string | null => {
  const key = e.key
  if (['Control', 'Alt', 'Shift', 'Meta'].includes(key)) {
    return null
  }

  const modifiers = []
  if (e.ctrlKey) modifiers.push('Ctrl')
  if (e.altKey) modifiers.push('Alt')
  if (e.shiftKey) modifiers.push('Shift')
  if (e.metaKey) modifiers.push('Meta')

  const finalKey = key === ' ' ? 'Space' : key.length === 1 ? key.toLowerCase() : key
  
  // For letters, if Shift is pressed, e.key might be uppercase 'A'.
  // We want 'Shift+a' probably? Or just 'A'? 
  // Standardize: if single letter, lowercase it.
  
  return [...modifiers, finalKey].join('+')
}
