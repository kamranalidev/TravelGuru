export const theme = {
  colors: {
    primary: "#6366F1",
    primaryHover: "#4F46E5",
    secondary: "#8B5CF6",
    success: "#10B981",
    successLight: "#D1FAE5",
    warning: "#F59E0B",
    warningLight: "#FEF3C7",
    error: "#EF4444",
    errorLight: "#FEE2E2",
    info: "#3B82F6",
    infoLight: "#DBEAFE",

    text: {
      primary: "#111827",
      secondary: "#6B7280",
      tertiary: "#9CA3AF",
    },

    background: {
      primary: "#FFFFFF",
      secondary: "#F9FAFB",
      tertiary: "#F3F4F6",
    },

    border: "#E5E7EB",
  },

  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },

  borderRadius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    full: "9999px",
  },

  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    xxl: "48px",
  },
};

export const antdThemeConfig = {
  token: {
    colorPrimary: theme.colors.primary,
    colorSuccess: theme.colors.success,
    colorWarning: theme.colors.warning,
    colorError: theme.colors.error,
    colorInfo: theme.colors.info,
    borderRadius: 8,
    fontSize: 14,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    colorBgContainer: theme.colors.background.primary,
    colorBorder: theme.colors.border,
  },
  components: {
    Layout: {
      headerBg: "#FFFFFF",
      headerHeight: 64,
      headerPadding: "0 24px",
      siderBg: "#FFFFFF",
      bodyBg: "#F9FAFB",
    },
    Menu: {
      itemBg: "transparent",
      itemSelectedBg: "#EEF2FF",
      itemSelectedColor: theme.colors.primary,
      itemHoverBg: "#F9FAFB",
      itemHoverColor: theme.colors.primary,
      itemActiveBg: "#EEF2FF",
      itemMarginInline: 8,
      itemBorderRadius: 8,
      iconSize: 18,
    },
    Card: {
      boxShadow: theme.shadows.sm,
      borderRadius: 12,
    },
    Button: {
      borderRadius: 8,
      controlHeight: 40,
      fontWeight: 500,
    },
    Table: {
      headerBg: "#F9FAFB",
      headerColor: theme.colors.text.primary,
      borderRadius: 8,
    },
  },
};

export const colors = {
  primary: theme.colors.primary,
  primaryHover: theme.colors.primaryHover,
  secondary: theme.colors.secondary,
  success: theme.colors.success,
  successLight: theme.colors.successLight,
  warning: theme.colors.warning,
  warningLight: theme.colors.warningLight,
  error: theme.colors.error,
  errorLight: theme.colors.errorLight,
  info: theme.colors.info,
  infoLight: theme.colors.infoLight,
  text: theme.colors.text.primary,
  textSecondary: theme.colors.text.secondary,
  textTertiary: theme.colors.text.tertiary,
  background: theme.colors.background.secondary,
  border: theme.colors.border,
};
