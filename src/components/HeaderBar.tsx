import { useState } from 'react';

export default function HeaderBar({ onSeeJS }: { onSeeJS: () => void }) {
	const [projectName, setProjectName] = useState('Untitled Project');

	return (
		<div className="header-bar">
			<div className="header-logo">
				<img src="logo_dark.svg" alt="Antimony Logo" />
			</div>
			<button className="see-js-btn" onClick={onSeeJS}>See JS</button>
			<div className="header-project-name">
				<input
					type="text"
					value={projectName}
					onChange={(e) => setProjectName(e.target.value)}
				/>
			</div>
		</div>
	);
}
