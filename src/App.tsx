import { useEffect, useRef } from 'react';
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import * as En from 'blockly/msg/en';

import { initAllBlocks, workspaceConfig } from './lib/config';
import './styles/editor.css';

export default function App() {
	const blocklyDivRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const blocklyDiv = blocklyDivRef.current;

		if (!blocklyDiv) {
			return;
		}

		initAllBlocks();
		const locale = En as unknown as {
			[key: string]: string;
		};
		Blockly.setLocale(locale);

		const workspace = Blockly.inject(blocklyDiv, workspaceConfig);

		const handleResize = () => {
			Blockly.svgResize(workspace);
		};

		window.addEventListener('resize', handleResize);
		handleResize();

		return () => {
			window.removeEventListener('resize', handleResize);
			workspace.dispose();
		};
	}, []);

	return (
		<div className="grid-top">
			<div ref={blocklyDivRef} className="blockly-container" />
			<div className="stage">the best thing ever goes here</div>
		</div>
	);
}