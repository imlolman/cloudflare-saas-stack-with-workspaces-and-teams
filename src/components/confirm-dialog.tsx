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
			<div
				className="absolute inset-0 bg-black/50"
				onClick={onClose}
			/>
			<div className="relative bg-white dark:bg-gray-950 rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
				<h2 className="text-xl font-semibold mb-2">{title}</h2>
				<p className="text-gray-600 dark:text-gray-400 mb-6">{description}</p>

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

