import { useReducer, useState, useMemo } from 'react';
import { SpriteContext, spriteReducer, initialSpriteState } from './lib/sprites';
import HeaderBar from './components/HeaderBar';
import SpritePanel from './components/SpritePanel';
import StageView from './components/StageView';
import BlocklyEditor from './components/BlocklyEditor';
import PropertiesPanel from './components/PropertiesPanel';
import runtime from './lib/runtime';
import './styles/editor.css';

import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
hljs.registerLanguage('javascript', javascript);

export default function App() {
	const [state, dispatch] = useReducer(spriteReducer, initialSpriteState);
	const [showJS, setShowJS] = useState(false);
	const [generatedJS, setGeneratedJS] = useState('');

	const handleSeeJS = () => {
		setGeneratedJS(runtime.compile().trim());
		setShowJS(true);
	};

	const highlightedCode = useMemo(() => {
		if (!generatedJS) return '';
		return hljs.highlight(generatedJS, { language: 'javascript' }).value;
	}, [generatedJS]);

	const lineNumbers = useMemo(() => {
		if (!generatedJS) return [1];
		return generatedJS.split('\n').map((_, i) => i + 1);
	}, [generatedJS]);

	return (
		<SpriteContext.Provider value={{ state, dispatch }}>
			<div className="editor-shell">
				<HeaderBar onSeeJS={handleSeeJS} />
				<BlocklyEditor />
				<div className="right-column">
					<StageView />
					<div className="panel" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflowY: 'auto' }}>
						<PropertiesPanel />
						<SpritePanel />
					</div>
				</div>
			</div>

			{showJS && (
				<div className="modal-overlay" onClick={() => setShowJS(false)}>
					<div className="modal-content" onClick={(e) => e.stopPropagation()}>
						<div className="modal-header">
							<h2>Generated JavaScript</h2>
							<button className="close-modal-btn" onClick={() => setShowJS(false)}>×</button>
						</div>
						<div className="modal-body">
							<div className="code-container">
								<div className="line-numbers">
									{lineNumbers.map(n => <div key={n}>{n}</div>)}
								</div>
								<pre className="code-content" dangerouslySetInnerHTML={{ __html: highlightedCode || '' }} />
							</div>
						</div>
					</div>
				</div>
			)}
		</SpriteContext.Provider>
	);
}