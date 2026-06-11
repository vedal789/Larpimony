import {useState} from 'react';

import '../styles/editor.css';
import { useSprites } from '../lib/sprites';
import { AudioLines, PlayIcon } from 'lucide-react';

export default function SoundTab() {
	const { state, dispatch } = useSprites();
	const sprite = state.sprites.find(s => s.id === state.selectedSpriteId);
	const [audioIDX, setAudioIDX] = useState(0);
	const activeItem = sprite?.data.sounds[audioIDX];
	const updateSound = (id: string, changes: Record<string, unknown>) => {
		if (!sprite) return;
		dispatch({
		type: 'UPDATE_SPRITE',
		id: sprite.id,
		changes: {
			data: {
			...sprite.data,
			sounds: sprite.data.sounds.map((s, j) =>
				j === audioIDX ? { ...s, ...changes } : s
			),
			},
		},
		});
	}
	return (
		<div className="sound-tab">
			<div className="sound-tab-side">
				{
					sprite?.data.sounds.map((s, i) => (
						<button key={i} className={i == audioIDX ? "sound-tab-sound-selected" : "sound-tab-sound"} onClick={() => {
							setAudioIDX(i);
						}}>
							<AudioLines style={{height: "40px", width: "40px"}} />
							<span>{s.name}</span>
						</button>
					))
				}
			</div>
			<div className="sound-tab-editor">
				{
					sprite == undefined || activeItem == undefined ? (
						/* taken from blocklyeditor lol */
						<div style={{
							display: 'flex',
							width: '100%',
							height: '100%',
							alignItems: 'center',
							justifyContent: 'center',
							color: 'var(--text-secondary)',
							fontSize: '13px',
							fontWeight: 500,
							pointerEvents: 'all',
							textAlign: 'center',
							userSelect: 'none',
							boxSizing: 'border-box'
						}}>
							Select a source to view and edit its sounds or select a sound
						</div>
					) : (
						<div className="sound-tab-editor-inner">
							<div className="properties-row" style={{marginRight: '450px'}}>
								<span className="properties-label">Name</span>
								<input
									className="properties-input"
									type="text"
									value={activeItem.name}
									onChange={(e) => {
										updateSound(activeItem.id, { name: e.target.value });
									}}
									onBlur={() => {
										if (activeItem.name.trim() !== '') return;
										updateSound(activeItem.id, { name: "Sound " + (audioIDX + 1) });
									}}
								/>
							</div>

							<div className="audio-preview">
								<div>todo: replace with audio visual like in scratch</div>
							</div>

							<button className="audio-editor-play" onClick={() => {
								window.RUNTIME?.playSound(activeItem.src, false, activeItem.id);
							}}>{/* im gonna have to upgrade the current branch to do this but please change this to a pause icon whil its playing */ <PlayIcon />}</button>
						</div>
					)
				}
			</div>
		</div>
	)
}