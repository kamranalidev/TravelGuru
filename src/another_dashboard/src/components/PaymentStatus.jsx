import React from "react";
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Alert,
  AlertTitle,
  Chip,
  Button,
  Divider,
  Stack,
  CircularProgress,
  IconButton,
  Tooltip,
  Collapse,
} from "@mui/material";
import {
  CheckCircle,
  Error,
  AccessTime,
  Refresh,
  ContentCopy,
  Receipt,
  Security,
  Warning,
  Info,
  ArrowForward,
} from "@mui/icons-material";
import { PAYMENT_STATUS } from "../lib/payment";

/**
 * PaymentStatusTracker - Real-time payment status display
 * Shows users exactly where their payment is in the process
 */
export function PaymentStatusTracker({
  status,
  transactionRef,
  message,
  error,
  processingTime,
  onRetry,
  onCancel,
  onViewReceipt,
  showDetails = true,
}) {
  const [copied, setCopied] = React.useState(false);

  const copyTransactionRef = () => {
    if (transactionRef) {
      navigator.clipboard.writeText(transactionRef);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      [PAYMENT_STATUS.INITIATED]: {
        color: "info",
        icon: <AccessTime />,
        title: "Payment Initiated",
        subtitle: "Securing your transaction...",
        showProgress: true,
        progressVariant: "indeterminate",
        step: 1,
      },
      [PAYMENT_STATUS.VALIDATING]: {
        color: "info",
        icon: <Security />,
        title: "Validating Payment",
        subtitle: "Checking payment details...",
        showProgress: true,
        progressVariant: "indeterminate",
        step: 2,
      },
      [PAYMENT_STATUS.PROCESSING]: {
        color: "warning",
        icon: <CircularProgress size={24} />,
        title: "Processing Payment",
        subtitle: "Connecting to payment gateway...",
        showProgress: true,
        progressVariant: "indeterminate",
        step: 3,
      },
      [PAYMENT_STATUS.AWAITING_CONFIRMATION]: {
        color: "warning",
        icon: <AccessTime />,
        title: "Awaiting Confirmation",
        subtitle: "Waiting for bank confirmation...",
        showProgress: true,
        progressVariant: "indeterminate",
        step: 4,
      },
      [PAYMENT_STATUS.REQUIRES_ACTION]: {
        color: "info",
        icon: <Security />,
        title: "Verification Required",
        subtitle: "Please complete 3D Secure verification",
        showProgress: false,
        step: 4,
      },
      [PAYMENT_STATUS.COMPLETED]: {
        color: "success",
        icon: <CheckCircle />,
        title: "Payment Successful!",
        subtitle: "Your booking is confirmed",
        showProgress: true,
        progressVariant: "determinate",
        progressValue: 100,
        step: 5,
      },
      [PAYMENT_STATUS.FAILED]: {
        color: "error",
        icon: <Error />,
        title: "Payment Failed",
        subtitle: "No charges were made to your account",
        showProgress: false,
        step: 0,
      },
      [PAYMENT_STATUS.TIMEOUT]: {
        color: "error",
        icon: <AccessTime />,
        title: "Payment Timed Out",
        subtitle: "No charges were made. Please try again.",
        showProgress: false,
        step: 0,
      },
      [PAYMENT_STATUS.CANCELLED]: {
        color: "default",
        icon: <Info />,
        title: "Payment Cancelled",
        subtitle: "No charges were made",
        showProgress: false,
        step: 0,
      },
      [PAYMENT_STATUS.UNDER_REVIEW]: {
        color: "warning",
        icon: <Warning />,
        title: "Under Security Review",
        subtitle: "Our team is reviewing your payment",
        showProgress: false,
        step: 4,
      },
    };

    return (
      configs[status] || {
        color: "default",
        icon: <Info />,
        title: "Processing",
        subtitle: "Please wait...",
        showProgress: true,
        progressVariant: "indeterminate",
        step: 0,
      }
    );
  };

  const config = getStatusConfig(status);
  const isSuccess = status === PAYMENT_STATUS.COMPLETED;
  const isError = [PAYMENT_STATUS.FAILED, PAYMENT_STATUS.TIMEOUT].includes(
    status,
  );
  const isProcessing = [
    PAYMENT_STATUS.INITIATED,
    PAYMENT_STATUS.VALIDATING,
    PAYMENT_STATUS.PROCESSING,
    PAYMENT_STATUS.AWAITING_CONFIRMATION,
  ].includes(status);

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 2,
        border: `2px solid`,
        borderColor: `${config.color}.main`,
        bgcolor: `${config.color}.50`,
      }}
    >
      {/* Status Header */}
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <Box
          sx={{
            p: 1,
            borderRadius: "50%",
            bgcolor: `${config.color}.100`,
            color: `${config.color}.main`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {config.icon}
        </Box>
        <Box flex={1}>
          <Typography variant="h6" fontWeight="bold">
            {config.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {message || config.subtitle}
          </Typography>
        </Box>
        {isSuccess && onViewReceipt && (
          <Button
            variant="outlined"
            color="success"
            startIcon={<Receipt />}
            onClick={onViewReceipt}
            size="small"
          >
            View Receipt
          </Button>
        )}
      </Stack>

      {/* Progress Bar */}
      {config.showProgress && (
        <Box mb={2}>
          <LinearProgress
            variant={config.progressVariant}
            value={config.progressValue}
            color={config.color}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      )}

      {/* Transaction Reference */}
      {transactionRef && showDetails && (
        <Box
          sx={{
            p: 2,
            bgcolor: "background.paper",
            borderRadius: 1,
            mb: 2,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                Transaction Reference
              </Typography>
              <Typography
                variant="body2"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {transactionRef}
              </Typography>
            </Box>
            <Tooltip title={copied ? "Copied!" : "Copy reference"}>
              <IconButton size="small" onClick={copyTransactionRef}>
                <ContentCopy fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      )}

      {/* Error Details */}
      <Collapse in={!!error}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Error Details</AlertTitle>
          <Typography variant="body2">{error?.message}</Typography>
          {error?.supportInfo && (
            <Typography variant="caption" display="block" mt={1}>
              {error.supportInfo.contactMessage}
            </Typography>
          )}
        </Alert>
      </Collapse>

      {/* Processing Time */}
      {processingTime && showDetails && (
        <Typography variant="caption" color="text.secondary">
          Processing time: {(processingTime / 1000).toFixed(1)}s
        </Typography>
      )}

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} mt={2} justifyContent="flex-end">
        {isError && onRetry && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<Refresh />}
            onClick={onRetry}
          >
            Try Again
          </Button>
        )}
        {isProcessing && onCancel && (
          <Button variant="outlined" color="inherit" onClick={onCancel}>
            Cancel
          </Button>
        )}
        {status === PAYMENT_STATUS.REQUIRES_ACTION && (
          <Button
            variant="contained"
            color="primary"
            endIcon={<ArrowForward />}
          >
            Complete Verification
          </Button>
        )}
      </Stack>
    </Paper>
  );
}

