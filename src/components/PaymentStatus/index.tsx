import React from "react";
import {
  Box,
  Typography,
  LinearProgress,
  Stack,
  IconButton,
  Tooltip,
  Alert,
  AlertTitle,
  Chip,
  Collapse,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SecurityIcon from "@mui/icons-material/Security";
import WarningIcon from "@mui/icons-material/Warning";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  PAYMENT_STATUS,
  type PaymentStatus,
  getStatusMessage,
  getStatusEmoji,
} from "../../hooks/usePaymentTracking";

interface PaymentStatusDisplayProps {
  status: PaymentStatus | null;
  transactionRef: string | null;
  error?: string | null;
  processingTime?: number;
  onRetry?: () => void;
  showDetails?: boolean;
}

export const PaymentStatusDisplay: React.FC<PaymentStatusDisplayProps> = ({
  status,
  transactionRef,
  error,
  processingTime,
  onRetry,
  showDetails = true,
}) => {
  const [copied, setCopied] = React.useState(false);

  const copyTransactionRef = () => {
    if (transactionRef) {
      navigator.clipboard.writeText(transactionRef);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!status) return null;

  const getStatusConfig = (s: PaymentStatus) => {
    const configs: Record<
      PaymentStatus,
      {
        color: "success" | "error" | "warning" | "info" | "default";
        icon: React.ReactNode;
        showProgress: boolean;
        progressVariant: "determinate" | "indeterminate";
        progressValue?: number;
      }
    > = {
      [PAYMENT_STATUS.INITIATED]: {
        color: "info",
        icon: <AccessTimeIcon />,
        showProgress: true,
        progressVariant: "indeterminate",
      },
      [PAYMENT_STATUS.VALIDATING]: {
        color: "info",
        icon: <SecurityIcon />,
        showProgress: true,
        progressVariant: "indeterminate",
      },
      [PAYMENT_STATUS.PROCESSING]: {
        color: "warning",
        icon: <AccessTimeIcon />,
        showProgress: true,
        progressVariant: "indeterminate",
      },
      [PAYMENT_STATUS.AWAITING_CONFIRMATION]: {
        color: "warning",
        icon: <AccessTimeIcon />,
        showProgress: true,
        progressVariant: "indeterminate",
      },
      [PAYMENT_STATUS.REQUIRES_ACTION]: {
        color: "info",
        icon: <SecurityIcon />,
        showProgress: false,
        progressVariant: "indeterminate",
      },
      [PAYMENT_STATUS.COMPLETED]: {
        color: "success",
        icon: <CheckCircleIcon />,
        showProgress: true,
        progressVariant: "determinate",
        progressValue: 100,
      },
      [PAYMENT_STATUS.FAILED]: {
        color: "error",
        icon: <ErrorIcon />,
        showProgress: false,
        progressVariant: "indeterminate",
      },
      [PAYMENT_STATUS.TIMEOUT]: {
        color: "error",
        icon: <AccessTimeIcon />,
        showProgress: false,
        progressVariant: "indeterminate",
      },
      [PAYMENT_STATUS.CANCELLED]: {
        color: "default",
        icon: <WarningIcon />,
        showProgress: false,
        progressVariant: "indeterminate",
      },
      [PAYMENT_STATUS.REFUNDED]: {
        color: "info",
        icon: <CheckCircleIcon />,
        showProgress: false,
        progressVariant: "indeterminate",
      },
      [PAYMENT_STATUS.PARTIALLY_REFUNDED]: {
        color: "info",
        icon: <CheckCircleIcon />,
        showProgress: false,
        progressVariant: "indeterminate",
      },
      [PAYMENT_STATUS.ON_HOLD]: {
        color: "warning",
        icon: <WarningIcon />,
        showProgress: false,
        progressVariant: "indeterminate",
      },
      [PAYMENT_STATUS.UNDER_REVIEW]: {
        color: "warning",
        icon: <SecurityIcon />,
        showProgress: false,
        progressVariant: "indeterminate",
      },
    };

    return configs[s] || configs[PAYMENT_STATUS.PROCESSING];
  };

  const config = getStatusConfig(status);
  const isError =
    status === PAYMENT_STATUS.FAILED || status === PAYMENT_STATUS.TIMEOUT;

  const getBackgroundColor = () => {
    switch (config.color) {
      case "success":
        return "#ecfdf5";
      case "error":
        return "#fef2f2";
      case "warning":
        return "#fffbeb";
      case "info":
        return "#eff6ff";
      default:
        return "#f9fafb";
    }
  };

  const getBorderColor = () => {
    switch (config.color) {
      case "success":
        return "#10b981";
      case "error":
        return "#ef4444";
      case "warning":
        return "#f59e0b";
      case "info":
        return "#3b82f6";
      default:
        return "#d1d5db";
    }
  };

  const getIconColor = () => {
    switch (config.color) {
      case "success":
        return "#10b981";
      case "error":
        return "#ef4444";
      case "warning":
        return "#f59e0b";
      case "info":
        return "#3b82f6";
      default:
        return "#6b7280";
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 2,
        border: `2px solid ${getBorderColor()}`,
        bgcolor: getBackgroundColor(),
        mb: 2,
      }}
    >
      {/* Status Header */}
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <Box
          sx={{
            p: 1,
            borderRadius: "50%",
            bgcolor: "white",
            color: getIconColor(),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          {config.icon}
        </Box>
        <Box flex={1}>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            sx={{ color: "#1a1a1a" }}
          >
            {getStatusEmoji(status)} {getStatusMessage(status)}
          </Typography>
        </Box>
        {isError && onRetry && (
          <Tooltip title="Try again">
            <IconButton onClick={onRetry} sx={{ color: "#ef4444" }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      {/* Progress Bar */}
      {config.showProgress && (
        <Box mb={2}>
          <LinearProgress
            variant={config.progressVariant}
            value={config.progressValue}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: "rgba(255,255,255,0.5)",
              "& .MuiLinearProgress-bar": {
                bgcolor: getIconColor(),
              },
            }}
          />
        </Box>
      )}

      {/* Transaction Reference */}
      {transactionRef && showDetails && (
        <Box
          sx={{
            p: 2,
            bgcolor: "white",
            borderRadius: 1,
            mb: error ? 2 : 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              Transaction Reference
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "monospace",
                fontWeight: "bold",
                color: "#374151",
              }}
            >
              {transactionRef}
            </Typography>
          </Box>
          <Tooltip title={copied ? "Copied!" : "Copy reference"}>
            <IconButton size="small" onClick={copyTransactionRef}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Error Details */}
      <Collapse in={!!error}>
        <Alert severity="error" sx={{ mt: 2 }}>
          <AlertTitle>Error Details</AlertTitle>
          <Typography variant="body2">{error}</Typography>
          {transactionRef && (
            <Typography
              variant="caption"
              display="block"
              mt={1}
              color="text.secondary"
            >
              If you believe you were charged incorrectly, please contact
              support with reference: {transactionRef}
            </Typography>
          )}
        </Alert>
      </Collapse>

      {/* Processing Time */}
      {processingTime && showDetails && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: "block" }}
        >
          Processing time: {(processingTime / 1000).toFixed(1)}s
        </Typography>
      )}
    </Box>
  );
};

/**
 * Payment Steps Indicator
 */
interface PaymentStepsProps {
  currentStep: number;
  isError?: boolean;
}

export const PaymentSteps: React.FC<PaymentStepsProps> = ({
  currentStep,
  isError = false,
}) => {
  const steps = [
    { label: "Initiated", step: 1 },
    { label: "Validating", step: 2 },
    { label: "Processing", step: 3 },
    { label: "Confirming", step: 4 },
    { label: "Complete", step: 5 },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Stack
        direction="row"
        spacing={0}
        justifyContent="space-between"
        alignItems="center"
      >
        {steps.map((step, index) => {
          const isActive = step.step === currentStep;
          const isCompleted = step.step < currentStep;
          const isFailed = isError && step.step === currentStep;

          return (
            <React.Fragment key={step.label}>
              <Stack alignItems="center" spacing={0.5} sx={{ flex: 1 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: isFailed
                      ? "#ef4444"
                      : isCompleted
                        ? "#10b981"
                        : isActive
                          ? "#3b82f6"
                          : "#e5e7eb",
                    color:
                      isCompleted || isActive || isFailed ? "white" : "#9ca3af",
                    fontWeight: "bold",
                    fontSize: "0.75rem",
                    transition: "all 0.3s ease",
                  }}
                >
                  {isFailed ? "✕" : isCompleted ? "✓" : step.step}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: isActive ? "#3b82f6" : "#6b7280",
                    fontWeight: isActive ? 600 : 400,
                    fontSize: "0.7rem",
                  }}
                >
                  {step.label}
                </Typography>
              </Stack>
              {index < steps.length - 1 && (
                <Box
                  sx={{
                    flex: 1,
                    height: 2,
                    bgcolor: isCompleted ? "#10b981" : "#e5e7eb",
                    mx: -1,
                    mt: -1.5,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </Stack>
    </Box>
  );
};

/**
 * Payment History Item Component
 */
interface PaymentHistoryItemProps {
  transactionRef: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  statusMessage: string;
  statusEmoji: string;
  createdAt: string;
  onViewDetails?: () => void;
}

export const PaymentHistoryItem: React.FC<PaymentHistoryItemProps> = ({
  transactionRef,
  amount,
  currency,
  status,
  statusEmoji,
  createdAt,
  onViewDetails,
}) => {
  const getChipColor = (s: PaymentStatus) => {
    switch (s) {
      case PAYMENT_STATUS.COMPLETED:
        return "success";
      case PAYMENT_STATUS.FAILED:
      case PAYMENT_STATUS.TIMEOUT:
        return "error";
      case PAYMENT_STATUS.REFUNDED:
      case PAYMENT_STATUS.PARTIALLY_REFUNDED:
        return "info";
      case PAYMENT_STATUS.PROCESSING:
      case PAYMENT_STATUS.AWAITING_CONFIRMATION:
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        border: "1px solid #e5e7eb",
        borderRadius: 2,
        mb: 1,
        "&:hover": {
          bgcolor: "#f9fafb",
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body1" fontWeight="bold">
              {currency} {amount.toFixed(2)}
            </Typography>
            <Chip
              size="small"
              color={getChipColor(status)}
              label={`${statusEmoji} ${status}`}
            />
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {transactionRef} • {new Date(createdAt).toLocaleDateString()}
          </Typography>
        </Box>
        {onViewDetails && (
          <Typography
            variant="body2"
            sx={{
              color: "#3b82f6",
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
            }}
            onClick={onViewDetails}
          >
            View Details
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

export default PaymentStatusDisplay;
