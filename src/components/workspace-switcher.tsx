"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus, Check } from "lucide-react";

interface Workspace {
	id: string;
	name: string;
	slug: string;
	role: string;
}

interface WorkspaceSwitcherProps {
	workspaces: Workspace[];
	currentWorkspaceId?: string;
	onSelectWorkspace: (workspaceId: string) => void;
	onCreateWorkspace: () => void;
}

export function WorkspaceSwitcher({
	workspaces,
	currentWorkspaceId,
	onSelectWorkspace,
	onCreateWorkspace,
}: WorkspaceSwitcherProps) {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId);

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		}

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			return () => document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [isOpen]);

	return (
		<div className="relative" ref={dropdownRef}>
			<Button
				variant="outline"
				onClick={() => setIsOpen(!isOpen)}
				className="w-full justify-between"
			>
				<span className="truncate">
					{currentWorkspace?.name || "Select Workspace"}
				</span>
				<ChevronDown className="ml-2 h-4 w-4 shrink-0" />
			</Button>

			{isOpen && (
				<div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-950 border rounded-lg shadow-lg z-50 overflow-hidden">
					<div className="p-2">
						{workspaces.map((workspace) => (
							<button
								key={workspace.id}
								onClick={() => {
									onSelectWorkspace(workspace.id);
									setIsOpen(false);
								}}
								className="flex items-center justify-between w-full px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800"
							>
								<div className="flex flex-col items-start">
									<span className="font-medium">{workspace.name}</span>
									<span className="text-xs text-gray-500">{workspace.role}</span>
								</div>
								{workspace.id === currentWorkspaceId && (
									<Check className="h-4 w-4" />
								)}
							</button>
						))}
					</div>
					<div className="border-t p-2">
						<button
							onClick={() => {
								onCreateWorkspace();
								setIsOpen(false);
							}}
							className="flex items-center w-full px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800"
						>
							<Plus className="mr-2 h-4 w-4" />
							Create Workspace
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

