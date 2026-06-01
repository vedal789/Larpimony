import { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';
import 'blockly/blocks';
import * as En from 'blockly/msg/en';
import { initAllBlocks, workspaceConfig } from '../lib/config';
import { useSprites } from '../lib/sprites';

function syncShadowColours(workspace: Blockly.WorkspaceSvg | Blockly.Workspace) {
	for (const block of workspace.getAllBlocks(false)) {
		if (!block.isShadow()) continue;
		const parent = block.getParent();
		if (!parent) continue;
		block.setColour(parent.getColour());
	}
}

function getFlyoutWorkspace(workspace: Blockly.WorkspaceSvg) {
	return workspace.getFlyout()?.getWorkspace() ?? null;
}

export default function BlocklyEditor() {
	const blocklyDivRef = useRef<HTMLDivElement | null>(null);
	const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
	useSprites();

	useEffect(() => {
		const blocklyDiv = blocklyDivRef.current;
		if (!blocklyDiv) return;

		initAllBlocks();
		const locale = En as unknown as { [key: string]: string };
		Blockly.setLocale(locale);

		const workspace = Blockly.inject(blocklyDiv, workspaceConfig);
		workspaceRef.current = workspace;
		syncShadowColours(workspace);

		const flyoutWorkspace = getFlyoutWorkspace(workspace);
		if (flyoutWorkspace) syncShadowColours(flyoutWorkspace);

		const handleWorkspaceChange = () => {
			syncShadowColours(workspace);
			const fw = getFlyoutWorkspace(workspace);
			if (fw) syncShadowColours(fw);
		};

		workspace.addChangeListener(handleWorkspaceChange);
		flyoutWorkspace?.addChangeListener(handleWorkspaceChange);

		const observer = new ResizeObserver(() => Blockly.svgResize(workspace));
		observer.observe(blocklyDiv);

		return () => {
			observer.disconnect();
			workspace.removeChangeListener(handleWorkspaceChange);
			flyoutWorkspace?.removeChangeListener(handleWorkspaceChange);
			workspace.dispose();
		};
	}, []);

	return (
		<div className="blockly-area panel">
			<div ref={blocklyDivRef} className="blockly-container" />
		</div>
	);
}