/**
 * PaymentSteps - Visual step indicator for payment process
 */
export function PaymentSteps({ currentStep, status }) {
  const steps = [
    { label: "Initiated", icon: "1" },
    { label: "Validating", icon: "2" },
    { label: "Processing", icon: "3" },
    { label: "Confirming", icon: "4" },
    { label: "Complete", icon: "✓" },
  ];

  const isError = [PAYMENT_STATUS.FAILED, PAYMENT_STATUS.TIMEOUT].includes(
    status,
  );

  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" spacing={0} justifyContent="space-between">
        {steps.map((step, index) => {
          const isActive = index + 1 === currentStep;
          const isCompleted = index + 1 < currentStep;
          const isFailed = isError && index + 1 === currentStep;

          return (
            <React.Fragment key={step.label}>
              <Stack alignItems="center" spacing={1} flex={1}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: isFailed
                      ? "error.main"
                      : isCompleted
                        ? "success.main"
                        : isActive
                          ? "primary.main"
                          : "grey.300",
                    color:
                      isCompleted || isActive || isFailed
                        ? "white"
                        : "grey.600",
                    fontWeight: "bold",
                    fontSize: "0.875rem",
                  }}
                >
                  {isFailed ? "✕" : isCompleted ? "✓" : step.icon}
                </Box>
                <Typography
                  variant="caption"
                  color={isActive ? "primary" : "text.secondary"}
                  fontWeight={isActive ? "bold" : "normal"}
                >
                  {step.label}
                </Typography>
              </Stack>
              {index < steps.length - 1 && (
                <Box
                  sx={{
                    flex: 1,
                    height: 2,
                    bgcolor: isCompleted ? "success.main" : "grey.300",
                    mt: 2.25,
                    mx: -2,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </Stack>
    </Box>
  );
}

/**
 * PaymentHistoryItem - Display a single payment in history
 */
export function PaymentHistoryItem({
  payment,
  onViewReceipt,
  onRequestRefund,
}) {
  const getStatusChip = (status) => {
    const chipProps = {
      [PAYMENT_STATUS.COMPLETED]: { color: "success", label: "Paid" },
      [PAYMENT_STATUS.FAILED]: { color: "error", label: "Failed" },
      [PAYMENT_STATUS.REFUNDED]: { color: "info", label: "Refunded" },
      [PAYMENT_STATUS.PARTIALLY_REFUNDED]: {
        color: "info",
        label: "Partial Refund",
      },
      [PAYMENT_STATUS.PROCESSING]: { color: "warning", label: "Processing" },
    };
    return chipProps[status] || { color: "default", label: status };
  };

  const chipConfig = getStatusChip(payment.status);
  const canRefund = payment.status === PAYMENT_STATUS.COMPLETED;

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body1" fontWeight="bold">
              {payment.currency} {payment.amount.toFixed(2)}
            </Typography>
            <Chip
              size="small"
              color={chipConfig.color}
              label={chipConfig.label}
            />
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {payment.transactionRef} •{" "}
            {new Date(payment.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          {payment.status === PAYMENT_STATUS.COMPLETED && onViewReceipt && (
            <Button
              size="small"
              startIcon={<Receipt />}
              onClick={() => onViewReceipt(payment)}
            >
              Receipt
            </Button>
          )}
          {canRefund && onRequestRefund && (
            <Button
              size="small"
              color="secondary"
              onClick={() => onRequestRefund(payment)}
            >
              Refund
            </Button>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}

export default PaymentStatusTracker;
