import {useState} from 'react';

import '../styles/editor.css';
import { useSprites } from '../lib/sprites';
import { AudioLines, PlayIcon, Plus, PauseIcon } from 'lucide-react';

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
	};
	const readSoundFile = (file: File) => {
		const reader = new FileReader();
		reader.onload = () => {
			const src = String(reader.result ?? '');
			const id = generateMediaSoundId();
			const newSounds = sprite!.data.sounds
			newSounds?.push({
				id,
				name: file.name.replace(/\.[^.]+$/, '') || 'Sound' + (sprite?.data.sounds.length! + 1),
				src,
			});
			// YO THIS SYSTEM HAS CAUSED ME SO MUCH PAIN
			if (sprite?.type === 'media') {
				dispatch(
					{
						type:"UPDATE_SPRITE", 
						id: sprite!.id, 
						changes: {
							data: {
								...sprite!.data,
								sounds: newSounds,
								currentSoundId: id
							}
						}
					}
				);
			} else {
				dispatch(
					{
						type:"UPDATE_SPRITE", 
						id: sprite!.id, 
						changes: {
							data: {
								...sprite!.data,
								sounds: newSounds,
								currentSoundId: id,
							}
						}
					}
				);
			}
		};
		reader.readAsDataURL(file);
	};

	const newSound = () => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'audio/*';
		input.onchange = () => {
			const file = input.files?.[0];
			if (file) readSoundFile(file);
		};
		input.click();
	};
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
				<button className="sound-tab-sound-new" onClick={() => {
					newSound();
				}}>
					<Plus style={{height: "40px", width: "40px"}} />
					<span>Add sound</span>
				</button>
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
							}}>{/* i think this function has a glitch */window.RUNTIME?.isSoundPlaying(activeItem.id) ? <PauseIcon /> :<PlayIcon />}</button>
						</div>
					)
				}
			</div>
		</div>
	)
}