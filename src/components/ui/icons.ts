/**
 * Иконки lucide — по одной, чтобы в бандл не попал весь набор (Metro не вырезает неиспользуемый код).
 */
import type { ComponentType } from 'react';

/** Любая иконка: lucide или собственный SVG-знак с теми же пропсами. */
export type IconComponent = ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

export { default as ArrowRight } from 'lucide-react-native/icons/arrow-right';
export { default as Banknote } from 'lucide-react-native/icons/banknote';
export { default as CalendarCheck } from 'lucide-react-native/icons/calendar-check';
export { default as CalendarClock } from 'lucide-react-native/icons/calendar-clock';
export { default as CalendarDays } from 'lucide-react-native/icons/calendar-days';
export { default as CalendarPlus } from 'lucide-react-native/icons/calendar-plus';
export { default as CalendarX } from 'lucide-react-native/icons/calendar-x';
export { default as Check } from 'lucide-react-native/icons/check';
export { default as ChevronDown } from 'lucide-react-native/icons/chevron-down';
export { default as ChevronLeft } from 'lucide-react-native/icons/chevron-left';
export { default as ChevronRight } from 'lucide-react-native/icons/chevron-right';
export { default as CircleAlert } from 'lucide-react-native/icons/circle-alert';
export { default as CircleCheck } from 'lucide-react-native/icons/circle-check';
export { default as ClipboardList } from 'lucide-react-native/icons/clipboard-list';
export { default as Clock } from 'lucide-react-native/icons/clock';
export { default as CreditCard } from 'lucide-react-native/icons/credit-card';
export { default as FileText } from 'lucide-react-native/icons/file-text';
export { default as House } from 'lucide-react-native/icons/house';
export { default as Info } from 'lucide-react-native/icons/info';
export { default as Languages } from 'lucide-react-native/icons/languages';
export { default as Lock } from 'lucide-react-native/icons/lock';
export { default as Mail } from 'lucide-react-native/icons/mail';
export { default as MapPin } from 'lucide-react-native/icons/map-pin';
export { default as Menu } from 'lucide-react-native/icons/menu';
export { default as MessageCircle } from 'lucide-react-native/icons/message-circle';
export { default as Navigation } from 'lucide-react-native/icons/navigation';
export { default as Phone } from 'lucide-react-native/icons/phone';
export { default as QrCode } from 'lucide-react-native/icons/qr-code';
export { default as RotateCcw } from 'lucide-react-native/icons/rotate-ccw';
export { default as Stethoscope } from 'lucide-react-native/icons/stethoscope';
export { default as Sun } from 'lucide-react-native/icons/sun';
export { default as Sunrise } from 'lucide-react-native/icons/sunrise';
export { default as Sunset } from 'lucide-react-native/icons/sunset';
export { default as Trash2 } from 'lucide-react-native/icons/trash';
export { default as User } from 'lucide-react-native/icons/user';
export { default as Users } from 'lucide-react-native/icons/users';
export { default as X } from 'lucide-react-native/icons/x';
