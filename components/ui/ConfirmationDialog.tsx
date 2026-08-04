"use client";

import React from "react";
import { Modal } from "./Modal";
import { LoadingButton } from "./LoadingButton";
import { AlertTriangle, Info } from "lucide-react";

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  type?: "danger" | "warning" | "info";
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  type = "warning",
}: ConfirmationDialogProps) {
  const isDanger = type === "danger";
  const Icon = type === "info" ? Info : AlertTriangle;
  const iconColor = type === "danger" ? "text-red-600" : type === "warning" ? "text-amber-600" : "text-blue-600";
  const iconBg = type === "danger" ? "bg-red-100" : type === "warning" ? "bg-amber-100" : "bg-blue-100";

  const footer = (
    <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 w-full">
      <LoadingButton 
        variant="secondary" 
        onClick={onClose}
        disabled={isLoading}
        className="sm:w-auto w-full"
      >
        {cancelText}
      </LoadingButton>
      <LoadingButton 
        variant={isDanger ? "danger" : "primary"} 
        onClick={onConfirm}
        isLoading={isLoading}
        className="sm:w-auto w-full"
      >
        {confirmText}
      </LoadingButton>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" hideCloseButton>
      <div className="flex flex-col items-center sm:items-start sm:flex-row gap-4 pt-2">
        <div className={`flex shrink-0 h-12 w-12 items-center justify-center rounded-full sm:h-10 sm:w-10 ${iconBg}`}>
          <Icon className={`h-6 w-6 sm:h-5 sm:w-5 ${iconColor}`} aria-hidden="true" />
        </div>
        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
          <h3 className="text-lg font-bold leading-6 text-slate-900" id="modal-title">
            {title}
          </h3>
          <div className="mt-2">
            <p className="text-sm text-slate-500">
              {description}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 w-full">
        <LoadingButton 
          variant="secondary" 
          onClick={onClose}
          disabled={isLoading}
          className="sm:w-auto w-full"
        >
          {cancelText}
        </LoadingButton>
        <LoadingButton 
          variant={isDanger ? "danger" : "primary"} 
          onClick={onConfirm}
          isLoading={isLoading}
          className="sm:w-auto w-full"
        >
          {confirmText}
        </LoadingButton>
      </div>
    </Modal>
  );
}
