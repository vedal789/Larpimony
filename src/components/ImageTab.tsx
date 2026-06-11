import {useState} from 'react';

import '../styles/editor.css';
import { useSprites } from '../lib/sprites';
import { AudioLines, PlayIcon, PauseIcon } from 'lucide-react';

export default function ImageTab() {
	const { state, dispatch } = useSprites();
	const sprite = state.sprites.find(s => s.id === state.selectedSpriteId);
	const [audioIDX, setAudioIDX] = useState(0);
	// @ts-ignore
	const activeItem = sprite?.data.images[audioIDX];
	const updateImage = (id: string, changes: Record<string, unknown>) => {
		if (!sprite) return;
		dispatch({
		type: 'UPDATE_SPRITE',
		id: sprite.id,
		changes: {
			data: {
			...sprite.data,
			// @ts-ignore we already know it will
			images: sprite.data.images.map((s, j) =>
				j === audioIDX ? { ...s, ...changes } : s
			),
			},
		},
		});
	}

	// @ts-ignore
	if(!(sprite?.data.images)){
		return (
				<div style={{
					height: '100%',
					width: '100%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					zIndex: 50,
					color: 'var(--text-secondary)',
					fontSize: '13px',
					fontWeight: 500,
					pointerEvents: 'all',
					textAlign: 'center',
					userSelect: 'none',
					boxSizing: 'border-box'
				}}>
					Text types are not supported for image tab
				</div>
		)
	}

	return (
		<div className="sound-tab">
			<div className="sound-tab-side">
				{
					// @ts-ignore
					sprite?.data.images.map((s, i) => (
						<button key={i} className={i == audioIDX ? "sound-tab-sound-selected" : "sound-tab-sound"} onClick={() => {
							setAudioIDX(i);
						}}>
							<img src={s.src} style={{aspectRatio: "1/1", width: "40px", height: "40px"}} />
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
							Select a source to view and edit its images or select an image
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
										updateImage(activeItem.id, { name: e.target.value });
									}}
									onBlur={() => {
										if (activeItem.name.trim() !== '') return;
										updateImage(activeItem.id, { name: "Image " + (audioIDX + 1) });
									}}
								/>
							</div>
							{/* TODO: replace with actual editor */}
							<img src={activeItem.src} style={{aspectRatio: "1/1", width: "100%", height: "100%"}} />
						</div>
					)
				}
			</div>
		</div>
	)
}