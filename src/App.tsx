import { useReducer } from 'react';
import { SpriteContext, spriteReducer, initialSpriteState } from './lib/sprites';
import HeaderBar from './components/HeaderBar';
import SpritePanel from './components/SpritePanel';
import StageView from './components/StageView';
import BlocklyEditor from './components/BlocklyEditor';
import PropertiesPanel from './components/PropertiesPanel';
import './styles/editor.css';

export default function App() {
	const [state, dispatch] = useReducer(spriteReducer, initialSpriteState);

	return (
		<SpriteContext.Provider value={{ state, dispatch }}>
			<div className="editor-shell">
				<HeaderBar />
				<BlocklyEditor />
				<div className="right-column">
					<StageView />
					<div className="panel" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflowY: 'auto' }}>
						<PropertiesPanel />
						<SpritePanel />
					</div>
				</div>
			</div>
		</SpriteContext.Provider>
	);
}