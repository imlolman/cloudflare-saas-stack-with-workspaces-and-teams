"use client";

import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface ConfirmDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	description: string;
	confirmText?: string;
	cancelText?: string;
	variant?: "default" | "destructive";
}

export function ConfirmDialog({
	isOpen,
	onClose,
	onConfirm,
	title,
	description,
	confirmText = "Confirm",
	cancelText = "Cancel",
	variant = "default",
}: ConfirmDialogProps) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="absolute inset-0 bg-black/50" onClick={onClose} />
			<div className="relative mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-950">
				<h2 className="mb-2 text-xl font-semibold">{title}</h2>
				<p className="mb-6 text-gray-600 dark:text-gray-400">{description}</p>

				<div className="flex justify-end gap-3">
					<Button variant="outline" onClick={onClose}>
						{cancelText}
					</Button>
					<Button
						variant={variant}
						onClick={() => {
							onConfirm();
							onClose();
						}}
					>
						{confirmText}
					</Button>
				</div>
			</div>
		</div>
	);
}
