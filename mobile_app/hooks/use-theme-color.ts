/**
 * Simplified theme hook — always returns dark-mode colors since
 * GigToGeek is a dark-only app.
 */
import { Colors } from '@/constants/Theme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  _colorName?: string,
): string {
  // Always dark — return the prop override if provided, else a fallback
  return props.dark ?? props.light ?? Colors.textPrimary;
}
